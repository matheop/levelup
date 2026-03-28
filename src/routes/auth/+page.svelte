<script lang="ts">
	import { supabase } from '$lib/supabaseClient';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';
	import Input from '$lib/components/form/Input.svelte';

	let { data } = $props();

	type Mode = 'login' | 'signup';
	let mode = $state<Mode>('login');

	$effect(() => {
		const m = page.url.searchParams.get('mode');
		if (m === 'signup') mode = 'signup';
		else if (m === 'login') mode = 'login';
	});
	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let loading = $state(false);
	let message = $state<string | null>(null);
	let errorMessage = $state<string | null>(null);

	const formOrOAuthError = $derived(errorMessage ?? data.oauthError ?? null);

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
				const {
					data: { session }
				} = await supabase.auth.getSession();
			if (session) {
				message = 'Connexion en cours...';
				await goto(resolve('/dashboard'), { invalidateAll: true });
				} else {
					message = 'Compte créé. Vérifie ta boîte mail si confirmation requise.';
				}
			} else {
				if (rememberMe) {
					localStorage.setItem('fa.rememberAuth', '1');
				} else {
					localStorage.removeItem('fa.rememberAuth');
				}
				const { error } = await supabase.auth.signInWithPassword({ email, password });
				if (error) throw error;
				message = 'Connexion en cours...';
				await goto(resolve('/dashboard'), { invalidateAll: true });
			}
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
		} finally {
			loading = false;
		}
	}

	async function oauthSignIn(provider: 'google') {
		loading = true;
		errorMessage = null;
		try {
			const { error } = await supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: `${window.location.origin}${resolve('/auth/callback')}`
				}
			});
			if (error) throw error;
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
			loading = false;
		}
	}

	async function requestPasswordReset() {
		errorMessage = null;
		message = null;
		if (!email.trim()) {
			errorMessage = 'Indique ton email pour recevoir le lien de réinitialisation.';
			return;
		}
		loading = true;
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
				redirectTo: `${window.location.origin}${resolve('/auth/callback')}`
			});
			if (error) throw error;
			message = 'Si un compte existe, un email de réinitialisation a été envoyé.';
		} catch (e) {
			errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
		} finally {
			loading = false;
		}
	}
</script>

<!-- Charte Google (fond clair + bordure) : https://developers.google.com/identity/branding-guidelines -->

<div class="flex min-h-screen w-full flex-col bg-fa-surface md:flex-row">
	<!-- Panneau gauche (desktop) -->
	<section
		class="relative hidden min-h-[40vh] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#00030a] to-fa-primary-container p-10 md:flex md:min-h-screen md:w-5/12 lg:w-4/12 lg:p-12"
		aria-label="Présentation"
	>
		<div class="relative z-10">
			<p class="font-sans text-xl font-extrabold tracking-tight text-white">Financial Architect</p>
			<div class="mt-16 lg:mt-24">
				<h1
					class="font-sans text-4xl leading-tight font-extrabold tracking-tighter text-white lg:text-5xl"
				>
					L'immobilier,<br />
					<span class="text-fa-secondary-container">conçu avec précision.</span>
				</h1>
				<p class="mt-6 max-w-xs text-lg leading-relaxed text-fa-surface-highest/90">
					Gérez vos investissements LMNP, SCI et Holding avec la rigueur d'un expert-comptable.
				</p>
			</div>
		</div>
		<div class="pointer-events-none absolute inset-0 opacity-[0.08]" aria-hidden="true">
			<svg class="h-full w-full" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<pattern id="auth-grid" width="40" height="40" patternUnits="userSpaceOnUse">
						<path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="0.5" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#auth-grid)" />
			</svg>
		</div>
		<div
			class="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-fa-secondary/20 blur-[120px]"
			aria-hidden="true"
		></div>
	</section>

	<!-- Formulaire -->
	<main class="flex flex-1 flex-col items-center justify-center px-6 py-10 md:px-12 lg:px-24">
		<div class="w-full max-w-md">
			<div class="mb-10 md:hidden">
				<p class="font-sans text-2xl font-extrabold tracking-tight text-fa-primary-container">
					Financial Architect
				</p>
			</div>

			<header class="mb-10">
				<h2 class="mb-3 font-sans text-3xl font-extrabold tracking-tight text-fa-on-surface">
					{mode === 'login' ? 'Connexion' : 'Créer un compte'}
				</h2>
				<p class="font-sans text-base leading-relaxed text-fa-outline">
					Connectez-vous pour sauvegarder et gérer vos projets immobiliers.
				</p>
			</header>

			<div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-1">
				<!-- Google : fond blanc, bordure conforme -->
				<Button
					type="button"
					variant="outline"
					tone="default"
					size="lg"
					disabled={loading}
					className="h-12 w-full min-h-12 gap-3 !border-[#747775] bg-white px-4 shadow-sm active:scale-[0.98] hover:bg-fa-surface-high"
					onClick={() => oauthSignIn('google')}
					ariaLabel="Continuer avec Google"
				>
					<svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
						<path
							fill="#4285F4"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="#34A853"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="#FBBC05"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						/>
						<path
							fill="#EA4335"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						/>
					</svg>
					<span class="text-sm font-semibold text-fa-on-surface">Continuer avec Google</span>
				</Button>
			</div>

			<div class="relative mb-8 flex items-center py-2">
				<div class="h-px flex-1 bg-fa-outline-variant/30"></div>
				<span
					class="mx-4 shrink-0 font-sans text-[10px] font-semibold tracking-widest text-fa-outline uppercase"
				>
					ou avec email
				</span>
				<div class="h-px flex-1 bg-fa-outline-variant/30"></div>
			</div>

			<form class="space-y-6" onsubmit={submitEmailPassword}>
				<Input
					id="auth-email"
					type="email"
					autocomplete="email"
					label="Email"
					placeholder="nom@exemple.fr"
					bind:value={email}
					disabled={loading}
				/>

				<div class="space-y-2">
					<div class="flex items-center justify-between px-1">
						<label class="text-sm font-bold text-fa-on-surface-variant" for="auth-password"
							>Mot de passe</label
						>
						{#if mode === 'login'}
							<button
								type="button"
								class="font-sans text-xs font-bold text-fa-primary-container hover:underline"
								disabled={loading}
								onclick={requestPasswordReset}
							>
								Oublié ?
							</button>
						{/if}
					</div>
					<Input
						id="auth-password"
						type="password"
						autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
						placeholder="••••••••"
						bind:value={password}
						disabled={loading}
					/>
				</div>

				{#if mode === 'login'}
					<div class="flex items-center px-1">
						<input
							id="remember"
							type="checkbox"
							bind:checked={rememberMe}
							disabled={loading}
							class="h-4 w-4 rounded border-fa-outline-variant/40 bg-fa-surface-low text-fa-secondary focus:ring-fa-secondary"
						/>
						<label class="ml-2 font-sans text-xs font-medium text-fa-outline" for="remember">
							Se souvenir de moi pendant 30 jours
						</label>
					</div>
				{/if}

				<Button
					type="submit"
					variant="filled"
					tone="default"
					size="xl"
					disabled={loading}
					className="w-full gap-2 font-sans hover:bg-fa-primary active:scale-[0.97]"
				>
					<span
						>{loading
							? 'Chargement...'
							: mode === 'signup'
								? 'Créer mon compte'
								: 'Se connecter'}</span
					>
					{#if !loading}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							aria-hidden="true"
						>
							<path d="M5 12h14M13 6l6 6-6 6" />
						</svg>
					{/if}
				</Button>
			</form>

			<footer class="mt-10 text-center">
				<p class="font-sans text-sm font-medium text-fa-outline">
					{mode === 'login' ? "Vous n'avez pas encore de compte ?" : 'Déjà un compte ?'}
					<button
						type="button"
						class="ml-1 font-extrabold text-fa-secondary-container hover:underline"
						onclick={() => setMode(mode === 'login' ? 'signup' : 'login')}
					>
						{mode === 'login' ? 'Créer un compte' : 'Se connecter'}
					</button>
				</p>
			</footer>

			{#if message}
				<p class="mt-4 text-center text-sm text-fa-secondary" role="status">{message}</p>
			{/if}
			{#if formOrOAuthError}
				<p class="mt-4 text-center text-sm text-fa-error" role="alert">{formOrOAuthError}</p>
			{/if}

			<div class="mt-12 text-center">
				<p class="mx-auto max-w-xs font-sans text-[10px] leading-relaxed text-fa-outline/70">
					En continuant, vous acceptez nos
					<button
						type="button"
						class="inline cursor-pointer border-0 bg-transparent p-0 font-sans text-inherit underline hover:text-fa-on-surface"
					>
						Conditions Générales
					</button>
					et notre
					<button
						type="button"
						class="inline cursor-pointer border-0 bg-transparent p-0 font-sans text-inherit underline hover:text-fa-on-surface"
					>
						Politique de Confidentialité
					</button>.
				</p>
			</div>
		</div>
	</main>
</div>

<div
	class="fixed bottom-8 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-fa-outline-variant/30 md:hidden"
	aria-hidden="true"
></div>
