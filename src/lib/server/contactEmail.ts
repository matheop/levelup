import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';

function escapeHtml(text: string) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export type ContactPayload = {
	name: string;
	email: string;
	topic: string;
	message: string;
};

/** Resend JSON error body (subset). */
type ResendErrorBody = {
	message?: string;
	name?: string;
	statusCode?: number;
};

function parseResendErrorBody(raw: string): ResendErrorBody | null {
	try {
		const o = JSON.parse(raw) as unknown;
		if (typeof o !== 'object' || o === null) return null;
		return o as ResendErrorBody;
	} catch {
		return null;
	}
}

function userFacingResendMessage(status: number, body: ResendErrorBody | null, raw: string): string {
	const msg = (body?.message ?? '').trim();
	const lower = msg.toLowerCase();

	if (
		status === 403 &&
		(lower.includes('only send testing emails') || lower.includes('send testing emails to your own'))
	) {
		return (
			'Resend est encore en mode test : vous ne pouvez envoyer des emails qu’à l’adresse du compte Resend (ou des adresses autorisées). ' +
			'Mettez votre propre email dans CONTACT_TO_EMAIL pour les essais, ou vérifiez un domaine sur resend.com/domains et utilisez un expéditeur @ce-domaine.'
		);
	}

	if (status === 403 && lower.includes('domain is not verified')) {
		return (
			'Le domaine de l’expéditeur (CONTACT_FROM_EMAIL) n’est pas vérifié sur Resend. ' +
			'Ajoutez et vérifiez le domaine dans le tableau Resend, ou utilisez l’expéditeur de test indiqué dans leur documentation.'
		);
	}

	if (status === 401 || (status === 403 && lower.includes('invalid api key'))) {
		return 'La clé API Resend est manquante ou refusée. Vérifiez RESEND_API_KEY dans votre fichier .env.';
	}

	if (lower.includes('invalid `from`') || lower.includes('invalid from') || body?.name === 'invalid_from_address') {
		return (
			'L’adresse d’expédition (CONTACT_FROM_EMAIL) est invalide. ' +
			'Utilisez le format « Nom <email@domaine.fr> » ou « email@domaine.fr », avec un domaine autorisé par Resend.'
		);
	}

	if (status === 429 || lower.includes('quota')) {
		return 'Quota d’envoi Resend atteint. Réessayez plus tard ou consultez votre tableau de bord Resend.';
	}

	if (msg) {
		const suffix = dev ? ` (Resend: ${msg})` : '';
		return "L’envoi a échoué côté messagerie. Réessayez plus tard ou contactez-nous directement par email." + suffix;
	}

	return dev && raw
		? `Échec Resend (${status}). Réponse : ${raw.slice(0, 300)}`
		: "L’envoi a échoué. Réessayez plus tard ou écrivez-nous directement par email.";
}

export function contactEmailEnvConfigured(): boolean {
	return Boolean(
		env.RESEND_API_KEY?.trim() && env.CONTACT_FROM_EMAIL?.trim() && env.CONTACT_TO_EMAIL?.trim()
	);
}

export async function sendContactViaResend(payload: ContactPayload): Promise<{ ok: true } | { ok: false; message: string }> {
	const apiKey = env.RESEND_API_KEY?.trim();
	const from = env.CONTACT_FROM_EMAIL?.trim();
	const to = env.CONTACT_TO_EMAIL?.trim();

	if (!apiKey || !from || !to) {
		return { ok: false, message: 'Configuration email manquante sur le serveur.' };
	}

	const topicLabel: Record<string, string> = {
		support: 'Support technique',
		billing: 'Facturation / abonnement',
		partnership: 'Partenariat',
		other: 'Autre'
	};

	const subject = `[Financial Architect] ${topicLabel[payload.topic] ?? payload.topic} — ${payload.name}`;
	const safeName = escapeHtml(payload.name);
	const safeEmail = escapeHtml(payload.email);
	const safeMessage = escapeHtml(payload.message).replace(/\r\n|\n/g, '<br />');

	const html = `
<p><strong>Nom</strong> : ${safeName}</p>
<p><strong>Email</strong> : ${safeEmail}</p>
<p><strong>Sujet</strong> : ${escapeHtml(topicLabel[payload.topic] ?? payload.topic)}</p>
<hr />
<p><strong>Message</strong></p>
<p>${safeMessage}</p>
	`.trim();

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from,
			to: [to],
			reply_to: payload.email,
			subject,
			html
		})
	});

	const raw = await res.text();
	if (!res.ok) {
		const parsed = parseResendErrorBody(raw);
		console.error('Resend error', { status: res.status, body: parsed ?? raw });
		return { ok: false, message: userFacingResendMessage(res.status, parsed, raw) };
	}

	return { ok: true };
}
