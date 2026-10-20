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
    @click.outside="close()" @keydown="onKeydown($event)"
    :class="open ? 'is-open' : ''">

    <button type="button" class="magma-select__trigger" x-ref="trigger" @click="toggle()"
            :aria-expanded="open" aria-haspopup="listbox">
        <span class="magma-select__value" x-text="label"></span>
    </button>

    <div class="magma-select__menu" x-ref="menu" :style="menuStyle" x-show="open" x-cloak
         role="listbox" aria-multiselectable="true">
        <div class="magma-select__search">
            <input type="text" x-model="searchTerm" @input="onSearchInput()" x-ref="search"
                   placeholder="Rechercher" aria-label="Rechercher" />
        </div>

        <ul class="magma-select__list" x-ref="list" @scroll="onListScroll($event)">
            <li>
                <button type="button" class="magma-select__option" role="option"
                        :aria-selected="allSelected" @click="toggleAll()">
                    <span class="magma-select__name" x-text="allLabel"></span>
                    <span class="magma-select__check" x-show="allSelected" x-cloak>✓</span>
                </button>
            </li>
            <template x-for="(option, index) in visibleOptions" :key="option.value">
                <li :data-index="index">
                    <button type="button" class="magma-select__option" role="option"
                            :class="[isSelected(option.value) ? 'is-selected' : '', index === activeIndex ? 'is-active' : '']"
                            :aria-selected="isSelected(option.value)"
                            @click="choose(option)" @mousemove="activeIndex = index">
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
| `allSelected` | Toutes les options **visibles** (filtrées) sont retenues. |
| `isSelected(value)` | Test d'appartenance. |
| `choose(option)` | Ajoute ou retire une valeur. |
| `toggleAll()` | Sélectionne ou désélectionne toutes les options visibles, sans toucher aux valeurs hors filtre. |
| `onKeydown(event)` | Flèches, `Début` / `Fin`, `Entrée`, `Échap` et `Tab`. |
| `clear()` | Vide la sélection. |
| `visibleOptions`, `isEmpty`, `load*` | Voir [remote](remote.md). |

## Événements

| Événement | Détail |
| --- | --- |
| `magma-multiselect:change` | `{ values }` |

## Navigation clavier

- `↓` / `↑` déplacent l'option active, `Début` / `Fin` vont aux extrémités.
- `Entrée` sélectionne ou désélectionne l'option active sans fermer le panneau.
- `Échap` et `Tab` ferment le panneau.
- La recherche garde le focus : la sélection se fait donc au clavier sans
  quitter le champ.

## Notes

- La sélection n'est jamais écrasée par un rechargement : `values` est
  indépendant de `options`.
- La recherche est vidée à la fermeture ; en mode distant, la première page est
  rechargée à l'ouverture pour ne pas rouvrir sur un ancien filtre.
- Avec une recherche serveur, les valeurs déjà retenues restent sélectionnées
  même si elles sortent du filtre.
- `toggleAll()` n'agit que sur `visibleOptions` : une recherche « séné » ne
  sélectionne pas les pays masqués par le filtre.
- L'événement `magma-multiselect:change` transporte un vrai tableau dans
  `event.detail.values`.
