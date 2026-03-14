<script lang="ts">
  let {
    id,
    type = 'text',
    value = $bindable(),
    label,
    placeholder,
    min,
    max,
    step,
    className = '',
    disabled = false,
    readonly = false,
    help,
  } = $props<{
    id?: string;
    type?: string;
    value?: string | number;
    label?: string;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    disabled?: boolean;
    readonly?: boolean;
    help?: string;
  }>();
</script>

<div class="flex flex-col">
  {#if label}
  <label class="block text-xs text-slate-600 mb-1" for={id}>{label}</label>
{/if}
<input
  {id}
  type={type}
  placeholder={placeholder}
  class={`w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white ${className}`}
  bind:value
  {min}
  {max}
  {step}
  {disabled}
  {readonly}
/>
{#if help}
    <p class="mt-1 text-xs text-slate-500">{help}</p>
  {/if}
</div>
