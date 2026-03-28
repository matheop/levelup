<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let { onClose } = $props<{ onClose: () => void }>();
</script>

<Modal
	open
	title="Enregistrer ton projet"
	titleId="modal-register-project"
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
			class="text-fa-secondary"
			aria-hidden="true"
		>
			<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
			<polyline points="17 21 17 13 7 13 7 21" />
			<polyline points="7 3 7 8 15 8" />
		</svg>

		<p class="text-sm leading-relaxed text-fa-on-surface-variant">
			Enregistre ton projet pour le retrouver plus tard et y accéder depuis n'importe quel
			appareil.
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
