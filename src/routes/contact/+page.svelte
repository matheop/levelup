<script lang="ts">
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import Footer from '$lib/components/landing/Footer.svelte';
	import Header from '$lib/components/landing/Header.svelte';
	import Input from '$lib/components/form/Input.svelte';
	import Select from '$lib/components/form/Select.svelte';
	import Textarea from '$lib/components/form/Textarea.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { form } = $props<{ form?: ActionData }>();

	const topicOptions = [
		{ value: 'support', label: 'Support technique' },
		{ value: 'billing', label: 'Facturation / abonnement' },
		{ value: 'partnership', label: 'Partenariat' },
		{ value: 'other', label: 'Autre' }
	];

	let submitting = $state(false);

	let name = $state('');
	let email = $state('');
	let topic = $state('');
	let message = $state('');

	$effect(() => {
		const v = form?.values;
		if (v) {
			name = v.name ?? '';
			email = v.email ?? '';
			topic = v.topic ?? '';
			message = v.message ?? '';
		}
	});
</script>

<svelte:head>
	<title>Contact & support | Financial Architect</title>
	<meta name="description" content="Écrivez à l’équipe Financial Architect pour toute question sur le simulateur ou le support." />
</svelte:head>

<div class="bg-fa-surface text-fa-on-surface">
	<Header />

	<main class="pt-24 pb-20">
		<div class="mx-auto w-full max-w-xl px-6">
			<header class="mb-10 space-y-3 text-center">
				<h1 class="text-2xl font-extrabold tracking-tight text-fa-primary-container md:text-3xl">
					Contact & support
				</h1>
				<p class="text-sm leading-relaxed text-fa-outline">
					Une question sur le simulateur, un bug ou une proposition ? Envoyez-nous un message, nous vous répondrons
					dès que possible.
				</p>
			</header>

			{#if form?.success}
				<div
					role="status"
					class="mb-8 rounded-xl border border-fa-secondary/40 bg-fa-secondary-container/30 px-4 py-4 text-sm text-fa-on-surface"
				>
					<p class="font-bold text-fa-primary-container">Message envoyé</p>
					<p class="mt-1 text-fa-outline">
						Merci ! Nous avons bien reçu votre demande. Pensez à vérifier vos courriers indésirables si vous ne
						voyez pas notre réponse.
					</p>
					<p class="mt-3">
						<a href={resolve('/')} class="text-sm font-bold text-fa-primary-container underline hover:no-underline">
							Retour à l’accueil
						</a>
					</p>
				</div>
			{:else}
				<form
					method="POST"
					class="space-y-6"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							await update();
							submitting = false;
						};
					}}
				>
					{#if form?.error}
						<div
							role="alert"
							class="rounded-xl border border-fa-error-container/50 bg-fa-error-container/15 px-4 py-3 text-sm text-fa-on-surface"
						>
							{form.error}
						</div>
					{/if}

					<div class="space-y-1">
						<Input
							id="contact-name"
							name="name"
							autocomplete="name"
							label="Nom"
							placeholder="Votre nom"
							bind:value={name}
							required
							disabled={submitting}
						/>
						{#if form?.fieldErrors?.name}
							<p class="ml-1 text-xs text-fa-error-container">{form.fieldErrors.name}</p>
						{/if}
					</div>

					<div class="space-y-1">
						<Input
							id="contact-email"
							name="email"
							type="email"
							autocomplete="email"
							label="Email"
							placeholder="vous@exemple.fr"
							bind:value={email}
							required
							disabled={submitting}
						/>
						{#if form?.fieldErrors?.email}
							<p class="ml-1 text-xs text-fa-error-container">{form.fieldErrors.email}</p>
						{/if}
					</div>

					<div class="space-y-1">
						<Select
							id="contact-topic"
							name="topic"
							label="Sujet"
							placeholder="Choisir…"
							options={topicOptions}
							bind:value={topic}
							required
							disabled={submitting}
						/>
						{#if form?.fieldErrors?.topic}
							<p class="ml-1 text-xs text-fa-error-container">{form.fieldErrors.topic}</p>
						{/if}
					</div>

					<div class="space-y-1">
						<Textarea
							id="contact-message"
							name="message"
							label="Message"
							placeholder="Décrivez votre demande…"
							bind:value={message}
							rows={6}
							required
							disabled={submitting}
						/>
						{#if form?.fieldErrors?.message}
							<p class="ml-1 text-xs text-fa-error-container">{form.fieldErrors.message}</p>
						{/if}
					</div>

					<div class="pt-2">
						<Button
							type="submit"
							variant="filled"
							tone="default"
							size="lg"
							className="w-full sm:w-auto"
							label="Envoyer"
							disabled={submitting}
						/>
					</div>
				</form>
			{/if}
		</div>
	</main>

	<Footer />
</div>
