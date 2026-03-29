<script lang="ts" module>
	import { SnackbarQueue } from './snackbarQueue.svelte.ts';
	export const snackbarQueue = new SnackbarQueue();
</script>

<script lang="ts">
	import { cubicIn, cubicOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import Snackbar from './Snackbar.svelte';

	const current = $derived(snackbarQueue.current);

	function closeIfOpen() {
		if (snackbarQueue.current) {
			snackbarQueue.close();
		}
	}
</script>

{#if current}
	<div
		class="pointer-events-none fixed bottom-24 left-1/2 z-[45] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 md:bottom-auto md:left-auto md:right-6 md:top-36 md:w-full md:max-w-md md:translate-x-0"
		aria-live="polite"
	>
		<div
			class="pointer-events-auto"
			in:fly={{ x: 80, duration: 300, easing: cubicOut }}
			out:fly={{ x: 80, duration: 300, easing: cubicIn }}
		>
			<Snackbar {...current} handleClose={closeIfOpen} />
		</div>
	</div>
{/if}
