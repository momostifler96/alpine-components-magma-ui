# `magmaPagination` — pagination

Compteur, saut direct et numéros de page calculés.

## Aperçu

```html
<div class="magma-pagination" x-data="magmaPagination({ page: 1, perPage: 25, total: 1500 })">
    <p class="magma-pagination__count">
        <strong x-text="from"></strong>–<strong x-text="to"></strong>
        sur <strong x-text="total"></strong>
    </p>

    <div class="magma-pagination__nav">
        <span>Aller à</span>
        <input type="text" class="magma-pagination__jump" x-model.number="page"
               @keydown.enter="goTo(page)" aria-label="Aller à la page" />

        <button type="button" class="magma-pagination__step" @click="previous()"
                :disabled="page <= 1">Précédent</button>

        <template x-for="item in pages" :key="item">
            <button type="button" class="magma-pagination__page"
                    :class="page === item && 'is-active'"
                    @click="goTo(item)" x-text="item"></button>
        </template>

        <button type="button" class="magma-pagination__next" @click="next()">Suivant</button>
    </div>
</div>
```

## Options

| Option | Défaut | Rôle |
| --- | --- | --- |
| `page` | `1` | Page courante. |
| `perPage` | `25` | Éléments par page. |
| `total` | `0` | Nombre total d'éléments. |
| `window` | `1` | Pages affichées de part et d'autre de la page courante. |

## État calculé

| Propriété | Description |
| --- | --- |
| `lastPage` | Dernière page. |
| `from` / `to` | Bornes affichées. |
| `pages` | Numéros à rendre : première, voisines, dernière. |

## Méthodes et événements

| Membre | Rôle |
| --- | --- |
| `goTo(page)` | Va à une page, bornée à `[1, lastPage]`. |
| `next()` / `previous()` | Pas suivant et précédent. |
| `magma-page:change` | `{ page }` |

## Côté serveur

Branchez l'événement sur Livewire :

```blade
<div @magma-page:change.window="$wire.set('page', $event.detail.page)">
```
