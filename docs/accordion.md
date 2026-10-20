# `magmaAccordion` — accordéon

Une seule section ouverte à la fois.

## Aperçu

```html
<div class="magma-accordion" x-data="magmaAccordion({ open: 0 })">
    <template x-for="(item, index) in items" :key="item.id">
        <div class="magma-accordion__item" :class="isOpen(index) ? 'is-open' : ''">
            <button type="button" class="magma-accordion__trigger" @click="toggle(index)"
                    :aria-expanded="isOpen(index)">
                <span x-text="item.title"></span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>

            <div class="magma-disclosure" :class="isOpen(index) ? 'is-open' : ''"
                 :aria-hidden="!isOpen(index)" :inert="isOpen(index) ? null : true">
                <div>
                    <p class="magma-accordion__panel" x-text="item.body"></p>
                </div>
            </div>
        </div>
    </template>
</div>
```

> L'animation d'ouverture est en CSS pur : `magma-disclosure` passe de
> `grid-template-rows: 0fr` à `1fr`, sans greffon. Le contenu reste dans le DOM
> (fermé avec `inert`) pour que la hauteur s'anime. `x-collapse` reste
> compatible si vous préférez le greffon `@alpinejs/collapse`, mais n'est plus
> nécessaire.

La classe `magma-disclosure` est générique : elle peut animer n'importe quel
bloc repliable, avec la classe `is-open` sur le conteneur.

## Options et méthodes

| Membre | Défaut | Rôle |
| --- | --- | --- |
| `open` | `null` | Clé de la section ouverte. |
| `isOpen(key)` | – | Test d'ouverture. |
| `toggle(key)` | – | Ouvre, ou referme si déjà ouverte. |
| `close()` | – | Referme tout. |

## Événements

| Événement | Détail |
| --- | --- |
| `magma-accordion:change` | `{ key, open }` |
