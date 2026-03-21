import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createProjectsRepository } from '$lib/server/projectsRepository';
import { parseProjectIdParam } from '$lib/server/projectId';

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	const id = parseProjectIdParam(params.id);
	if (!id) return json({ error: 'Invalid project id' }, { status: 400 });

	try {
		const projectsRepo = createProjectsRepository(locals.supabase);
		const data = await projectsRepo.getProjectById(id);
		return json(data);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to get project';
		return json({ error: message }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ locals, params, request }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	const id = parseProjectIdParam(params.id);
	if (!id) return json({ error: 'Invalid project id' }, { status: 400 });

	try {
		const projectsRepo = createProjectsRepository(locals.supabase);
		const payload = await request.json();
		await projectsRepo.updateProjectInputs(id, payload);
		return json({ ok: true });
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to update project';
		return json({ error: message }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	const id = parseProjectIdParam(params.id);
	if (!id) return json({ error: 'Invalid project id' }, { status: 400 });

	try {
		const projectsRepo = createProjectsRepository(locals.supabase);
		await projectsRepo.deleteProject(id);
		return json({ ok: true });
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to delete project';
		return json({ error: message }, { status: 500 });
	}
};
