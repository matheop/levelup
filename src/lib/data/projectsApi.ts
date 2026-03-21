import type { ProjectUserInputs } from '$lib/domain/Project.svelte';

export interface ProjectListItem {
	id: string;
	name: string;
	updated_at: string;
}

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
	const data = await response.json();
	if (!response.ok) {
		throw new Error((data as { error?: string })?.error ?? 'Request failed');
	}
	return data as T;
}

export async function listUserProjects(): Promise<ProjectListItem[]> {
	const response = await fetch('/api/projects');
	return parseJsonOrThrow<ProjectListItem[]>(response);
}

export async function createProjectFromInputs(
	inputs: ProjectUserInputs
): Promise<string> {
	const response = await fetch('/api/projects', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(inputs)
	});
	const data = await parseJsonOrThrow<{ id: string }>(response);
	return data.id;
}

export async function updateProjectInputs(
	projectId: string,
	inputs: ProjectUserInputs
): Promise<void> {
	const response = await fetch(`/api/projects/${projectId}`, {
		method: 'PUT',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(inputs)
	});
	await parseJsonOrThrow<{ ok: boolean }>(response);
}

export async function getProjectById(id: string): Promise<ProjectUserInputs> {
	const response = await fetch(`/api/projects/${id}`);
	return parseJsonOrThrow<ProjectUserInputs>(response);
}

export async function deleteProject(id: string): Promise<void> {
	const response = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
	await parseJsonOrThrow<{ ok: boolean }>(response);
}
