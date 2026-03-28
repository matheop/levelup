<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'success' | 'info' | 'danger' | 'warning';
	/** `rounded` aligné header landing ; `pill` pour pastilles type coin de carte. */
	type Shape = 'rounded' | 'pill';

	let {
		variant = 'default',
		shape = 'rounded',
		label,
		className = '',
		children
	} = $props<{
		variant?: Variant;
		shape?: Shape;
		label?: string;
		className?: string;
		children?: Snippet;
	}>();

	const variantClasses: Record<Variant, string> = {
		default: 'bg-fa-surface-high text-fa-primary-container',
		success: 'bg-fa-secondary-container text-fa-on-secondary-container',
		info: 'bg-fa-primary-fixed text-fa-primary-container',
		danger: 'bg-fa-error-container text-fa-error',
		warning: 'bg-amber-100 text-amber-950 ring-1 ring-amber-300/50'
	};

	const shapeClasses: Record<Shape, string> = {
		rounded: 'rounded-md px-2 py-0.5',
		pill: 'rounded-full px-3 py-1'
	};

	const mergedClass = $derived(
		`inline-flex items-center justify-center text-[10px] font-extrabold tracking-widest uppercase ${shapeClasses[shape as Shape]} ${variantClasses[variant as Variant]} ${className}`.trim()
	);
</script>

<span class={mergedClass}>
	{#if children}
		{@render children()}
	{:else if label != null}
		{label}
	{/if}
</span>
