<script lang="ts">
	import type { Snippet } from "svelte";

  const { id, label, help, className = '', children } = $props<{
    id?: string;
    label: string;
    help?: string;
    className?: string;
    children: Snippet;
  }>();
</script>

<div class={`flex flex-col ${className}`}>
  <label class="block text-xs text-slate-600 mb-1" for={id}>{label}</label>
  {@render children()}
  {#if help}
    <p class="mt-1 text-xs text-slate-500">{help}</p>
  {/if}
</div>

