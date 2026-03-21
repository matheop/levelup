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
  <label class="block text-xs font-medium text-fa-on-surface-variant mb-1 uppercase tracking-wider" for={id}>{label}</label>
{/if}
<input
  {id}
  type={type}
  placeholder={placeholder}
  class={`w-full rounded-lg border border-fa-outline-variant/50 bg-fa-surface-lowest px-3 py-2 text-fa-on-surface focus:border-fa-primary-fixed focus:outline-none focus:ring-1 focus:ring-fa-primary-fixed ${className}`}
  bind:value
  {min}
  {max}
  {step}
  {disabled}
  {readonly}
/>
{#if help}
    <p class="mt-1 text-xs text-fa-outline">{help}</p>
  {/if}
</div>
