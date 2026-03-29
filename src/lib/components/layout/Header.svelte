<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/Button.svelte';

	const { isAuthenticated = true, onSignOut } = $props<{
		isAuthenticated?: boolean;
		onSignOut?: () => void | Promise<void>;
	}>();
</script>

<header
	class="Header flex w-full flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-fa-outline-variant/15 bg-fa-surface px-5 py-4 md:px-8"
>

	<span class="text-xl font-extrabold tracking-tight text-fa-primary-container"
		>Financial Architect</span
	>

	{#if isAuthenticated}
		{#if onSignOut}
			<Button
				variant="filled"
				tone="default"
				label="Déconnexion"
				className="!px-4 !font-bold !tracking-tight"
				onClick={() => onSignOut?.()}
			/>
		{/if}
	{:else}
		<div class="flex items-center gap-3">
			<Button
				variant="transparent"
				label="Connexion"
				className="!px-4 !font-bold !tracking-tight"
				onClick={() => goto(resolve('/auth'))}
			/>
			<Button
				variant="filled"
				tone="success"
				label="Enregistrer le projet"
				className="!px-4 !font-bold !tracking-tight"
				onClick={() => goto(resolve('/auth'))}
			/>
		</div>
	{/if}
</header>
