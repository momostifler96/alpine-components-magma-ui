# `magmaSheet` — feuille (bottom sheet)

Panneau ancré en bas, particulièrement adapté au mobile. Il monte à
l'ouverture, se ferme au clic sur le voile ou avec `Échap`, et sa poignée permet
de le tirer vers le bas.

## Aperçu

```html
<button type="button" class="magma-btn magma-btn--primary" x-data
        @click="$dispatch('magma-sheet:open', { name: 'actions' })">
    Ouvrir les actions
</button>

<div class="magma-sheet"
     x-data="magmaSheet({ name: 'actions', maxHeight: '70vh' })"
     x-show="open" x-cloak
     @magma-sheet:open.window="if ($event.detail?.name === name) show()"
     @magma-sheet:close.window="if ($event.detail?.name === name) hide()"
     @keydown.escape="hide()"
     role="dialog" aria-modal="true" aria-label="Actions">

    <div class="magma-sheet__backdrop" x-show="open" @click="onBackdrop()"
         x-transition:enter="magma-overlay-enter"
         x-transition:enter-start="magma-overlay-enter-start"
         x-transition:leave="magma-overlay-leave"
         x-transition:leave-end="magma-overlay-leave-end"></div>

    <div class="magma-sheet__panel" x-ref="panel" x-show="open" tabindex="-1"
         :style="panelStyle" :class="dragging ? 'is-dragging' : ''"
         x-transition:enter="magma-sheet-enter"
         x-transition:enter-start="magma-sheet-enter-start"
         x-transition:leave="magma-sheet-leave"
         x-transition:leave-end="magma-sheet-leave-end">

        <div class="magma-sheet__grabber" @pointerdown="startDrag($event)" aria-hidden="true">
            <span></span>
        </div>

        <header class="magma-sheet__head">
            <div>
                <h2 class="magma-sheet__title">Actions rapides</h2>
                <p class="magma-sheet__subtitle">Faites glisser la poignée vers le bas pour fermer.</p>
            </div>
        </header>

        <div class="magma-sheet__body">
            <!-- contenu -->
        </div>

        <footer class="magma-sheet__foot">
            <button type="button" class="magma-btn magma-btn--neutral" @click="hide()">Annuler</button>
            <button type="button" class="magma-btn magma-btn--primary" @click="hide()">Confirmer</button>
        </footer>
    </div>
</div>
```

## Options

| Option | Défaut | Rôle |
| --- | --- | --- |
| `open` | `false` | État initial. |
| `name` | `null` | Identifiant comparé aux commandes `magma-sheet:open` / `magma-sheet:close`. |
| `lockScroll` | `true` | Fige le défilement du document pendant l'ouverture. |
| `closeOnBackdrop` | `true` | Ferme au clic sur le voile. |
| `swipeToClose` | `true` | Autorise le glisser-fermer depuis la poignée. |
| `maxHeight` | `null` | Hauteur maximale. Nombre = pixels, chaîne = valeur CSS. Défaut CSS : `85vh`. |

## Méthodes

| Méthode | Effet |
| --- | --- |
| `show()` | Ouvre, verrouille le défilement et place le focus sur le panneau. |
| `hide()` | Ferme, rend le défilement et restaure le focus précédent. |
| `toggle()` | Bascule. |
| `onBackdrop()` | Ferme si `closeOnBackdrop` est actif. |
| `startDrag(event)` | Démarre le glisser (appelé par la poignée). |
| `onDragMove(event)` / `onDragEnd()` | Suivi et fin du glisser. |

## Commandes et événements

| Événement | Sens | Détail |
| --- | --- | --- |
| `magma-sheet:open` | écouté | `{ name }` |
| `magma-sheet:close` | écouté | `{ name }` |
| `magma-sheet:opened` | émis | `{ name }` |
| `magma-sheet:closed` | émis | `{ name }` |

## Glisser-fermer

- Le déplacement suit le doigt ou la souris en temps réel.
- La feuille se ferme si le panneau est tiré de plus de 30 % de sa hauteur
  (160 px maximum) **ou** si le geste dépasse 20 % de sa hauteur (48 px minimum)
  avec une vitesse supérieure à 0,6 px/ms.
- Une pause avant de relâcher annule la prise en compte de la vitesse : un
  glissement court suivi d'un temps d'arrêt revient en place.
- En dessous du seuil, elle revient en place avec la transition de la feuille.
- `swipeToClose: false` désactive le geste ; la poignée reste décorative.

## Classes

| Classe | Rôle |
| --- | --- |
| `magma-sheet` | Conteneur fixe, aligné en bas. |
| `magma-sheet__backdrop` | Voile. |
| `magma-sheet__panel` | Panneau ; `is-dragging` coupe la transition pendant le geste. |
| `magma-sheet__grabber` | Poignée de glissement. |
| `magma-sheet__head` / `__body` / `__foot` | En-tête, corps défilant et actions. |
| `magma-sheet-enter` / `-enter-start` / `-leave` / `-leave-end` | Classes de transition Alpine. |

## Accessibilité

- `role="dialog"` et `aria-modal="true"` sur le conteneur.
- `Échap` ferme, le clic sur le voile ferme, le focus entre dans le panneau à
  l'ouverture et revient au déclencheur à la fermeture.
- La poignée est décorative (`aria-hidden`) : le geste est un confort, jamais le
  seul moyen de fermer.
- `prefers-reduced-motion` réduit les transitions à 1 ms.
- `padding-bottom: env(safe-area-inset-bottom)` protège les actions sous les
  barres système des téléphones.

## Notes

- Pour un panneau latéral, utilisez [`magmaDrawer`](drawer.md).
- Le verrouillage du défilement est partagé entre modale, tiroir et feuille.
