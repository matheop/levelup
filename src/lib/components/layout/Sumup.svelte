<script lang="ts">
	let { title, cost } = $props<{
		title: string;
		cost: number;
	}>();
</script>

<div class="Sumup flex w-full items-center justify-between">
	<span class="font-medium text-fa-on-surface-variant">{title}</span>
	<span class="text-lg font-semibold text-fa-on-surface">{cost.toLocaleString('fr-FR')} €</span>
</div>
