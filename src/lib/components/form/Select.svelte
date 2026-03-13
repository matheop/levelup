<script lang="ts">
  type Option = { value: string; label: string };

  let {
    id,
    value = $bindable<string>(),
    options,
    placeholder,
    className = ''
  } = $props<{
    id?: string;
    value?: string;
    options: Option[];
    placeholder?: string;
    className?: string;
  }>();
</script>

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

