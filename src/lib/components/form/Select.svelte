<script lang="ts">
  type Option = { value: string; label: string };

  let {
    id,
    value = $bindable<string>(),
    options,
    placeholder,
    className = '',
    label,
    help,
  } = $props<{
    id?: string;
    value?: string;
    options: Option[];
    placeholder?: string;
    className?: string;
    label?: string;
    help?: string;
  }>();
</script>

<div class={`flex flex-col ${className}`}>
  {#if label}
    <label class="block text-xs font-medium text-fa-on-surface-variant mb-1 uppercase tracking-wider" for={id}>{label}</label>
  {/if}
  <select
    {id}
    class={`w-full rounded-lg border border-fa-outline-variant/50 bg-fa-surface-lowest px-3 py-2 text-fa-on-surface focus:border-fa-primary-fixed focus:outline-none focus:ring-1 focus:ring-fa-primary-fixed ${className}`}
    bind:value
  >
    {#if placeholder}
      <option value="">{placeholder}</option>
    {/if}
    {#each options as option (option.value)}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
  {#if help}
    <p class="mt-1 text-xs text-fa-outline">{help}</p>
  {/if}
</div>