<script lang="ts">
import { goto } from '$app/navigation';
import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import type { TaxRegimeName } from '$lib/dbTypes';
	import { Project } from '$lib/domain';
	import { supabase } from '$lib/supabaseClient';
	import Select from '$lib/components/form/Select.svelte';
	import Button from '$lib/components/ui/Button.svelte';
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
	import { SnackbarManager, pushSnackbar } from '$lib/components/ui/snackbar';

	let project = $state(Project.createDefault());
	let projects = $state<ProjectListItem[]>([]);
	let selectedProjectId = $state<string>('');
	let previousSelectedProjectId = $state<string | null>(null);
	/** Id de la liste pour lequel `project` a été chargé via l’API (évite un refetch ; plus fiable que `project.id` avec la réactivité des classes). */
	let loadedListSelectionId = $state<string | null>(null);
	let loadingProjects = $state(false);
	let baselineSnapshot = $state<string>('');
	let persisting = $state(false);
	const hasSavedProjects = $derived(projects.length > 0);
	const isPersisted = $derived(project.id != null);
	const hasUnsavedChanges = $derived(
		baselineSnapshot !== '' &&
			JSON.stringify(project.toUserInputs()) !== baselineSnapshot
	);
	const persistBarVisible = $derived(isPersisted || hasUnsavedChanges);

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

	function setTaxRegime(regime: TaxRegimeName) {
		project.taxRegime = regime;
	}

	async function refreshProjects() {
		loadingProjects = true;
		try {
			projects = await listUserProjects();
		} catch (e) {
			pushSnackbar({
				variant: 'danger',
				message: e instanceof Error ? e.message : 'Impossible de charger les projets'
			});
		} finally {
			loadingProjects = false;
		}
	}

	$effect(() => {
		const id = selectedProjectId;

		if (id === '') {
			if (previousSelectedProjectId !== null && previousSelectedProjectId !== '') {
				project = Project.createDefault(projects.length);
				commitBaseline();
				pushSnackbar({ variant: 'info', message: 'Nouveau projet.' });
			}
			previousSelectedProjectId = id;
			loadedListSelectionId = null;
			return;
		}

		previousSelectedProjectId = id;

		// Ne pas comparer à project.id : accès peu fiable dans $effect avec instance de classe $state.
		if (loadedListSelectionId === id) return;

		(async () => {
			try {
				const loaded = await getProjectById(id);
				if (selectedProjectId !== id) return;
				project = Project.fromUserInputs(loaded);
				loadedListSelectionId = id;
				commitBaseline();
				pushSnackbar({ variant: 'success', message: 'Projet chargé.' });
			} catch (e) {
				if (selectedProjectId !== id) return;
				loadedListSelectionId = null;
				pushSnackbar({
					variant: 'danger',
					message: e instanceof Error ? e.message : 'Erreur lors du chargement'
				});
			}
		})();
	});

	async function saveCurrentProject() {
		persisting = true;
		try {
			const payload = project.toUserInputs();
			if (project.id != null) {
				await updateProjectInputs(project.id, payload);
				pushSnackbar({ variant: 'success', message: 'Projet mis à jour.' });
			} else {
				const id = await createProjectFromInputs(payload);
				project.id = id;
				selectedProjectId = String(id);
				pushSnackbar({ variant: 'success', message: 'Projet sauvegardé.' });
			}
			await refreshProjects();
			commitBaseline();
		} catch (e) {
			pushSnackbar({
				variant: 'danger',
				message: e instanceof Error ? e.message : 'Erreur lors de la sauvegarde'
			});
		} finally {
			persisting = false;
		}
	}

	/**
	 * Annule les modifications locales : recharge la dernière version en base si le projet est
	 * enregistré, sinon repart d’un brouillon vide (nouveau projet).
	 */
	async function reinitializeProject() {
		persisting = true;
		try {
			if (isPersisted && project.id != null) {
				const loaded = await getProjectById(project.id);
				project = Project.fromUserInputs(loaded);
				commitBaseline();
				pushSnackbar({
					variant: 'success',
					message: 'Données rétablies depuis la dernière sauvegarde.'
				});
			} else {
				project = Project.createDefault(projects.length);
				project.projectName = Project.defaultProjectName(projects.length);
				commitBaseline();
				pushSnackbar({ variant: 'info', message: 'Brouillon réinitialisé.' });
			}
		} catch (e) {
			pushSnackbar({
				variant: 'danger',
				message: e instanceof Error ? e.message : 'Impossible de réinitialiser les données'
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
			selectedProjectId = '';
			previousSelectedProjectId = '';
			project = Project.createDefault(projects.length);
			commitBaseline();
			pushSnackbar({ variant: 'warning', message: 'Projet supprimé.' });
		} catch (e) {
			pushSnackbar({
				variant: 'danger',
				message: e instanceof Error ? e.message : 'Erreur lors de la suppression'
			});
		} finally {
			persisting = false;
		}
	}

	async function signOut() {
		await supabase.auth.signOut();
		await goto(resolve('/auth'));
	}

	onMount(async () => {
		await refreshProjects();
		if (project.id == null) {
			project.projectName = Project.defaultProjectName(projects.length);
		}
		commitBaseline();
	});
</script>

<div class="sticky top-0 z-40 border-b border-fa-outline-variant/15 bg-fa-surface">
	<Header
		projectName={project.projectName}
		projectType={project.projectType}
		taxRegime={project.taxRegime}
		onSignOut={signOut}
		onTaxRegimeChange={setTaxRegime}
	/>
	<div
		class="flex flex-col gap-3 border-t border-fa-outline-variant/10 bg-fa-surface-low px-5 py-3 md:flex-row md:items-center md:justify-between md:px-8"
	>
		<div class="flex flex-wrap items-center gap-3">
			<span class="text-[10px] font-medium tracking-widest text-fa-outline uppercase">Projet :</span>
			<div class="min-w-[200px] max-w-md flex-1">
				<Select id="saved-projects" bind:value={selectedProjectId} options={projectOptions} />
			</div>
			<Button
				variant="transparent"
				tone="default"
				size="icon"
				ariaLabel="Nouveau projet"
				className="rounded-lg text-fa-outline hover:!bg-fa-surface-high hover:!text-fa-primary-container"
				onClick={() => (selectedProjectId = '')}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
					<circle cx="12" cy="12" r="10" />
					<path d="M12 8v8M8 12h8" />
				</svg>
			</Button>
		</div>
		{#if persistBarVisible}
			<div
				class="flex flex-wrap items-center gap-2 rounded-xl bg-fa-surface-lowest p-1 shadow-sm ring-1 ring-fa-outline-variant/20"
			>
				{#if hasUnsavedChanges}
					<Button
						variant="transparent"
						tone="default"
						size="md"
						disabled={persisting}
						title={isPersisted
							? 'Recharge la dernière version enregistrée en base (annule les changements non sauvegardés)'
							: 'Efface le brouillon et repart d’un projet vide'}
						className="!rounded-lg !px-3 !py-2 !font-bold"
						onClick={reinitializeProject}
					>
						<span class="hidden sm:inline">Réinitialiser</span>
						<span class="sm:hidden">Réinit.</span>
					</Button>
					<div class="hidden h-4 w-px bg-fa-outline-variant/30 sm:block" aria-hidden="true"></div>
					{#if isPersisted}
						<Button
							variant="outline"
							tone="success"
							label="Sauvegarder"
							disabled={persisting}
							className="!rounded-lg !border-transparent hover:!bg-fa-secondary/10"
							onClick={saveCurrentProject}
						/>
					{:else}
						<Button
							variant="filled"
							tone="success"
							label="Sauvegarder le projet"
							disabled={persisting}
							className="!rounded-lg"
							onClick={saveCurrentProject}
						/>
					{/if}
				{/if}
				{#if isPersisted}
					<div class="hidden h-4 w-px bg-fa-outline-variant/30 sm:block" aria-hidden="true"></div>
					<Button
						variant="transparent"
						tone="danger"
						size="md"
						disabled={persisting}
						className="!flex !items-center !gap-2 !rounded-lg !px-3 !py-2 !font-bold"
						onClick={removeSelectedProject}
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
							<path d="M3 6h18" />
							<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
							<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
						</svg>
						<span class="hidden sm:inline">Supprimer</span>
					</Button>
				{/if}
			</div>
		{/if}
	</div>
</div>

<SnackbarManager />

<main class="mx-auto flex min-h-screen max-w-[1600px] flex-col px-5 pb-40 pt-8 md:px-8">
	{#if !loadingProjects && !hasSavedProjects}
		<p class="mb-4 text-sm text-fa-on-surface-variant">
			Aucun projet sauvegardé pour le moment. Saisis un projet puis enregistre-le depuis la barre ci-dessus.
		</p>
	{/if}

	<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
		<div id="fa-col-project" class="min-w-0 space-y-4 scroll-mt-28">
			<PropertySection {project} />
			<CostSection {project} />
			<FinancingSection {project} />
		</div>

		<div id="fa-col-revenue" class="min-w-0 space-y-4 scroll-mt-28">
			<RevenueSection revenue={project.revenue} />
			<AmortizationTaxesSection project={project} simulationResult={simulationResult} />
		</div>

		<div id="fa-col-charges" class="min-w-0 space-y-4 scroll-mt-28">
			<ChargesSection {project} />
			<FutureWorksSection {project} />
		</div>
	</div>

	<div class="mt-10 w-full">
		<FinancingComparisonSection {project} simulationResultsByFinancing={simulationResultsByFinancing} />
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
/>
