<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/Button.svelte';
</script>

<nav class="fixed top-0 z-50 w-full bg-fa-surface/90 backdrop-blur-sm">
    <div class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <a href={resolve('/')}>
            <p class="text-xl font-extrabold tracking-tight text-fa-primary-container">Financial Architect</p>
        </a>
        <div class="hidden items-center gap-8 text-sm font-semibold text-fa-outline md:flex">
            <a href={resolve('/#simulateur')} class="transition hover:text-fa-primary-container">Simulateur</a>
            <a href={resolve('/#fonctionnalites')} class="transition hover:text-fa-primary-container">Fonctionnalités</a>
            <span
                class="rounded bg-fa-secondary-container px-2 py-0.5 text-[10px] font-extrabold tracking-widest text-fa-on-secondary-container uppercase"
            >
                Accès Libre
            </span>
        </div>
        <div class="flex items-center gap-3">
            <a href={resolve('/dashboard')}>
                <Button variant="transparent" tone="default" size="md" label="Connexion" />
            </a>
            <a href={resolve('/onboarding')}>
                <Button variant="filled" tone="default" size="md" className="group w-full sm:w-auto">
                    <span>Simulateur Gratuit</span>
                    <span class="transition-transform group-hover:translate-x-1">→</span>
                </Button>
            </a>
        </div>
    </div>
</nav>