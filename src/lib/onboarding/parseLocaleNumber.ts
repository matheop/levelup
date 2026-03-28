/** Interprète une saisie type « 320 000 » ou « 3,85 » en nombre. */
export function parseLocaleNumber(value: string): number {
	const t = value.trim().replace(/\s/g, '').replace(',', '.');
	const n = Number.parseFloat(t);
	return Number.isFinite(n) ? n : 0;
}
