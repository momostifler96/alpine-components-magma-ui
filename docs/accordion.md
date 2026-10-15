# `magmaAccordion` — accordéon

Une seule section ouverte à la fois.

## Aperçu

```html
<div class="magma-accordion" x-data="magmaAccordion({ open: 0 })">
    <template x-for="(item, index) in items" :key="item.id">
        <div class="magma-accordion__item" :class="isOpen(index) && 'is-open'">
            <button type="button" class="magma-accordion__trigger" @click="toggle(index)"
                    :aria-expanded="isOpen(index)">
                <span x-text="item.title"></span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>

            <div x-show="isOpen(index)" x-cloak x-collapse>
                <p class="magma-accordion__panel" x-text="item.body"></p>
            </div>
        </div>
    </template>
</div>
```

> `x-collapse` provient du greffon `@alpinejs/collapse`, embarqué par Livewire 3.
> Avec Alpine seul, installez-le (`npm i @alpinejs/collapse`) ou remplacez-le par
> un `x-show` simple.

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
