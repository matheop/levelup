<script lang="ts">
	const { title, infoContent, className = '' } = $props<{
		title: string;
		/** Optional info text; when set, shows a (i) icon that toggles an info panel */
		infoContent?: string;
		/** Optional class for the wrapper (e.g. pt-4 border-t border-slate-200 for spacing after previous block) */
		className?: string;
	}>();

	let infoOpen = $state(false);
</script>

<div class="flex flex-col {className}">
	<div class="flex items-center gap-2 mb-2">
		<h3 class="text-sm font-semibold text-slate-600">{title}</h3>
		{#if infoContent}
			<button
				type="button"
				class="inline-flex items-center justify-center w-5 h-5 rounded-full border border-slate-300/80 bg-white/80 text-slate-500 shadow-sm hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 transition shrink-0"
				aria-label="Informations"
				aria-expanded={infoOpen}
				onclick={() => (infoOpen = !infoOpen)}
			>
				<span class="text-xs font-semibold leading-none">i</span>
			</button>
		{/if}
	</div>

	{#if infoContent && infoOpen}
		<div
			class="mb-3 rounded-lg border border-slate-200/80 bg-white/60 p-3 text-sm text-slate-700 shadow-inner whitespace-pre-line backdrop-blur-[0.5px]"
		>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html infoContent}
		</div>
	{/if}
</div>
