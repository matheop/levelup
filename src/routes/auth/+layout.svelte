<script lang="ts">
	let { children } = $props();
</script>

<!-- Plein écran : la page auth gère son propre fond (split gauche / droite). -->
<div class="relative isolate min-h-screen w-full">
	{@render children()}
</div>
