import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { contactEmailEnvConfigured, sendContactViaResend } from '$lib/server/contactEmail';

const TOPICS = new Set(['support', 'billing', 'partnership', 'other']);

export const actions: Actions = {
	default: async ({ request }) => {
		if (!contactEmailEnvConfigured()) {
			return fail(503, {
				error:
					'Le formulaire de contact n’est pas encore configuré (vars RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL).'
			});
		}

		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim();
		const email = String(data.get('email') ?? '').trim();
		const topic = String(data.get('topic') ?? '').trim();
		const message = String(data.get('message') ?? '').trim();

		const fieldErrors: Record<string, string> = {};
		if (name.length < 2) fieldErrors.name = 'Indiquez au moins 2 caractères.';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = 'Adresse email invalide.';
		if (!TOPICS.has(topic)) fieldErrors.topic = 'Choisissez un sujet.';
		if (message.length < 10) fieldErrors.message = 'Votre message est trop court (10 caractères minimum).';
		if (message.length > 8000) fieldErrors.message = 'Message trop long (8000 caractères max).';

		if (Object.keys(fieldErrors).length > 0) {
			return fail(400, { fieldErrors, values: { name, email, topic, message } });
		}

		const result = await sendContactViaResend({ name, email, topic, message });
		if (!result.ok) {
			return fail(502, { error: result.message, values: { name, email, topic, message } });
		}

		return { success: true };
	}
};
