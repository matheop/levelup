<script lang="ts">
	import { goto, replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';
	import { Project } from '$lib/domain';
	import { supabase } from '$lib/supabaseClient';
	import {
		createProjectFromInputs,
		deleteProject,
		getProjectById,
		listUserProjects,
		updateProjectInputs,
		type ProjectListItem
	} from '$lib/data/projectsApi';
	import {
		PropertySection,
		CostSection,
		FinancingSection,
		RevenueSection,
		AmortizationTaxesSection,
		ChargesSection,
		FutureWorksSection,
		FinancingComparisonSection
	} from '$lib/components/sections';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';
	import Subheader from '$lib/components/layout/Subheader.svelte';
	import { SnackbarManager, snackbarQueue } from '$lib/components/ui/snackbar';
	import { modal } from '$lib/components/ui/modal/Modal.svelte';
	import { clearOnboardingDraft, getOnboardingDraftPayload } from '$lib/onboarding';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();

	const isAuthenticated = $derived(data.isAuthenticated);

	const NEW_PROJECT_PARAM = 'new';

	let project = $state(Project.createDefault());
	let projects = $state<ProjectListItem[]>([]);
	let selectedProjectId = $state<string>(NEW_PROJECT_PARAM);
	let previousSelectedProjectId = $state<string | null>(null);
	let loadedListSelectionId = $state<string | null>(null);
	let loadingProjects = $state(false);
	let baselineSnapshot = $state<string>('');
	let persisting = $state(false);
	const hasSavedProjects = $derived(projects.length > 0);
	const isPersisted = $derived(project.id != null);
	const hasUnsavedChanges = $derived(
		baselineSnapshot !== '' && JSON.stringify(project.toUserInputs()) !== baselineSnapshot
	);

	function commitBaseline() {
		baselineSnapshot = JSON.stringify(project.toUserInputs());
	}

	function getProjectParamFromUrl(): string | null {
		if (typeof window === 'undefined') return null;
		return new URL(window.location.href).searchParams.get('project');
	}

	function replaceDashboardProjectParam(projectParam: string): void {
		if (typeof window === 'undefined') return;
		const currentUrl = new URL(window.location.href);
		const current = currentUrl.searchParams.get('project');
		if (current === projectParam) return;
		const nextHref = `${resolve('/dashboard')}?project=${encodeURIComponent(projectParam)}`;
		/* eslint-disable-next-line svelte/no-navigation-without-resolve -- query string on resolved base */
		goto(nextHref, { replaceState: true });
	}

	async function syncSelectionFromUrlOrFallback() {
		const param = getProjectParamFromUrl();
		const hasProjectParam = param != null;

		if (param === NEW_PROJECT_PARAM) {
			selectedProjectId = NEW_PROJECT_PARAM;
			return;
		}

		if (param && projects.some((p) => String(p.id) === param)) {
			selectedProjectId = param;
			return;
		}

		if (projects.length > 0) {
			const mostRecentId = String(projects[0].id);
			selectedProjectId = mostRecentId;
			replaceDashboardProjectParam(mostRecentId);
			if (hasProjectParam && param !== mostRecentId) {
				snackbarQueue.add({
					variant: 'warning',
					title: 'Projet demandé introuvable',
					text: 'Ouverture du projet le plus récent.'
				});
			}
			return;
		}

		selectedProjectId = NEW_PROJECT_PARAM;
		replaceDashboardProjectParam(NEW_PROJECT_PARAM);
	}

	const simulationResultsByFinancing = $derived(
		project.financings.map((f) => project.simulateForFinancing(f))
	);
	const simulationResult = $derived(simulationResultsByFinancing[0] ?? project.simulate());
	const monthlyCashflow = $derived(project.getMonthlyNetCashflow(1));

	const projectOptions = $derived(
		projects.map((p) => ({
			value: String(p.id),
			label: p.name
		}))
	);

	async function refreshProjects() {
		loadingProjects = true;
		try {
			projects = await listUserProjects();
		} catch (e) {
			snackbarQueue.add({
				variant: 'danger',
				title: e instanceof Error ? e.message : 'Impossible de charger les projets'
			});
		} finally {
			loadingProjects = false;
		}
	}

	$effect(() => {
		const id = selectedProjectId;

		void replaceDashboardProjectParam(id);

		if (id === NEW_PROJECT_PARAM) {
			if (previousSelectedProjectId !== null && previousSelectedProjectId !== NEW_PROJECT_PARAM) {
				project = Project.createDefault(projects.length);
				project.projectName = Project.defaultProjectName(projects.length);
				commitBaseline();
				snackbarQueue.add({ variant: 'info', title: 'Nouveau projet.' });
			}
			previousSelectedProjectId = id;
			loadedListSelectionId = null;
			return;
		}

		previousSelectedProjectId = id;

		if (loadedListSelectionId === id) return;

		(async () => {
			try {
				const loaded = await getProjectById(id);
				if (selectedProjectId !== id) return;
				project = Project.fromUserInputs(loaded);
				loadedListSelectionId = id;
				commitBaseline();
				snackbarQueue.add({ variant: 'success', title: 'Projet chargé.' });
			} catch (e) {
				if (selectedProjectId !== id) return;
				loadedListSelectionId = null;
				snackbarQueue.add({
					variant: 'danger',
					title: e instanceof Error ? e.message : 'Erreur lors du chargement'
				});
				void syncSelectionFromUrlOrFallback();
			}
		})();
	});

	async function saveCurrentProject() {
		persisting = true;
		try {
			const payload = project.toUserInputs();
			if (project.id != null) {
				await updateProjectInputs(project.id, payload);
				snackbarQueue.add({ variant: 'success', title: 'Projet mis à jour.' });
			} else {
				const id = await createProjectFromInputs(payload);
				project.id = id;
				selectedProjectId = String(id);
				snackbarQueue.add({ variant: 'success', title: 'Projet sauvegardé.' });
			}
			await refreshProjects();
			commitBaseline();
		} catch (e) {
			snackbarQueue.add({
				variant: 'danger',
				title: e instanceof Error ? e.message : 'Erreur lors de la sauvegarde'
			});
		} finally {
			persisting = false;
		}
	}

	async function reinitializeProject() {
		persisting = true;
		try {
			if (isPersisted && project.id != null) {
				const loaded = await getProjectById(project.id);
				project = Project.fromUserInputs(loaded);
				commitBaseline();
				snackbarQueue.add({
					variant: 'success',
					title: 'Données rétablies depuis la dernière sauvegarde.'
				});
			} else {
				project = Project.createDefault(projects.length);
				project.projectName = Project.defaultProjectName(projects.length);
				commitBaseline();
				snackbarQueue.add({ variant: 'info', title: 'Brouillon réinitialisé.' });
			}
		} catch (e) {
			snackbarQueue.add({
				variant: 'danger',
				title: e instanceof Error ? e.message : 'Impossible de réinitialiser les données'
			});
		} finally {
			persisting = false;
		}
	}

	async function removeSelectedProject() {
		const deletedId = project.id;
		if (!deletedId) return;
		persisting = true;
		try {
			await deleteProject(deletedId);
			await refreshProjects();
			if (projects.length > 0) {
				selectedProjectId = String(projects[0].id);
			} else {
				selectedProjectId = NEW_PROJECT_PARAM;
			}
			loadedListSelectionId = null;
			snackbarQueue.add({ variant: 'success', title: 'Projet supprimé.' });
		} catch (e) {
			snackbarQueue.add({
				variant: 'danger',
				title: e instanceof Error ? e.message : 'Erreur lors de la suppression'
			});
		} finally {
			persisting = false;
		}
	}

	async function signOut() {
		await supabase.auth.signOut();
		await goto(resolve('/auth'));
	}

	async function autoImportDexieDraft(): Promise<string | null> {
		try {
			const payload = await getOnboardingDraftPayload();
			if (!payload) return null;
			const id = await createProjectFromInputs(payload);
			await clearOnboardingDraft();
			return String(id);
		} catch (e) {
			snackbarQueue.add({
				variant: 'danger',
				title: e instanceof Error ? e.message : 'Erreur lors de l\u2019import du brouillon'
			});
			return null;
		}
	}

	let registerTimer: ReturnType<typeof setTimeout> | undefined;
	onDestroy(() => clearTimeout(registerTimer));

	onMount(async () => {
		if (!isAuthenticated) {
			const payload = await getOnboardingDraftPayload();
			if (!payload) {
				await goto(resolve('/onboarding'));
				return;
			}
			project = Project.fromUserInputs(payload);
			commitBaseline();

			registerTimer = setTimeout(() => {
				modal.push('registerProject');
			}, 3000);
			return;
		}

		const importedId = await autoImportDexieDraft();

		await refreshProjects();

		if (importedId) {
			selectedProjectId = importedId;
			replaceDashboardProjectParam(importedId);
			snackbarQueue.add({
				variant: 'success',
				title: 'Brouillon importé et sauvegardé en base.'
			});
			return;
		}

		await syncSelectionFromUrlOrFallback();

		const url = new URL(window.location.href);

		if (selectedProjectId === NEW_PROJECT_PARAM) {
			project = Project.createDefault(projects.length);
			project.projectName = Project.defaultProjectName(projects.length);
			commitBaseline();
		}

		if (url.searchParams.has('from')) {
			url.searchParams.delete('from');
			const q = url.searchParams.toString();
			/* eslint-disable-next-line svelte/no-navigation-without-resolve -- query string on resolved base */
			replaceState(`${resolve('/dashboard')}${q ? `?${q}` : ''}`, window.history.state);
		}
	});
</script>

<div class="sticky top-0 z-40 border-b border-fa-outline-variant/15 bg-fa-surface">
	<Header {isAuthenticated} onSignOut={signOut} />
	<Subheader
		bind:selectedProjectId
		projectOptions={projectOptions}
		projectName={project.projectName}
		{hasUnsavedChanges}
		{isPersisted}
		{persisting}
		{isAuthenticated}
		onNewProject={() => (selectedProjectId = NEW_PROJECT_PARAM)}
		onSave={saveCurrentProject}
		onReinitialize={reinitializeProject}
		onRemove={removeSelectedProject}
	/>
</div>

<SnackbarManager />

<main class="mx-auto flex min-h-screen max-w-[1600px] flex-col px-5 pt-8 pb-40 md:px-8">
	{#if isAuthenticated && !loadingProjects && !hasSavedProjects}
		<p class="mb-4 text-sm text-fa-on-surface-variant">
			Aucun projet sauvegardé pour le moment. Saisis un projet puis enregistre-le depuis la barre
			ci-dessus.
		</p>
	{/if}

	<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
		<div id="fa-col-project" class="min-w-0 scroll-mt-28 space-y-4">
			<PropertySection {project} />
			<CostSection {project} />
			<FinancingSection {project} />
		</div>

		<div id="fa-col-revenue" class="min-w-0 scroll-mt-28 space-y-4">
			<RevenueSection revenue={project.revenue} />
			<AmortizationTaxesSection {project} {simulationResult} />
		</div>

		<div id="fa-col-charges" class="min-w-0 scroll-mt-28 space-y-4">
			<ChargesSection {project} />
			<FutureWorksSection {project} />
		</div>
	</div>

	<div class="mt-10 w-full">
		<FinancingComparisonSection {project} {simulationResultsByFinancing} />
	</div>
</main>

<Footer
	{monthlyCashflow}
	revenues={project.annualRevenueAfterVacancy}
	totalProjectCost={project.totalProjectCostWithInterest}
	charges={project.annualChargesForCalculation}
	{simulationResult}
	loanAmount={project.primaryFinancing.loanAmount}
	loanDuration={project.primaryFinancing.loanDuration}
/>
