# Architecture du projet

## Approche feature-based
- On souhaite rassembler les fichiers au plus proche de leur usage
- Par exemple : Si on crée une nouvelle page `/dashboard/+page.svelte`, on veut y mettre les composants strictement liés dans `/dashboars/helpers/some-helper.ts` ou `/dashboard/components/SomeComponent.svelte`
- Si le composant ou helper est amené à être réutilisé, on le déplace en conséquence et renomme si nécessaire

# Création d'un composant
- Quand tu crées un nouveau composant, le nom du composant doit ce retrouver dans les classes du composants en 1ère position.
- Pour les props, on préfère init une `interface Props { ... }` puis en suite déclarer les $props

## UI Kit
- Tout ce qui a attrait à l'UI pur, notamment les composants de base qui composant toute app (Button, Select, Snackbar, Modal, Banner...) doivent être rassemblés dans le dossier `/components/ui`

# Assets
- Tout ce qui est assets comme les icones, on les met à part `/components/assets`

## SVG
- Quand on crée un SVG pour un usage, on préfère en faire un asset qu'on importe dans le composant ensuite
- On utilise pour ça un `assets/icons/index.ts` pour exporter tous les SVG
- on utilise la propriété css `currentColor` pour pouvoir définir dynamiquement la couleur de notre SVG