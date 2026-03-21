<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/form/Input.svelte';

	type Mode = 'login' | 'signup';
	let mode = $state<Mode>('login');
	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let message = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);

	function setMode(next: Mode) {
		mode = next;
		message = null;
		errorMessage = null;
	}

	async function submitEmailPassword(event: SubmitEvent) {
		event.preventDefault();
		if (!email || !password) {
			errorMessage = 'Email et mot de passe requis.';
			return;
		}
		loading = true;
		message = null;
		errorMessage = null;

		try {
			if (mode === 'signup') {
				const { error } = await supabase.auth.signUp({ email, password });
				if (error) throw error;
				message = 'Compte créé. Vérifie ta boîte mail si confirmation requise.';
			} else {
				const { error } = await supabase.auth.signInWithPassword({ email, password });
				if (error) throw error;
				message = 'Connexion en cours...';
			}
			await supabase.auth.getSession();
			await goto('/', { invalidateAll: true });
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
		} finally {
			loading = false;
		}
	}

	async function oauthSignIn(provider: 'google' | 'apple') {
		loading = true;
		errorMessage = null;
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: `${window.location.origin}/auth/callback`
				}
			});
			if (error) throw error;
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
			loading = false;
		}
	}
</script>

<main class="min-h-screen flex items-center justify-center p-4">
	<div class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-md space-y-4">
		<h1 class="text-2xl font-bold text-slate-900">Connexion</h1>
		<p class="text-sm text-slate-600">
			Crée un compte ou connecte-toi pour sauvegarder et charger tes projets.
		</p>

		<div class="flex gap-2">
			<Button
				variant={mode === 'login' ? 'filled' : 'outline'}
				label="Connexion"
				onClick={() => setMode('login')}
			/>
			<Button
				variant={mode === 'signup' ? 'filled' : 'outline'}
				label="Créer un compte"
				onClick={() => setMode('signup')}
			/>
		</div>

		<form class="space-y-3" onsubmit={submitEmailPassword}>
			<Input id="email" label="Email" type="email" bind:value={email} />
			<Input id="password" label="Mot de passe" type="password" bind:value={password} />
			<Button
				type="submit"
				variant="filled"
				label={loading ? 'Chargement...' : mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}
				disabled={loading}
			/>
		</form>

		<div class="pt-2 border-t border-slate-200 space-y-2">
			<Button variant="outline" label="Continuer avec Google" onClick={() => oauthSignIn('google')} disabled={loading} />
			<Button variant="outline" label="Continuer avec Apple" onClick={() => oauthSignIn('apple')} disabled={loading} />
		</div>

		{#if message}
			<p class="text-sm text-emerald-600">{message}</p>
		{/if}
		{#if errorMessage}
			<p class="text-sm text-red-600">{errorMessage}</p>
		{/if}
	</div>
</main>
