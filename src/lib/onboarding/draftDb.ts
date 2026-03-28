import Dexie, { type Table } from 'dexie';
import { browser } from '$app/environment';
import type { ProjectUserInputs } from '$lib/domain/Project.svelte';

export const ONBOARDING_DRAFT_SCHEMA_VERSION = 1;
export const ONBOARDING_DRAFT_ID = 'current';

export interface OnboardingDraftRecord {
	id: string;
	updatedAt: number;
	schemaVersion: number;
	payload: ProjectUserInputs;
}

class OnboardingDraftDexie extends Dexie {
	drafts!: Table<OnboardingDraftRecord, string>;

	constructor() {
		super('levelup-onboarding');
		this.version(1).stores({
			drafts: 'id'
		});
	}
}

let dbInstance: OnboardingDraftDexie | null = null;

function getDb(): OnboardingDraftDexie | null {
	if (!browser) return null;
	if (!dbInstance) dbInstance = new OnboardingDraftDexie();
	return dbInstance;
}

export async function loadOnboardingDraft(): Promise<OnboardingDraftRecord | undefined> {
	const db = getDb();
	if (!db) return undefined;
	return db.drafts.get(ONBOARDING_DRAFT_ID);
}

export async function saveOnboardingDraft(payload: ProjectUserInputs): Promise<void> {
	const db = getDb();
	if (!db) return;
	await db.drafts.put({
		id: ONBOARDING_DRAFT_ID,
		updatedAt: Date.now(),
		schemaVersion: ONBOARDING_DRAFT_SCHEMA_VERSION,
		payload
	});
}

/** Brouillon à importer sur le dashboard (client uniquement). */
export async function getOnboardingDraftPayload(): Promise<ProjectUserInputs | null> {
	const row = await loadOnboardingDraft();
	return row?.payload ?? null;
}

export async function clearOnboardingDraft(): Promise<void> {
	const db = getDb();
	if (!db) return;
	await db.drafts.delete(ONBOARDING_DRAFT_ID);
}
