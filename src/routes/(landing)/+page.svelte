<script lang="ts">
	import { resolve } from '$app/paths';
	import Footer from '$lib/components/landing/Footer.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Header from '$lib/components/landing/Header.svelte';

	const strategyCards = [
		{
			title: 'LMNP & Nu-Propriete',
			description:
				'Basculez entre location meublée et nue en un clic, avec amortissements intégrés.'
		},
		{
			title: "SCI a l'IS ou l'IR",
			description:
				'Gérez vos structures sociétales en intégrant charges, fiscalité et dividendes.'
		},
		{
			title: 'Holding & Reinvestissement',
			description:
				'Projetez la remontée de trésorerie vers une holding et votre capacité de réinvestissement.'
		}
	];
</script>

<svelte:head>
	<title>Financial Architect | L'immobilier, conçu avec précision</title>
</svelte:head>

<div class="bg-fa-surface text-fa-on-surface">
	<Header />	

	<main class="pt-16">
		<section id="simulateur" class="relative overflow-hidden py-20 md:py-28">
			<div class="absolute inset-0 opacity-20">
				<div
					class="h-full w-full"
					style="background-image: radial-gradient(#d3e4fe 1px, transparent 1px); background-size: 32px 32px;"
				></div>
			</div>
			<div class="relative mx-auto grid w-full max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
				<div class="space-y-8">
					<p
						class="inline-flex items-center gap-2 rounded-full bg-fa-surface-high px-3 py-1 text-xs font-bold tracking-widest text-fa-primary-container uppercase"
					>
						<span class="h-2 w-2 rounded-full bg-fa-secondary"></span>
						Ingénierie Patrimoniale - 100% Gratuit
					</p>
					<h1 class="text-5xl font-extrabold leading-tight tracking-tighter text-fa-primary-container md:text-7xl">
						L'immobilier,<br />
						<span class="bg-gradient-to-r from-fa-primary-container to-fa-secondary bg-clip-text text-transparent">
							conçu avec précision.
						</span>
					</h1>
					<p class="max-w-xl text-lg leading-relaxed text-fa-on-surface-variant">
						Testez la viabilité de vos projets LMNP, SCI ou Holding avant d'acquérir. Simulez
						vos amortissements, financements et cash-flow en quelques clics.
					</p>
					<div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
						<a href={resolve('/onboarding')}>
							<Button variant="filled" tone="default" size="xl" className="group w-full sm:w-auto">
								<span>Commencer ma simulation gratuite</span>
								<span class="transition-transform group-hover:translate-x-1">→</span>
							</Button>
						</a>
						<span class="text-xs font-bold tracking-widest text-fa-secondary uppercase">
							Accès libre et sans engagement
						</span>
					</div>
				</div>
				<div class="relative">
					<div class="rounded-[2rem] bg-gradient-to-br from-fa-primary-container/20 to-transparent p-2">
						<div
							class="aspect-[4/3] rounded-[1.5rem] border-4 border-fa-surface-lowest bg-gradient-to-br from-[#1f6976] via-[#0a4d5f] to-[#0a1d37] shadow-2xl"
						></div>
					</div>
					<div class="absolute -bottom-6 -left-6 max-w-[220px] rounded-xl bg-fa-surface-lowest p-5 shadow-lg">
						<p class="text-[10px] font-bold tracking-widest text-fa-outline uppercase">Rendement Net</p>
						<p class="mt-1 text-3xl font-extrabold tracking-tight text-fa-secondary">8.62%</p>
						<div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-fa-surface-low">
							<div class="h-full w-3/4 bg-fa-secondary"></div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section id="fonctionnalites" class="bg-fa-surface-low py-24">
			<div class="mx-auto w-full max-w-7xl px-6">
				<div class="mb-16">
					<h2 class="text-sm font-bold tracking-[0.2em] text-fa-secondary uppercase">
						Un seul simulateur pour tout
					</h2>
					<p class="mt-4 text-4xl font-extrabold tracking-tight text-fa-primary-container">
						Une interface unique. Des possibilités infinies.
					</p>
				</div>
				<div class="grid grid-cols-1 gap-8 md:grid-cols-3">
					{#each strategyCards as card, idx (card.title)}
						<article
							class="rounded-xl bg-fa-surface-lowest p-8 shadow-sm ring-1 ring-fa-outline-variant/15"
						>
							<div class="mb-5 h-12 w-12 rounded-lg bg-fa-surface-high"></div>
							<h3 class="text-xl font-bold text-fa-primary-container">{card.title}</h3>
							<p class="mt-3 text-sm leading-relaxed text-fa-on-surface-variant">{card.description}</p>
							<span
								class="mt-5 inline-block rounded px-2 py-0.5 text-[10px] font-extrabold tracking-widest uppercase {idx === 2
									? 'bg-fa-secondary-container text-fa-on-secondary-container'
									: 'bg-fa-primary-fixed text-fa-primary-container'}"
							>
								Inclus
							</span>
						</article>
					{/each}
				</div>
			</div>
		</section>

		<section class="py-24">
			<div class="mx-auto w-full max-w-7xl px-6">
				<div class="mb-14 text-center">
					<h2 class="text-4xl font-extrabold tracking-tight text-fa-primary-container md:text-5xl">
						Dashboard Projet : Visualisez votre succès.
					</h2>
				</div>
				<div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
					<div class="rounded-3xl bg-fa-primary-container p-1 shadow-2xl lg:col-span-8">
						<div class="rounded-[1.4rem] bg-fa-surface-lowest p-6">
							<div class="grid grid-cols-3 gap-4">
								<div class="rounded-xl bg-fa-surface-low p-4">
									<p class="text-[10px] font-bold tracking-widest text-fa-outline uppercase">Cash-flow</p>
									<p class="text-2xl font-extrabold text-fa-secondary">+ 450,20 EUR</p>
								</div>
								<div class="rounded-xl bg-fa-surface-low p-4">
									<p class="text-[10px] font-bold tracking-widest text-fa-outline uppercase">TRI 10 ans</p>
									<p class="text-2xl font-extrabold text-fa-primary-container">12,8%</p>
								</div>
								<div class="rounded-xl bg-fa-surface-low p-4">
									<p class="text-[10px] font-bold tracking-widest text-fa-outline uppercase">Impot moyen</p>
									<p class="text-2xl font-extrabold text-fa-error">0,00 EUR</p>
								</div>
							</div>
							<div class="mt-6 flex h-52 items-end gap-3 rounded-xl bg-fa-surface-low p-4">
								<div class="h-24 w-full rounded-t-lg bg-fa-primary-container/10"></div>
								<div class="h-36 w-full rounded-t-lg bg-fa-primary-container/20"></div>
								<div class="h-32 w-full rounded-t-lg bg-fa-secondary"></div>
								<div class="h-40 w-full rounded-t-lg bg-fa-primary-container/30"></div>
								<div class="h-20 w-full rounded-t-lg bg-fa-primary-container/10"></div>
							</div>
						</div>
					</div>
					<div class="flex flex-col gap-6 lg:col-span-4">
						<div class="flex-1 rounded-3xl bg-fa-secondary-container p-8">
							<h4 class="text-xl font-bold text-fa-on-secondary-container">Analyse comparative</h4>
							<p class="mt-2 text-sm text-fa-on-secondary-container/80">
								Comparez des scénarios côte à côte.
							</p>
						</div>
						<div class="flex-1 rounded-3xl bg-fa-primary-container p-8 text-white">
							<h4 class="text-xl font-bold">Rapport PDF Pro</h4>
							<p class="mt-2 text-sm text-white/70">
								Exportez un dossier complet pour votre banquier ou associé en un clic.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="py-24">
			<div class="mx-auto w-full max-w-7xl px-6">
				<div class="relative overflow-hidden rounded-[2.5rem] bg-fa-primary-container px-8 py-14 text-center md:px-16">
					<div class="space-y-6">
						<h2 class="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
							Prêt à optimiser votre prochain investissement ?
						</h2>
						<p class="mx-auto max-w-2xl text-lg text-white/70">
							Rejoignez les investisseurs qui bâtissent leur patrimoine sur des fondations solides.
						</p>
						<a href={resolve('/onboarding')}>
							<Button variant="filled" tone="success" size="xl" label="Créer un compte gratuit" />
						</a>
					</div>
				</div>
			</div>
		</section>
	</main>

	<Footer />
</div>
