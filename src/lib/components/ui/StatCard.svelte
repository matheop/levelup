<script lang="ts">
	type Size = 'sm' | 'lg';
	type Trend = 'neutral' | 'positive' | 'negative' | 'info';

	const {
		label,
		value,
		sublabel,
		size = 'lg',
		trend = 'neutral',
		align = 'left'
	} = $props<{
		label: string;
		value: string;
		sublabel?: string;
		size?: Size;
		trend?: Trend;
		align?: 'left' | 'center';
	}>();

	const sizeClasses: Record<Size, string> = {
		sm: 'px-3 py-2 text-sm',
		lg: 'p-4'
	};

	const trendClasses: Record<Trend, string> = {
		neutral: 'bg-fa-surface-low border-fa-outline-variant/40 text-fa-on-surface',
		info: 'bg-indigo-50 border-indigo-200 text-indigo-800',
		positive: 'bg-green-50 border-green-200 text-green-800',
		negative: 'bg-red-50 border-red-200 text-red-800'
	};

	const labelSizeClass = $derived(size === 'sm' ? 'text-xs' : 'text-sm');
	const valueSizeClass = $derived(size === 'sm' ? 'text-base' : 'text-xl');
</script>

<div
	class="rounded-lg border {sizeClasses[size as Size]} {trendClasses[trend as Trend]} {align === 'center'
		? 'text-center'
		: ''}"
>
	<p class="{labelSizeClass} mb-0.5 text-fa-outline">{label}</p>
	<p class="{valueSizeClass} font-semibold">{value}</p>
	{#if sublabel}
		<p class="mt-1 text-xs text-fa-outline">{sublabel}</p>
	{/if}
</div>
