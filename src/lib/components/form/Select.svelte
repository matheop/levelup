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
    <label class="block text-xs text-slate-600 mb-1" for={id}>{label}</label>
  {/if}
  <select
    {id}
    class={`w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white ${className}`}
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
    <p class="mt-1 text-xs text-slate-500">{help}</p>
  {/if}
</div>