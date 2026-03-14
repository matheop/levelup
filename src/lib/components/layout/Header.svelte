<script lang="ts">
	import type { TaxRegimeName } from '$lib/dbTypes';

	const { projectName, projectType, taxRegime } = $props<{
		projectName: string;
		projectType: 'purchase' | 'renovation_only';
		taxRegime: TaxRegimeName;
	}>();

	const projectTypeLabel = $derived(
		projectType === 'purchase' ? 'Achat + travaux' : 'Travaux seuls'
	);
	const taxRegimeLabel = $derived(
		taxRegime === 'LMNP'
			? 'LMNP'
			: taxRegime === 'NU'
				? 'Location nue'
				: "SCI à l'IS"
	);
</script>

<header
	class="m-4 sticky top-4 z-10 flex-shrink-0 relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 text-white shadow-lg ring-1 ring-slate-700/50 backdrop-blur-sm"
>
	<!-- Subtle grid pattern -->
	<div
		class="pointer-events-none absolute inset-0 opacity-[0.03]"
		style="background-image: linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px); background-size: 24px 24px;"
		aria-hidden="true"
	></div>

	<div class="relative flex flex-wrap items-center gap-3 py-4 px-5 md:gap-5 md:px-6">
		<h1 class="text-lg font-semibold tracking-tight text-white md:text-xl">
			{projectName || 'Sans nom'}
		</h1>

		<div class="flex items-center gap-2 text-slate-400">
			<span class="hidden size-1 rounded-full bg-slate-500 sm:inline" aria-hidden="true"></span>
			<span
				class="rounded-md border border-slate-600/80 bg-slate-700/50 px-2.5 py-1 text-xs font-medium text-slate-200"
			>
				{projectTypeLabel}
			</span>
			<span class="size-1 rounded-full bg-slate-500" aria-hidden="true"></span>
			<span
				class="rounded-md border border-slate-600/80 bg-slate-700/50 px-2.5 py-1 text-xs font-medium text-slate-200"
			>
				{taxRegimeLabel}
			</span>
		</div>
	</div>
</header>
