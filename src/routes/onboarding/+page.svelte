<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { Project } from '$lib/domain';
	import { supabase } from '$lib/supabaseClient';
	import { createProjectFromInputs } from '$lib/data/projectsApi';
	import {
		createOnboardingInitialPayload,
		loadOnboardingDraft,
		saveOnboardingDraft,
		clearOnboardingDraft,
		getStepMeta,
		ONBOARDING_STEP_COUNT,
		parseOnboardingStepParam
	} from '$lib/onboarding';
	import Shell from '$lib/components/onboarding/Shell.svelte';
	import Progress from '$lib/components/onboarding/Progress.svelte';
	import ProjectStep from '$lib/components/onboarding/steps/ProjectStep.svelte';
	import CostsStep from '$lib/components/onboarding/steps/CostsStep.svelte';
	import FinancingStep from '$lib/components/onboarding/steps/FinancingStep.svelte';
	import RevenueChargesStep from '$lib/components/onboarding/steps/RevenueChargesStep.svelte';
	import FutureWorksStep from '$lib/components/onboarding/steps/FutureWorksStep.svelte';
	import { SnackbarManager, snackbarQueue } from '$lib/components/ui/snackbar';

	let project = $state<Project | null>(null);
	let draftReady = $state(false);

	const step = $derived(parseOnboardingStepParam(page.url.searchParams.get('step')));
	const meta = $derived(getStepMeta(step));

	onMount(async () => {
		const row = await loadOnboardingDraft();
		if (row?.payload) {
			project = Project.fromUserInputs(row.payload);
		} else {
			project = Project.fromUserInputs(createOnboardingInitialPayload());
		}
		draftReady = true;
	});

	let saveTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		if (!browser || !draftReady || !project) return;
		void project.toUserInputs();
		clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			void saveOnboardingDraft(project!.toUserInputs());
		}, 400);
		return () => clearTimeout(saveTimer);
	});

	function validateCurrentStep(): boolean {
		if (!project) return false;
		if (step === 1) {
			if (!project.projectName.trim()) {
				snackbarQueue.add({ variant: 'warning', title: 'Indique un nom de projet.' });
				return false;
			}
		}
		if (step === 3) {
			const p = project.primaryFinancing;
			if (p.loanAmount > 0) {
				if (p.loanDuration < 1) {
					snackbarQueue.add({
						variant: 'warning',
						title: 'Durée du prêt principal invalide (minimum 1 an).'
					});
					return false;
				}
				if (p.interestRate < 0 || p.interestRate > 0.5) {
					snackbarQueue.add({
						variant: 'warning',
						title: 'Vérifie le taux nominal du prêt principal (raisonnable entre 0 et 50 %).'
					});
					return false;
				}
			}
		}
		return true;
	}

	async function handleBack() {
		if (step <= 1) return;
		/* eslint-disable-next-line svelte/no-navigation-without-resolve -- query string on resolved base */
		await goto(`${resolve('/onboarding')}?step=${step - 1}`, {
			replaceState: true,
			noScroll: true
		});
	}

	async function handleForward() {
		if (!validateCurrentStep()) return;
		if (!project) return;

		if (step < ONBOARDING_STEP_COUNT) {
			/* eslint-disable-next-line svelte/no-navigation-without-resolve -- query string on resolved base */
			await goto(`${resolve('/onboarding')}?step=${step + 1}`, {
				replaceState: true,
				noScroll: true
			});
			return;
		}

		const payload = project.toUserInputs();
		const { data: sessionData } = await supabase.auth.getSession();

		if (sessionData.session) {
			try {
				const id = await createProjectFromInputs(payload);
				await clearOnboardingDraft();
				/* eslint-disable-next-line svelte/no-navigation-without-resolve -- query string on resolved base */
				await goto(`${resolve('/dashboard')}?project=${encodeURIComponent(id)}`);
			} catch {
				await saveOnboardingDraft(payload);
				/* eslint-disable-next-line svelte/no-navigation-without-resolve -- query string on resolved base */
				await goto(`${resolve('/dashboard')}?project=new&from=onboarding`);
			}
		} else {
			await saveOnboardingDraft(payload);
			/* eslint-disable-next-line svelte/no-navigation-without-resolve -- query string on resolved base */
			await goto(`${resolve('/dashboard')}?from=onboarding`);
		}
	}

	const forwardLabel = $derived(
		step >= ONBOARDING_STEP_COUNT ? 'Découvrir la simulation' : 'Suivant'
	);
</script>

<svelte:head>
	<title>Financial Architect | Assistant projet</title>
</svelte:head>

{#if !draftReady || !project || !meta}
	<main class="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6 pt-24 pb-40">
		<p class="text-fa-on-surface-variant">Chargement du brouillon…</p>
	</main>
{:else}
	<SnackbarManager />
	<Shell
		showBack={step > 1}
		backDisabled={false}
		forwardDisabled={false}
		{forwardLabel}
		onBack={handleBack}
		onForward={handleForward}
	>
		<main class="mx-auto max-w-4xl px-6">
			<Progress currentStep={step} totalSteps={ONBOARDING_STEP_COUNT} sectionTitle={meta.title} />

			{#if step === 1}
				<ProjectStep {project} />
			{:else if step === 2}
				<CostsStep {project} />
			{:else if step === 3}
				<FinancingStep {project} />
			{:else if step === 4}
				<RevenueChargesStep {project} />
			{:else}
				<FutureWorksStep {project} />
			{/if}
		</main>
	</Shell>
{/if}
