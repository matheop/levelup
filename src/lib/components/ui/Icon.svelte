<script lang="ts">
	type IconName = 'trash';

	const { name, size = 16, className = '' } = $props<{
		name: IconName;
		size?: number;
		className?: string;
	}>();
</script>

{#if name === 'trash'}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.8"
		stroke-linecap="round"
		stroke-linejoin="round"
		class={className}
		style="width: {size}px; height: {size}px;"
		aria-hidden="true"
	>
		<path d="M3 6h18" />
		<path d="M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6" />
		<path d="M9 10v7" />
		<path d="M15 10v7" />
		<path d="M5.5 6 6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l.5-13" />
	</svg>
{/if}
