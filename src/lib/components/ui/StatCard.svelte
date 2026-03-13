<script lang="ts">
  type Size = 'sm' | 'lg';
  type Trend = 'neutral' | 'positive' | 'negative';

  const {
    label,
    value,
    sublabel,
    size = 'lg',
    trend = 'neutral',
    align = 'left'
  } = $props<{
    label: string;
    value: string;
    sublabel?: string;
    size?: Size;
    trend?: Trend;
    align?: 'left' | 'center';
  }>();

  const sizeClasses: Record<Size, string> = {
    sm: 'px-3 py-2 text-sm',
    lg: 'p-4'
  };

  const trendClasses: Record<Trend, string> = {
    neutral: 'bg-slate-50 border-slate-200 text-slate-800',
    positive: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    negative: 'bg-rose-50 border-rose-200 text-rose-800'
  };
</script>

<div
  class={`rounded-lg border ${sizeClasses[size as Size]} ${trendClasses[trend as Trend]} ${
    align === 'center' ? 'text-center' : ''
  }`}
>
  <p class="text-sm text-slate-500 mb-0.5">{label}</p>
  <p class="text-xl font-semibold">{value}</p>
  {#if sublabel}
    <p class="text-xs text-slate-500 mt-1">{sublabel}</p>
  {/if}
</div>

