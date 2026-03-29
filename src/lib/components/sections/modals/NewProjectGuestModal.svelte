<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { onClose } = $props<{ onClose: () => void }>();
</script>

<Modal
	title="Créer un nouveau projet"
	titleId="modal-new-project-guest"
	{onClose}
	maxWidthClass="max-w-md"
>
	<div class="flex flex-col items-center gap-6 py-2 text-center">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="48"
			height="48"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			class="text-fa-primary-container"
			aria-hidden="true"
		>
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<polyline points="14 2 14 8 20 8" />
			<line x1="12" y1="18" x2="12" y2="12" />
			<line x1="9" y1="15" x2="15" y2="15" />
		</svg>

		<p class="text-sm leading-relaxed text-fa-on-surface-variant">
			Pour créer un nouveau projet sans perdre celui en cours, connecte-toi ou crée un compte.
			Ton projet actuel sera sauvegardé automatiquement.
		</p>

		<div class="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
			<Button
				variant="outline"
				tone="default"
				label="Connexion"
				className="flex-1 !rounded-lg"
				onClick={() => goto(resolve('/auth'))}
			/>
			<Button
				variant="filled"
				tone="success"
				label="Créer un compte"
				className="flex-1 !rounded-lg"
				onClick={() => {
					/* eslint-disable-next-line svelte/no-navigation-without-resolve -- query string on resolved base */
					goto(`${resolve('/auth')}?mode=signup`);
				}}
			/>
		</div>
	</div>
</Modal>
