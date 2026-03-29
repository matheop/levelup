<script lang="ts">
	import Select from '$lib/components/form/Select.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { modal } from '$lib/components/ui/modal/Modal.svelte';

	type Option = { value: string; label: string };

	interface Props {
		hasUnsavedChanges: boolean;
		isPersisted: boolean;
		isAuthenticated?: boolean;
		persisting: boolean;
		projectName: string;
		projectOptions: Option[];
		selectedProjectId: string;
		onNewProject: () => void;
		onSave: () => void;
		onReinitialize: () => void | Promise<void>;
		onRemove: () => void | Promise<void>;
	}

	let {
		selectedProjectId = $bindable<string>(),
		projectOptions,
		hasUnsavedChanges,
		isPersisted,
		persisting,
		isAuthenticated = false,
		projectName,
		onNewProject,
		onSave,
		onReinitialize,
		onRemove
	}: Props = $props();

	const persistBarVisible = $derived(isPersisted || hasUnsavedChanges);

	function handlePlusClick() {
		if (isAuthenticated) onNewProject();
		else modal.push('newProjectGuest');
	}
</script>

<div
	class="Subheader flex flex-col gap-3 border-t border-fa-outline-variant/10 bg-fa-surface-low px-5 py-3 md:flex-row md:items-center md:justify-between md:px-8"
>
	<div class="flex flex-wrap items-center gap-3">
		<span class="text-[10px] font-medium tracking-widest text-fa-outline uppercase">Projet :</span>
		{#if isAuthenticated}
			<div class="max-w-md min-w-[200px] flex-1">
				<Select id="saved-projects" bind:value={selectedProjectId} options={projectOptions} />
			</div>
		{:else}
			<p class="text-sm font-medium text-fa-on-surface-variant">
				{projectName}
			</p>
		{/if}
		<Button
			variant="transparent"
			size="icon"
			ariaLabel="Nouveau projet"
			className="rounded-lg text-fa-outline hover:!bg-fa-surface-high hover:!text-fa-primary-container"
			onClick={handlePlusClick}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="22"
				height="22"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				aria-hidden="true"
			>
				<circle cx="12" cy="12" r="10" />
				<path d="M12 8v8M8 12h8" />
			</svg>
		</Button>
	</div>
	{#if isAuthenticated && persistBarVisible}
		<div
			class="flex flex-wrap items-center gap-2 rounded-xl bg-fa-surface-lowest p-1 shadow-sm ring-1 ring-fa-outline-variant/20"
		>
			{#if hasUnsavedChanges}
				<Button
					variant="transparent"
					size="md"
					disabled={persisting}
					title={isPersisted
						? 'Recharge la dernière version enregistrée en base (annule les changements non sauvegardés)'
						: 'Efface le brouillon et repart d\u2019un projet vide'}
					className="!rounded-lg !px-3 !py-2 !font-bold"
					onClick={onReinitialize}
				>
					<span class="hidden sm:inline">Réinitialiser</span>
					<span class="sm:hidden">Réinit.</span>
				</Button>
				<div class="hidden h-4 w-px bg-fa-outline-variant/30 sm:block" aria-hidden="true"></div>
				{#if isPersisted}
					<Button
						variant="transparent"
						tone="success"
						label="Sauvegarder"
						disabled={persisting}
						className="!rounded-lg !border-transparent hover:!bg-fa-secondary/10"
						onClick={onSave}
					/>
				{:else}
					<Button
						variant="filled"
						tone="success"
						label="Sauvegarder le projet"
						disabled={persisting}
						className="!rounded-lg"
						onClick={onSave}
					/>
				{/if}
				<div class="hidden h-4 w-px bg-fa-outline-variant/30 sm:block" aria-hidden="true"></div>
			{/if}
			{#if isPersisted}
				<Button
					variant="transparent"
					tone="danger"
					size="md"
					disabled={persisting}
					className="!flex !items-center !gap-2 !rounded-lg !px-3 !py-2 !font-bold"
					onClick={onRemove}
				>
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
						<path d="M3 6h18" />
						<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
						<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
					</svg>
					<span class="hidden sm:inline">Supprimer</span>
				</Button>
			{/if}
		</div>
	{/if}
</div>
