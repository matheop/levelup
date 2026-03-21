<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Project } from '$lib/domain';
	import { supabase } from '$lib/supabaseClient';
	import Select from '$lib/components/form/Select.svelte';
	import {
		createProjectFromInputs,
		deleteProject,
		getProjectById,
		listUserProjects,
		updateProjectInputs,
		type ProjectListItem
	} from '$lib/data/projectsApi';
	import {
		ProjectFinancingSection,
		RevenueSection,
		AmortizationAndTaxesSection,
		ChargesAndWorksSection,
		FinancingComparisonSection
	} from '$lib/components/sections';
	import Footer from '$lib/components/layout/Footer.svelte';
	import Header from '$lib/components/layout/Header.svelte';

	let project = $state(Project.createDefault());
	let projects = $state<ProjectListItem[]>([]);
	let selectedProjectId = $state<string>('');
	/** Pour detecter le passage d’un projet sauvegarde vers « Nouveau projet » (value ''). */
	let previousSelectedProjectId = $state<string | null>(null);
	let loadingProjects = $state(false);
	let persistMessage = $state<string | null>(null);
	let persistError = $state<string | null>(null);
	/** Snapshot JSON de `toUserInputs()` au dernier etat « propre » (charge / sauvegarde / nouveau brouillon). */
	let baselineSnapshot = $state<string>('');
	let persisting = $state(false);
	const hasSavedProjects = $derived(projects.length > 0);
	const isPersisted = $derived(project.id != null);
	const hasUnsavedChanges = $derived(
		baselineSnapshot !== '' &&
			JSON.stringify(project.toUserInputs()) !== baselineSnapshot
	);
	const persistDockVisible = $derived(isPersisted || hasUnsavedChanges);

	function commitBaseline() {
		baselineSnapshot = JSON.stringify(project.toUserInputs());
	}

	const simulationResultsByFinancing = $derived(
		project.financings.map((f) => project.simulateForFinancing(f))
	);
	const simulationResult = $derived(
		simulationResultsByFinancing[0] ?? project.simulate()
	);
	const monthlyCashflow = $derived(project.getMonthlyNetCashflow(1));

	const projectOptions = $derived([
		{ value: '', label: 'Nouveau projet' },
		...projects.map((p) => ({
			value: String(p.id),
			label: p.name
		}))
	]);

	async function refreshProjects() {
		loadingProjects = true;
		persistError = null;
		try {
			projects = await listUserProjects();
		} catch (e) {
			persistError = e instanceof Error ? e.message : 'Impossible de charger les projets';
		} finally {
			loadingProjects = false;
		}
	}

	/**
	 * Select « Nouveau projet » ('') : brouillon propre (sans ecraser au premier paint).
	 * Sinon : charge le projet sauvegarde.
	 */
	$effect(() => {
		const id = selectedProjectId;

		if (id === '') {
			if (previousSelectedProjectId !== null && previousSelectedProjectId !== '') {
				project = Project.createDefault(projects.length);
				commitBaseline();
				persistError = null;
				persistMessage = 'Nouveau projet.';
			}
			previousSelectedProjectId = id;
			return;
		}

		previousSelectedProjectId = id;

		if (project.id === id) return;

		persistError = null;

		(async () => {
			try {
				const loaded = await getProjectById(id);
				if (selectedProjectId !== id) return;
				project = Project.fromUserInputs(loaded);
				commitBaseline();
				persistMessage = 'Projet chargé.';
			} catch (e) {
				if (selectedProjectId !== id) return;
				persistError = e instanceof Error ? e.message : 'Erreur lors du chargement';
			}
		})();
	});

	async function saveCurrentProject() {
		persistMessage = null;
		persistError = null;
		persisting = true;
		try {
			const payload = project.toUserInputs();
			if (project.id != null) {
				await updateProjectInputs(project.id, payload);
				persistMessage = 'Projet mis à jour.';
			} else {
				const id = await createProjectFromInputs(payload);
				project.id = id;
				selectedProjectId = String(id);
				persistMessage = 'Projet sauvegardé.';
			}
			await refreshProjects();
			commitBaseline();
		} catch (e) {
			persistError = e instanceof Error ? e.message : 'Erreur lors de la sauvegarde';
		} finally {
			persisting = false;
		}
	}

	async function removeSelectedProject() {
		const deletedId = project.id;
		if (!deletedId) return;
		persistMessage = null;
		persistError = null;
		persisting = true;
		try {
			await deleteProject(deletedId);
			await refreshProjects();
			selectedProjectId = '';
			previousSelectedProjectId = '';
			project = Project.createDefault(projects.length);
			commitBaseline();
			persistMessage = 'Projet supprimé.';
		} catch (e) {
			persistError = e instanceof Error ? e.message : 'Erreur lors de la suppression';
		} finally {
			persisting = false;
		}
	}

	async function signOut() {
		await supabase.auth.signOut();
		await goto('/auth');
	}

	onMount(async () => {
		await refreshProjects();
		// Brouillon initial : nom = nb de projets sauvegardés + 1 une fois la liste connue
		if (project.id == null) {
			project.projectName = Project.defaultProjectName(projects.length);
		}
		commitBaseline();
	});
</script>

<Header
	projectName={project.projectName}
	projectType={project.projectType}
	taxRegime={project.taxRegime}
	onSignOut={signOut}
/>

<main class="max-w-[1920px] mx-auto mb-20 p-4 md:p-6 pb-28 space-y-4 flex flex-col min-h-screen">
	<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
		<div class="flex flex-wrap gap-2 items-end">
			<div class="min-w-[260px] flex-1">
				<Select label="Projet" id="saved-projects" bind:value={selectedProjectId} options={projectOptions} />
			</div>
		</div>
		{#if !loadingProjects && !persistError && !hasSavedProjects}
			<p class="text-sm text-slate-600">
				Aucun projet sauvegardé pour le moment. Saisis un projet puis utilise le panneau en bas a droite
				pour l&apos;enregistrer.
			</p>
		{/if}
		{#if persistMessage}
			<p class="text-sm text-emerald-600">{persistMessage}</p>
		{/if}
		{#if persistError}
			<p class="text-sm text-red-600">{persistError}</p>
		{/if}
	</div>
	<div class="flex-1 overflow-x-auto overflow-y-hidden pb-2" style="min-height: 0;">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6 min-w-0" style="min-width: min(100%, 1200px);">
			<div class="space-y-6 min-w-[320px] overflow-y-auto overflow-x-hidden">
				<ProjectFinancingSection project={project} />
			</div>

			<div class="space-y-6 min-w-[320px] overflow-y-auto overflow-x-hidden">
				<RevenueSection revenue={project.revenue} />
				<AmortizationAndTaxesSection project={project} simulationResult={simulationResult} />
			</div>

			<div class="space-y-6 min-w-[320px] overflow-y-auto overflow-x-hidden">
				<ChargesAndWorksSection project={project} />
			</div>
		</div>
	</div>
	<div class="mt-6 w-full max-w-5xl mx-auto">
		<FinancingComparisonSection
			{project}
			simulationResultsByFinancing={simulationResultsByFinancing}
		/>
	</div>
</main>

<Footer
	monthlyCashflow={monthlyCashflow}
	revenues={project.annualRevenueAfterVacancy}
	totalProjectCost={project.totalProjectCostWithInterest}
	charges={project.annualChargesForCalculation}
	simulationResult={simulationResult}
	loanAmount={project.primaryFinancing.loanAmount}
	loanDuration={project.primaryFinancing.loanDuration}
	persistDock={{
		visible: persistDockVisible,
		isPersisted,
		hasUnsavedChanges,
		onSave: saveCurrentProject,
		onDelete: removeSelectedProject,
		persisting
	}}
/>
