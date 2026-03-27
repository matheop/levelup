<script lang="ts">
	import { modal } from './Modal.svelte';
</script>

{#if modal.activeComponent}
	{#await modal.activeComponent then Module}
		{@const ComponentModal = Module.default}
		<ComponentModal
			{...(modal.activeModal?.props ?? {})}
			onClose={() => modal.pop()}
		/>
	{/await}
{/if}
