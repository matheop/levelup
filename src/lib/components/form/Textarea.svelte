<script lang="ts">
	let {
		id,
		value = $bindable<string>(),
		label,
		placeholder,
		name,
		rows = 5,
		required = false,
		disabled = false,
		className = '',
		textareaClassName = '',
		help
	} = $props<{
		id?: string;
		value?: string;
		label?: string;
		placeholder?: string;
		name?: string;
		rows?: number;
		required?: boolean;
		disabled?: boolean;
		className?: string;
		textareaClassName?: string;
		help?: string;
	}>();
</script>

<div class={`flex flex-col space-y-2 ${className}`}>
	{#if label}
		<label class="ml-1 block text-sm font-bold text-fa-on-surface-variant" for={id}>{label}</label>
	{/if}

	<textarea
		{id}
		{name}
		{placeholder}
		{rows}
		{required}
		{disabled}
		class={`min-h-[8rem] w-full resize-y rounded-t-xl border-0 border-b-2 border-transparent bg-fa-surface-low px-4 py-4 font-sans text-fa-on-surface placeholder:text-fa-outline/50 transition focus:border-fa-primary-fixed focus:outline-none focus:ring-0 ${textareaClassName}`}
		bind:value
	></textarea>

	{#if help}
		<p class="ml-1 text-xs text-fa-outline">{help}</p>
	{/if}
</div>
