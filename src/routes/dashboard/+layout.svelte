<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import ModalHandler from '$lib/components/ui/modal/ModalHandler.svelte';
	import type { ModalRegistry } from '$lib/components/ui/modal/Modal.svelte';
	import { modal } from '$lib/components/ui/modal/Modal.svelte';

	let { children } = $props();

	const modalRegistry = {
		property: () => import('$lib/components/sections/modals/PropertyModal.svelte'),
		cost: () => import('$lib/components/sections/modals/CostModal.svelte'),
		financing: () => import('$lib/components/sections/modals/FinancingModal.svelte'),
		revenue: () => import('$lib/components/sections/modals/RevenueModal.svelte'),
		amortizationTaxes: () =>
			import('$lib/components/sections/modals/AmortizationTaxesModal.svelte'),
		charges: () => import('$lib/components/sections/modals/ChargesModal.svelte'),
		futureWorks: () => import('$lib/components/sections/modals/FutureWorksModal.svelte')
	} as const;

	modal.init(modalRegistry as unknown as ModalRegistry);

	afterNavigate(() => {
		modal.clear();
	});
</script>

{@render children()}
<ModalHandler />
