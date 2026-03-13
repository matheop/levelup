<script lang="ts">
  import type { TaxRegimeName } from '$lib/dbTypes';

  const { projectName, projectType, taxRegime } = $props<{
    projectName: string;
    projectType: 'purchase' | 'renovation_only';
    taxRegime: TaxRegimeName;
  }>();
</script>

<header class="flex-shrink-0 rounded-xl border border-slate-200 bg-slate-800 text-white px-5 py-4 shadow-sm">
  <div class="flex flex-wrap items-center gap-4 md:gap-8">
    <h1 class="text-xl font-semibold">{projectName || 'Sans nom'}</h1>
    <span class="text-slate-300">|</span>
    <span class="text-sm md:text-base">
      {projectType === 'purchase' ? 'Achat + travaux' : 'Travaux seuls'}
    </span>
    <span class="text-slate-300">|</span>
    <span class="text-sm md:text-base">
      {taxRegime === 'LMNP'
        ? 'LMNP'
        : taxRegime === 'NU'
          ? 'Location nue'
          : "SCI à l'IS"}
    </span>
  </div>
</header>

