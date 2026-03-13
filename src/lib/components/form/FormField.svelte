<script lang="ts">
  const { id, label, help, className = '' } = $props<{
    id?: string;
    label: string;
    help?: string;
    className?: string;
  }>();
</script>

<div class={`flex flex-col ${className}`}>
  <label class="block text-sm text-slate-600 mb-1" for={id}>{label}</label>
  <slot />
  {#if help}
    <p class="mt-1 text-xs text-slate-500">{help}</p>
  {/if}
</div>

