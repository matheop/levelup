export type SnackVariant = 'info' | 'success' | 'warning' | 'danger';

export type SnackItem = {
	id: string;
	variant: SnackVariant;
	message: string;
	/** `null` = fermeture uniquement manuelle (bouton X). Sinon durée en ms. */
	durationMs: number | null;
};

export type PushSnackOptions = {
	message: string;
	variant: SnackVariant;
	/**
	 * Durée avant fermeture automatique. Défaut : 5000 ms.
	 * Passer `null` pour une snackbar uniquement fermable via le bouton X.
	 */
	durationMs?: number | null;
};

/**
 * File d’attente partagée (réactive). Ne pas réassigner : utiliser `pushSnackbar` / `dismissCurrentSnackbar`.
 */
export const snackbarQueue = $state<SnackItem[]>([]);

export function pushSnackbar(opts: PushSnackOptions): void {
	const durationMs = opts.durationMs === undefined ? 5000 : opts.durationMs;
	snackbarQueue.push({
		id: crypto.randomUUID(),
		variant: opts.variant,
		message: opts.message,
		durationMs
	});
}

/** Retire la snackbar en tête de file (affichage séquentiel). */
export function dismissCurrentSnackbar(): void {
	snackbarQueue.shift();
}
