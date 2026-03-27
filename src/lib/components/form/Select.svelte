<script lang="ts">
	type Option = { value: string; label: string };

	let {
		id,
		value = $bindable<string>(),
		options,
		placeholder,
		label,
		help,
		name,
		required = false,
		disabled = false,
		className = '',
		selectClassName = ''
	} = $props<{
		id?: string;
		value?: string;
		options: Option[];
		placeholder?: string;
		label?: string;
		help?: string;
		name?: string;
		required?: boolean;
		disabled?: boolean;
		className?: string;
		selectClassName?: string;
	}>();
</script>

<div class={`flex flex-col space-y-2 ${className}`}>
	{#if label}
		<label class="ml-1 block text-sm font-bold text-fa-on-surface-variant" for={id}>{label}</label>
	{/if}

	<select
		{id}
		{name}
		class={`w-full rounded-t-xl border-0 border-b-2 border-transparent bg-fa-surface-low px-4 py-4 font-sans text-fa-on-surface transition focus:border-fa-primary-fixed focus:outline-none focus:ring-0 ${selectClassName}`}
		bind:value
		{required}
		{disabled}
	>
		{#if placeholder}
			<option value="" disabled>{placeholder}</option>
		{/if}
		{#each options as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>

	{#if help}
		<p class="ml-1 text-xs text-fa-outline">{help}</p>
	{/if}
</div>