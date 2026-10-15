# `magmaPhonePrefix` — sélecteur d'indicatif téléphonique

Champ téléphone avec choix du pays et de son indicatif. Accepte une liste locale
ou distante, avec recherche (nom de pays, indicatif, code) et « charger plus ».

## Aperçu

```html
<div class="magma-phone" x-data="magmaPhonePrefix({
        value: '+225',
        code: 'ci',
        placeholder: '07 00 000 000',
        options: [
            { value: '+225', label: "Côte d'Ivoire", code: 'ci', region: "Afrique de l'Ouest" },
            { value: '+254', label: 'Kenya', code: 'ke', region: "Afrique de l'Est" },
        ],
    })"
    @click.outside="close()"
    @keydown="onKeydown($event)"
    :class="open && 'is-open'">

    <div class="magma-phone__picker">
        <button type="button" class="magma-phone__trigger" x-ref="trigger" @click="toggle()"
                :aria-expanded="open" aria-haspopup="listbox" aria-label="Indicatif téléphonique">
            <span class="magma-phone__dial" x-text="currentDial"></span>
            <svg class="magma-phone__caret" width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9.5 6 6 6-6"/></svg>
        </button>

        <div class="magma-select__menu" x-ref="menu" :style="menuStyle" x-show="open" x-cloak role="listbox">
            <div class="magma-select__search">
                <input type="text" x-model="searchTerm" @input="onSearchInput()" x-ref="search"
                       placeholder="Pays ou indicatif…" aria-label="Rechercher un pays ou un indicatif" />
            </div>

            <ul class="magma-select__list" x-ref="list" @scroll="onListScroll($event)">
                <template x-for="(option, index) in visibleOptions" :key="option.value">
                    <li :data-index="index">
                        <button type="button" class="magma-select__option" role="option"
                                :class="[String(option.value) === String(value) && 'is-selected', index === activeIndex && 'is-active']"
                                :aria-selected="String(option.value) === String(value)"
                                @click="choose(option)">
                            <span class="magma-select__name" x-text="option.label"></span>
                            <span class="magma-select__meta" x-text="option.value"></span>
                        </button>
                    </li>
                </template>
            </ul>

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

    <input type="tel" name="phone" placeholder="07 00 000 000" autocomplete="tel" />

    <button type="button" class="magma-phone__clear" @click="clear()" aria-label="Effacer le numéro">×</button>
</div>
```


> **Deux références sont nécessaires** pour le positionnement flottant :
> `x-ref="trigger"` sur le bouton et `x-ref="menu"` sur le panneau. Sans elles,
> le panneau retombe sur le positionnement absolu de la feuille de style.

## Options

| Option | Défaut | Rôle |
| --- | --- | --- |
| `value` | `''` | Indicatif sélectionné (`+225`). |
| `code` | `''` | Code pays associé (`ci`), pour afficher un drapeau. |
| `options` | `[]` | Pays : `[{ value, label, code?, region? }]`. |
| `searchable` | `true` | Active la recherche. |
| `emptyLabel` | `'Aucun indicatif trouvé'` | Liste vide. |
| `loadingLabel` / `errorLabel` / `loadMoreLabel` | – | Messages d'état. |
| `menuWidth` | `null` | Largeur du panneau : `'field'`, `'auto'`, un nombre de pixels ou une valeur CSS. |
| `floating` | `true` | Pose le panneau dans le repère de la fenêtre (`position: fixed`) : il échappe ainsi aux `overflow` de ses ancêtres — modale, carte, cellule de tableau. |

Toutes les [options distantes](remote.md) sont acceptées. Le renommage par défaut
est `valueKey: 'dial'` et `labelKey: 'name'`.

## Recherche locale

Le filtre local cherche dans **le libellé, la valeur, le code pays et la région** :

| Saisie | Trouve |
| --- | --- |
| `séné` | Sénégal |
| `+254` | Kenya |
| `CI` | Côte d'Ivoire |
| `est` | tous les pays de la région « Afrique de l'Est » |

## État et méthodes

| Membre | Rôle |
| --- | --- |
| `value` / `code` | Indicatif et code pays retenus. |
| `currentDial` | Indicateur prêt à afficher. |
| `visibleOptions` | Liste filtrée. |
| `choose(option)` | Retient l'option et ferme. |
| `clear()` | Vide le numéro saisi sans toucher à l'indicatif. |
| `onKeydown(event)` | Navigation clavier. |
| `load*`, `onListScroll` | Voir [remote](remote.md). |

## Événements

| Événement | Détail |
| --- | --- |
| `magma-phone:change` | `{ dial, code }` |
| `magma-select:loaded` | `{ page, count, hasMore }` |
| `magma-select:error` | `{ message }` |

## Notes

- Le panneau réutilise les classes `magma-select__*` : une seule feuille de style
  couvre les trois sélecteurs.
- La recherche et le pied restent fixes ; seule `.magma-select__list` défile.
