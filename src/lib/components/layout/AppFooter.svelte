<script lang="ts">
  const { monthlyCashflow, firstYearNet, totalInvestment } = $props<{
    monthlyCashflow: number;
    firstYearNet: number;
    totalInvestment: number;
  }>();
</script>

<footer class="fixed inset-x-0 bottom-0 z-10 border-t border-slate-700 bg-slate-800 text-white px-5 py-3 shadow-lg">
  <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-12">
    <div class="text-center">
      <p class="text-slate-400 text-sm">Cash-flow mensuel (an 1)</p>
      <p class="text-lg font-semibold {monthlyCashflow >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
        {monthlyCashflow.toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} €
      </p>
    </div>
    <span class="text-slate-500 hidden md:inline">|</span>
    <div class="text-center">
      <p class="text-slate-400 text-sm">Cash-flow annuel (an 1)</p>
      <p class="text-lg font-semibold {firstYearNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
        {firstYearNet.toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} €
      </p>
    </div>
    <span class="text-slate-500 hidden md:inline">|</span>
    <div class="text-center">
      <p class="text-slate-400 text-sm">Coût total du projet</p>
      <p class="text-lg font-semibold text-white">
        {totalInvestment.toLocaleString('fr-FR')} €
      </p>
    </div>
  </div>
</footer>

