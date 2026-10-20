# `magmaDrawer` — tiroir latéral

Panneau ancré à un bord, posé au-dessus d'un voile. Il glisse depuis le côté
demandé, verrouille le défilement du document et restaure le focus à la
fermeture.

## Aperçu

```html
<button type="button" class="magma-btn magma-btn--primary" x-data
        @click="$dispatch('magma-drawer:open', { name: 'filtres' })">
    Ouvrir les filtres
</button>

<div class="magma-drawer"
     x-data="magmaDrawer({ name: 'filtres', side: 'right', size: 420 })"
     x-show="open" x-cloak
     :class="'magma-drawer--' + side"
     @magma-drawer:open.window="if ($event.detail?.name === name) show()"
     @magma-drawer:close.window="if ($event.detail?.name === name) hide()"
     @keydown.escape="hide()"
     role="dialog" aria-modal="true" aria-label="Filtres">

    <div class="magma-drawer__backdrop" x-show="open" @click="onBackdrop()"
         x-transition:enter="magma-overlay-enter"
         x-transition:enter-start="magma-overlay-enter-start"
         x-transition:leave="magma-overlay-leave"
         x-transition:leave-end="magma-overlay-leave-end"></div>

    <aside class="magma-drawer__panel" x-ref="panel" x-show="open" tabindex="-1" :style="panelStyle"
           x-transition:enter="magma-drawer-enter"
           x-transition:enter-start="magma-drawer-enter-start"
           x-transition:leave="magma-drawer-leave"
           x-transition:leave-end="magma-drawer-leave-end">

        <header class="magma-drawer__head">
            <div>
                <h2 class="magma-drawer__title">Filtres</h2>
                <p class="magma-drawer__subtitle">Affinez la liste des transactions.</p>
            </div>
            <button type="button" class="magma-modal__close" @click="hide()" aria-label="Fermer">×</button>
        </header>

        <div class="magma-drawer__body">
            <!-- filtres -->
        </div>

        <footer class="magma-drawer__foot">
            <button type="button" class="magma-btn magma-btn--neutral" @click="hide()">Annuler</button>
            <button type="button" class="magma-btn magma-btn--primary" @click="hide()">Appliquer</button>
        </footer>
    </aside>
</div>
```

Les classes `magma-drawer-enter` / `magma-drawer-leave` sont génériques : la
classe de côté du conteneur (`magma-drawer--right`, `--left`, `--top`,
`--bottom`) détermine le sens du glissement. Le balisage ci-dessus pose la
classe de côté dynamiquement avec `:class`.

## Options

| Option | Défaut | Rôle |
| --- | --- | --- |
| `open` | `false` | État initial. |
| `name` | `null` | Identifiant comparé aux commandes `magma-drawer:open` / `magma-drawer:close`. |
| `side` | `'right'` | Bord d'ancrage : `right`, `left`, `top`, `bottom`. |
| `size` | `null` | Largeur (côtés) ou hauteur (haut/bas). Nombre = pixels, chaîne = valeur CSS. Défaut CSS : 420 px / 360 px. |
| `lockScroll` | `true` | Fige le défilement du document pendant l'ouverture. |
| `closeOnBackdrop` | `true` | Ferme au clic sur le voile. |

## Méthodes

| Méthode | Effet |
| --- | --- |
| `show()` | Ouvre le tiroir, verrouille le défilement et place le focus sur le panneau. |
| `hide()` | Ferme, rend le défilement et restaure le focus précédent. |
| `toggle()` | Bascule. |
| `onBackdrop()` | Ferme si `closeOnBackdrop` est actif. |

## Commandes et événements

| Événement | Sens | Détail |
| --- | --- | --- |
| `magma-drawer:open` | écouté | `{ name }` |
| `magma-drawer:close` | écouté | `{ name }` |
| `magma-drawer:opened` | émis | `{ name, side }` |
| `magma-drawer:closed` | émis | `{ name, side }` |

```js
document.addEventListener('magma-drawer:opened', (event) => {
    console.log(event.detail.name, event.detail.side);
});
```

## Classes

| Classe | Rôle |
| --- | --- |
| `magma-drawer` | Conteneur fixe. |
| `magma-drawer--right` / `--left` / `--top` / `--bottom` | Bord d'ancrage et sens de la transition. |
| `magma-drawer__backdrop` | Voile. |
| `magma-drawer__panel` | Panneau, largeur/hauteur pilotée par `--magma-drawer-size`. |
| `magma-drawer__head` / `__body` / `__foot` | En-tête et pied fixes, corps seul défilant. |
| `magma-drawer-enter` / `-enter-start` / `-leave` / `-leave-end` | Classes de transition Alpine. |

## Accessibilité

- `role="dialog"` et `aria-modal="true"` sur le conteneur.
- `aria-label` ou `aria-labelledby` doit décrire le tiroir.
- `Échap` ferme, le clic sur le voile ferme, le focus entre dans le panneau à
  l'ouverture et revient au déclencheur à la fermeture.
- Le panneau est une colonne à trois zones : l'en-tête et les actions restent
  visibles, seul le corps défile.
- `prefers-reduced-motion` réduit les transitions à 1 ms.

## Notes

- Le verrouillage du défilement est partagé avec `magmaModal` et `magmaSheet` :
  plusieurs couches peuvent se superposer sans rendre la page défilante.
- Pour un panneau qui monte depuis le bas avec glisser-fermer, utilisez
  [`magmaSheet`](sheet.md).
