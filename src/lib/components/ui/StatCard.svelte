<script lang="ts">
  type Size = 'sm' | 'lg';
  type Trend = 'neutral' | 'positive' | 'negative' | 'info';

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
    info: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    positive: 'bg-green-50 border-green-200 text-green-800',
    negative: 'bg-red-50 border-red-200 text-red-800'
  };
</script>

<div
  class={`rounded-lg border ${sizeClasses[size as Size]} ${trendClasses[trend as Trend]} ${
    align === 'center' ? 'text-center' : ''
  }`}
>
  <p class="text-{size === 'sm' ? 'xs' : 'sm'} text-slate-500 mb-0.5">{label}</p>
  <p class="text-{size === 'sm' ? 'base' : 'xl'} font-semibold">{value}</p>
  {#if sublabel}
    <p class="text-xs text-slate-500 mt-1">{sublabel}</p>
  {/if}
</div>

