<script lang="ts">
	import type { Snippet } from "svelte";

  type Variant = 'default' | 'muted' | 'success' | 'danger';

  const { title, variant = 'default', infoContent, children, footer, className = '' } = $props<{
    title: string;
    variant?: Variant;
    /** Optional info text; when set, shows a (i) icon that toggles an info panel */
    infoContent?: string;
    hasFooter?: boolean;
    children: Snippet;
    footer?: Snippet;
    className?: string;
  }>();

  let infoOpen = $state(false);

  const variantClasses: Record<Variant, string> = {
    default: 'bg-mauve-50 border-mauve-200',
    muted: 'bg-white border-slate-200',
    success: 'bg-green-50 border-green-200',
    danger: 'bg-red-50 border-red-200'
  };

  const footerBorderClasses: Record<Variant, string> = {
    default: 'border-slate-200',
    muted: 'border-slate-200',
    success: 'border-green-200',
    danger: 'border-red-200'
  };
</script>

<section class={`rounded-xl border p-5 shadow-sm flex-shrink-0 ${variantClasses[variant as Variant]} ${className}`.trim()}>
  <div class="flex items-center gap-2 mb-4">
    <h2 class="text-lg font-medium text-slate-700">{title}</h2>
    {#if infoContent}
      <button
        type="button"
        class="inline-flex items-center justify-center w-5 h-5 rounded-full border border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 transition shrink-0"
        aria-label="Informations"
        aria-expanded={infoOpen}
        onclick={() => (infoOpen = !infoOpen)}
      >
        <span class="text-xs font-semibold leading-none">i</span>
      </button>
    {/if}
  </div>

  {#if infoContent && infoOpen}
    <div class="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 whitespace-pre-line">
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html infoContent}
    </div>
  {/if}

  <div class="space-y-3">
    {@render children()}
  </div>

  {#if footer}
    <div class="mt-3 pt-3 border-t {footerBorderClasses[variant as Variant]}">
      {@render footer()}
    </div>
  {/if}
</section>

