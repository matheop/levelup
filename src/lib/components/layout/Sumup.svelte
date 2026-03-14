<script lang="ts">
    let { title, cost } = $props<{
        title: string;
        cost: number;
    }>();
</script>

<div class="Sumup flex justify-between items-center w-full">
    <span class="font-medium text-slate-700">{title}</span>
    <span class="text-lg font-semibold text-slate-900">{cost.toLocaleString('fr-FR')} €</span>
</div>