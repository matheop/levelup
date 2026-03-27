<script lang="ts">
	import { resolve } from '$app/paths';
</script>

<footer class="bg-fa-surface-low py-12">
    <div class="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-8 md:grid-cols-4">
        <div class="space-y-3">
            <p class="text-lg font-bold text-fa-primary-container">Financial Architect</p>
            <p class="text-xs leading-relaxed text-fa-outline">
                Précision et clarté fiscale. L'outil de référence pour les investisseurs exigeants.
            </p>
        </div>
        <div class="space-y-2">
            <p class="text-[10px] font-bold tracking-widest text-fa-outline uppercase">Produit</p>
            <a class="block text-xs text-fa-outline hover:text-fa-primary-container" href={resolve('/#simulateur')}>Simulateur</a>
        </div>
        <div class="space-y-2">
            <p class="text-[10px] font-bold tracking-widest text-fa-outline uppercase">Legal</p>
            <a class="block text-xs text-fa-outline hover:text-fa-primary-container" href={resolve('/auth')}>Mentions Légales</a>
            <a class="block text-xs text-fa-outline hover:text-fa-primary-container" href={resolve('/auth')}>Confidentialité</a>
        </div>
        <div class="space-y-2">
            <p class="text-[10px] font-bold tracking-widest text-fa-outline uppercase">Contact</p>
            <a class="block text-xs text-fa-outline hover:text-fa-primary-container" href={resolve('/auth')}>Support</a>

        </div>
    </div>
</footer>