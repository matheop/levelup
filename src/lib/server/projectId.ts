/** Validates a route param as a PostgreSQL uuid string (hex + dashes). */
const UUID_RE =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseProjectIdParam(value: string): string | null {
	const trimmed = value.trim();
	return UUID_RE.test(trimmed) ? trimmed : null;
}
