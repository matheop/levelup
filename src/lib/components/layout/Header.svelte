<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { TaxRegimeName } from '$lib/dbTypes';
	import Button from '$lib/components/ui/Button.svelte';
	import Label from '$lib/components/ui/Label.svelte';

	const { projectName, projectType, taxRegime, isAuthenticated = true, onSignOut } = $props<{
		projectName: string;
		projectType: 'purchase' | 'renovation_only';
		taxRegime: TaxRegimeName;
		isAuthenticated?: boolean;
		onSignOut?: () => void | Promise<void>;
		onTaxRegimeChange?: (regime: TaxRegimeName) => void;
	}>();

	const projectTypeLabel = $derived(
		projectType === 'purchase' ? 'Achat + travaux' : 'Travaux seuls'
	);

	const taxRegimeLabel = $derived(
		taxRegime === 'LMNP' ? 'LMNP' : taxRegime === 'NU' ? 'Location nue' : "SCI à l'IS"
	);
</script>

<header
	class="Header flex w-full flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-fa-outline-variant/15 bg-fa-surface px-5 py-4 md:px-8"
>
	<div class="flex min-w-0 flex-wrap items-center gap-4 md:gap-6">
		<span class="text-xl font-extrabold tracking-tight text-fa-primary-container"
			>Financial Architect</span
		>
		<div class="hidden h-6 w-px bg-fa-outline-variant/30 sm:block" aria-hidden="true"></div>
		<div class="flex min-w-0 flex-wrap items-center gap-2 md:gap-3">
			<h1 class="truncate text-sm font-bold tracking-tight text-fa-primary-container md:text-base">
				{projectName || 'Sans nom'}
			</h1>
			<Label variant="default" label={projectTypeLabel} />
			<Label variant="success" label={taxRegimeLabel} />
		</div>
	</div>

	{#if isAuthenticated}
		{#if onSignOut}
			<Button
				variant="filled"
				tone="default"
				label="Déconnexion"
				className="!px-4 !font-bold !tracking-tight"
				onClick={() => onSignOut?.()}
			/>
		{/if}
	{:else}
		<Button
			variant="filled"
			tone="success"
			label="Enregistrer le projet"
			className="!px-4 !font-bold !tracking-tight"
			onClick={() => goto(resolve('/auth'))}
		/>
	{/if}
</header>
