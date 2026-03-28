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
		help,
		/** Unité ou libellé court affiché à droite dans le champ (€, %, ans…). */
		suffix,
		/** Mode contrôlé : valeur affichée. À utiliser avec `onValueInput` si le bind direct n’est pas possible. */
		displayValue,
		onValueInput
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
		suffix?: string;
		displayValue?: string | number;
		onValueInput?: (event: Event & { currentTarget: HTMLInputElement }) => void;
	}>();

	const isControlled = $derived(onValueInput != null);

	const suffixPad = $derived(!suffix ? '' : suffix.length <= 2 ? 'pr-10' : 'pr-[4.75rem]');

	const baseInputClass =
		'w-full rounded-t-xl border-0 border-b-2 border-transparent bg-fa-surface-low px-4 py-4 font-sans text-fa-on-surface placeholder:text-fa-outline/50 transition focus:border-fa-primary-fixed focus:outline-none focus:ring-0';

	const fieldClass = $derived(
		`${baseInputClass}${suffix ? ` ${suffixPad}` : ''} ${inputClassName}`.trim()
	);
</script>

<div class={`flex flex-col space-y-2 ${className}`}>
	{#if label}
		<label class="ml-1 block text-sm font-bold text-fa-on-surface-variant" for={id}>{label}</label>
	{/if}

	{#if suffix}
		<div class="relative">
			{#if isControlled}
				<input
					{id}
					{name}
					{type}
					{placeholder}
					{autocomplete}
					class={fieldClass}
					value={displayValue ?? ''}
					oninput={onValueInput}
					{min}
					{max}
					{step}
					{required}
					{disabled}
					{readonly}
				/>
			{:else}
				<input
					{id}
					{name}
					{type}
					{placeholder}
					{autocomplete}
					class={fieldClass}
					bind:value
					{min}
					{max}
					{step}
					{required}
					{disabled}
					{readonly}
				/>
			{/if}
			<span
				class="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 font-medium text-fa-outline"
				>{suffix}</span
			>
		</div>
	{:else if isControlled}
		<input
			{id}
			{name}
			{type}
			{placeholder}
			{autocomplete}
			class={fieldClass}
			value={displayValue ?? ''}
			oninput={onValueInput}
			{min}
			{max}
			{step}
			{required}
			{disabled}
			{readonly}
		/>
	{:else}
		<input
			{id}
			{name}
			{type}
			{placeholder}
			{autocomplete}
			class={fieldClass}
			bind:value
			{min}
			{max}
			{step}
			{required}
			{disabled}
			{readonly}
		/>
	{/if}

	{#if help}
		<p class="ml-1 text-xs text-fa-outline">{help}</p>
	{/if}
</div>
