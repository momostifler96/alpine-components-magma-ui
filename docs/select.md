# `magmaSelect` — liste déroulante

Liste déroulante à sélection unique. Fonctionne sur un tableau local **ou** sur un
endpoint distant, avec recherche serveur, pagination et « charger plus ».

## Aperçu

```html
<div
    class="magma-select"
    x-data="magmaSelect({
        value: 'ci',
        placeholder: 'Sélectionnez un pays',
        searchable: true,
        options: [
            { value: 'ci', label: "Côte d'Ivoire" },
            { value: 'sn', label: 'Sénégal' },
        ],
    })"
    @click.outside="close()"
    @keydown="onKeydown($event)"
    :class="open ? 'is-open' : ''"
>
    <button type="button" class="magma-select__trigger" x-ref="trigger" @click="toggle()"
            :aria-expanded="open" aria-haspopup="listbox">
        <span class="magma-select__value" x-text="currentLabel"></span>
        <svg class="magma-select__caret" width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m6 9.5 6 6 6-6"/></svg>
    </button>

    <!-- `:style="menuStyle"` applique l'option menuWidth -->
    <div class="magma-select__menu" x-ref="menu" :style="menuStyle" x-show="open" x-cloak role="listbox"
         x-transition:enter="magma-fade-enter" x-transition:enter-start="magma-fade-enter-start"
         x-transition:leave="magma-fade-leave" x-transition:leave-end="magma-fade-leave-end">

        <div class="magma-select__search">
            <input type="text" x-model="searchTerm" @input="onSearchInput()" x-ref="search"
                   placeholder="Rechercher" aria-label="Rechercher" />
        </div>

        <ul class="magma-select__list" x-ref="list" @scroll="onListScroll($event)">
            <template x-for="(option, index) in visibleOptions" :key="option.value">
                <li :data-index="index">
                    <button type="button" class="magma-select__option" role="option"
                            :class="[String(option.value) === String(value) ? 'is-selected' : '', index === activeIndex ? 'is-active' : '']"
                            :aria-selected="String(option.value) === String(value)"
                            @click="choose(option)"
                            @mousemove="activeIndex = index">
                        <span class="magma-select__name" x-text="option.label"></span>
                        <span class="magma-select__check" x-show="String(option.value) === String(value)" x-cloak>✓</span>
                    </button>
                </li>
            </template>
        </ul>

        <!-- États et pagination -->
        <div class="magma-select__foot">
            <p class="magma-select__state" x-show="loading" x-cloak>
                <span class="magma-select__spinner"></span> <span x-text="loadingLabel"></span>
            </p>
            <p class="magma-select__state magma-select__state--error" x-show="error" x-cloak x-text="error"></p>
            <button type="button" class="magma-select__more" x-show="hasMore && !loading" x-cloak
                    @click="loadMore()" x-text="loadMoreLabel"></button>
            <p class="magma-select__state" x-show="isEmpty" x-cloak x-text="emptyLabel"></p>
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
| `options` | `[]` | Liste locale : `[{ value, label }]`. |
| `value` | `null` | Valeur sélectionnée. |
| `searchable` | `false` | Active le champ de recherche. En mode local, filtre sur `label`. |
| `placeholder` | `''` | Libellé affiché sans sélection. |
| `emptyLabel` | `'Aucun résultat'` | Message quand la liste est vide. |
| `loadingLabel` | `'Chargement…'` | Message de chargement. |
| `errorLabel` | `'Le chargement a échoué'` | Message en cas d'échec. |
| `loadMoreLabel` | `'Charger plus'` | Libellé du bouton de pagination. |
| `floating` | `true` | Pose le panneau dans le repère de la fenêtre (`position: fixed`) : il échappe ainsi aux `overflow` de ses ancêtres — modale, carte, cellule de tableau. |
| `menuWidth` | `null` | Largeur du panneau : `'field'`, `'auto'`, un nombre de pixels ou une valeur CSS. Voir [theming](theming.md#largeur-des-panneaux-déroulants). |

Toutes les [options distantes](../docs/remote.md) sont également acceptées :
`url`, `perPage`, `pageParam`, `searchParam`, `debounce`, `minChars`, `params`,
`fetchOptions`, `mapResponse`, `mapOption`, `valueKey`, `labelKey`.

## État exposé

| Propriété | Type | Description |
| --- | --- | --- |
| `open` | `boolean` | Panneau ouvert. |
| `value` | `any` | Valeur sélectionnée. |
| `options` | `array` | Options chargées ou fournies. |
| `visibleOptions` | `array` | Options après filtrage local. |
| `currentLabel` | `string` | Libellé de la valeur courante, ou le placeholder. |
| `searchTerm` | `string` | Saisie de recherche. |
| `activeIndex` | `number` | Index survolé ou sélectionné au clavier. |
| `loading` / `error` / `hasMore` / `loaded` | `boolean` / `string` | État du chargement distant. |
| `isEmpty` | `boolean` | Liste vide hors chargement. |

## Méthodes

| Méthode | Effet |
| --- | --- |
| `toggle()` | Ouvre ou ferme. |
| `show()` / `close()` | Ouvre / ferme explicitement. |
| `choose(option)` | Sélectionne une option et ferme. |
| `onSearchInput()` | Filtre en direct ; en distant, temporise puis recharge. |
| `onKeydown(event)` | Navigation clavier (`↓ ↑ Début Fin Entrée Échap`). |
| `loadMore()` | Charge la page suivante. |
| `load(reset)` | Recharge, en repartant de la page 1 si `reset` est vrai. |
| `scrollActiveIntoView()` | Garde l'option active visible. |

## Événements

| Événement | Détail |
| --- | --- |
| `magma-select:change` | `{ value, option }` |
| `magma-select:loaded` | `{ page, count, hasMore }` |
| `magma-select:error` | `{ message }` |

```js
@magma-select\:change.window="console.log($event.detail.value)"
```

## Chargement distant

```js
x-data="magmaSelect({
    url: '/api/countries',
    perPage: 25,
    searchParam: 'q',
    minChars: 2,
    valueKey: 'code',
    labelKey: 'name',
    params: () => ({ active: 1 }),
})"
```

Sans autre configuration, les pages suivantes se chargent au défilement et via le
bouton « charger plus ». `checkOverflow()` enchaîne automatiquement les pages si
la première ne remplit pas le panneau.

## Accessibilité

- `aria-haspopup="listbox"` sur le déclencheur, `aria-expanded` mis à jour.
- `role="listbox"` sur le panneau, `role="option"` + `aria-selected` sur chaque ligne.
- Le champ de recherche reçoit le focus à l'ouverture.
- La liste défile indépendamment de la recherche et du pied (voir
  `magma-select__menu` en colonne, `.magma-select__list` seule zone défilante).

## Notes

- `currentLabel` s'appuie sur `options`. En mode distant avec une valeur
  présélectionnée, `init()` charge la première page pour résoudre le libellé.
- Le panneau se ferme au clic extérieur : ajoutez `@click.outside="close()"`.
- Pour une sélection multiple, utilisez [`magmaMultiSelect`](multi-select.md).
