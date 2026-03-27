<script lang="ts">
	let {
		id,
		type = 'text',
		value = $bindable<string | number>(),
		label,
		placeholder,
		min,
		max,
		step,
		name,
		autocomplete,
		required = false,
		className = '',
		inputClassName = '',
		disabled = false,
		readonly = false,
		help
	} = $props<{
		id?: string;
		type?: string;
		value?: string | number;
		label?: string;
		placeholder?: string;
		min?: number;
		max?: number;
		step?: number;
		name?: string;
		autocomplete?: string;
		required?: boolean;
		className?: string;
		inputClassName?: string;
		disabled?: boolean;
		readonly?: boolean;
		help?: string;
	}>();
</script>

<div class={`flex flex-col space-y-2 ${className}`}>
	{#if label}
		<label class="ml-1 block text-sm font-bold text-fa-on-surface-variant" for={id}>{label}</label>
	{/if}

	<input
		{id}
		{name}
		{type}
		{placeholder}
		{autocomplete}
		class={`w-full rounded-t-xl border-0 border-b-2 border-transparent bg-fa-surface-low px-4 py-4 font-sans text-fa-on-surface placeholder:text-fa-outline/50 transition focus:border-fa-primary-fixed focus:outline-none focus:ring-0 ${inputClassName}`}
		bind:value
		{min}
		{max}
		{step}
		{required}
		{disabled}
		{readonly}
	/>

	{#if help}
		<p class="ml-1 text-xs text-fa-outline">{help}</p>
	{/if}
</div>
