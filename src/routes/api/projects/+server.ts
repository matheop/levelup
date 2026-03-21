import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createProjectsRepository } from '$lib/server/projectsRepository';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const projectsRepo = createProjectsRepository(locals.supabase);
		const data = await projectsRepo.listUserProjects();
		return json(data);
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to list projects';
		return json({ error: message }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const projectsRepo = createProjectsRepository(locals.supabase);
		const payload = await request.json();
		const id = await projectsRepo.createProjectFromInputs(payload, locals.user.id);
		return json({ id });
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Failed to create project';
		return json({ error: message }, { status: 500 });
	}
};
