# `magmaMultiSelect` — sélection multiple

Même mécanique que [`magmaSelect`](select.md), avec une sélection cumulative.

## Aperçu

```html
<div class="magma-select" x-data="magmaMultiSelect({
        values: ['ci'],
        placeholder: 'Sélectionnez un ou plusieurs pays',
        options: [
            { value: 'ci', label: "Côte d'Ivoire" },
            { value: 'sn', label: 'Sénégal' },
        ],
    })"
    @click.outside="close()"
    :class="open ? 'is-open' : ''">

    <button type="button" class="magma-select__trigger" x-ref="trigger" @click="toggle()" :aria-expanded="open">
        <span class="magma-select__value" x-text="label"></span>
    </button>

    <div class="magma-select__menu" x-ref="menu" :style="menuStyle" x-show="open" x-cloak role="listbox" aria-multiselectable="true">
        <div class="magma-select__search">
            <input type="text" x-model="searchTerm" @input="onSearchInput()" x-ref="search" placeholder="Rechercher" />
        </div>

        <ul class="magma-select__list" x-ref="list" @scroll="onListScroll($event)">
            <li>
                <button type="button" class="magma-select__option" @click="toggleAll()">
                    <span class="magma-select__name" x-text="allLabel"></span>
                    <span class="magma-select__check" x-show="allSelected" x-cloak>✓</span>
                </button>
            </li>
            <template x-for="option in visibleOptions" :key="option.value">
                <li>
                    <button type="button" class="magma-select__option" role="option"
                            :class="isSelected(option.value) ? 'is-selected' : ''"
                            :aria-selected="isSelected(option.value)"
                            @click="choose(option)">
                        <span class="magma-select__name" x-text="option.label"></span>
                        <span class="magma-select__check" x-show="isSelected(option.value)" x-cloak>✓</span>
                    </button>
                </li>
            </template>
        </ul>

        <div class="magma-select__foot">
            <button type="button" class="magma-select__more" x-show="hasMore && !loading" x-cloak
                    @click="loadMore()" x-text="loadMoreLabel"></button>
        </div>
    </div>
</div>
```


> **Deux références sont nécessaires** pour le positionnement flottant :
> `x-ref="trigger"` sur le bouton et `x-ref="menu"` sur le panneau. Sans elles,
> le panneau retombe sur le positionnement absolu de la feuille de style.

## Options

| Option | Défaut | Rôle |
| --- | --- | --- |
| `values` | `[]` | Valeurs sélectionnées. |
| `searchable` | `true` | Recherche locale ou serveur. |
| `placeholder` | `''` | Libellé sans sélection. |
| `allLabel` | `'Tout sélectionner'` | Ligne de sélection globale. |
| `selectedLabel` | `'sélectionnés'` | Suffixe du compteur : « 3 sélectionnés ». |
| `emptyLabel` / `loadingLabel` / `errorLabel` / `loadMoreLabel` | – | Messages d'état. |
| `menuWidth` | `null` | Largeur du panneau : `'field'`, `'auto'`, un nombre de pixels ou une valeur CSS. |
| `floating` | `true` | Pose le panneau dans le repère de la fenêtre (`position: fixed`) : il échappe ainsi aux `overflow` de ses ancêtres — modale, carte, cellule de tableau. |

Toutes les [options distantes](remote.md) sont acceptées.

## État et méthodes

| Membre | Rôle |
| --- | --- |
| `values` | Tableau des valeurs retenues. |
| `label` | Résumé : placeholder, libellé unique, ou compteur. |
| `allSelected` | Toutes les options chargées sont retenues. |
| `isSelected(value)` | Test d'appartenance. |
| `choose(option)` | Ajoute ou retire une valeur. |
| `toggleAll()` | Tout sélectionner / tout désélectionner. |
| `clear()` | Vide la sélection. |
| `visibleOptions`, `isEmpty`, `load*` | Voir [remote](remote.md). |

## Événements

| Événement | Détail |
| --- | --- |
| `magma-multiselect:change` | `{ values }` |

## Notes

- La sélection n'est jamais écrasée par un rechargement : `values` est
  indépendant de `options`.
- Avec une recherche serveur, les valeurs déjà retenues restent sélectionnées
  même si elles sortent du filtre.
