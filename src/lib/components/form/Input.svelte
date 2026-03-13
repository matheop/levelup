<script lang="ts">
  let {
    id,
    type = 'text',
    value = $bindable(),
    placeholder,
    min,
    max,
    step,
    className = '',
    disabled = false,
    readonly = false
  } = $props<{
    id?: string;
    type?: string;
    value?: string | number;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    disabled?: boolean;
    readonly?: boolean;
  }>();
</script>

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

