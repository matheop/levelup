<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, className = '' } = $props<{
		children: Snippet;
		className?: string;
	}>();
</script>

<div
	class="StepCard relative rounded-xl border border-fa-outline-variant/15 bg-fa-surface-lowest p-6 shadow-[0_8px_32px_rgba(10,29,55,0.04)] md:p-8 {className}"
>
	{@render children()}
</div>
