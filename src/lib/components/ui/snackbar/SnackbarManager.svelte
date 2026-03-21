<script lang="ts">
	import { snackbarQueue, dismissCurrentSnackbar } from './snackbarQueue.svelte.ts';
	import Snackbar from './Snackbar.svelte';

	let timeoutId = $state<ReturnType<typeof setTimeout> | null>(null);

	const current = $derived(snackbarQueue[0] ?? null);

	$effect(() => {
		if (timeoutId != null) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		const c = current;
		if (!c) return;
		if (c.durationMs === null) return;
		timeoutId = setTimeout(() => {
			timeoutId = null;
			dismissCurrentSnackbar();
		}, c.durationMs);
		return () => {
			if (timeoutId != null) {
				clearTimeout(timeoutId);
				timeoutId = null;
			}
		};
	});

	function handleDismiss() {
		if (timeoutId != null) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
		dismissCurrentSnackbar();
	}
</script>

<!-- Desktop : sous le header (z-40), en haut à droite. Mobile : bas centré, au-dessus du footer. -->
{#if current}
	<div
		class="pointer-events-none fixed bottom-24 left-1/2 z-[35] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 md:bottom-auto md:left-auto md:right-6 md:top-36 md:w-full md:max-w-md md:translate-x-0"
		aria-live="polite"
	>
		<div class="pointer-events-auto">
			<Snackbar
				item={current}
				showClose={current.durationMs === null}
				onDismiss={handleDismiss}
			/>
		</div>
	</div>
{/if}
