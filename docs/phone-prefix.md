# `magmaPhonePrefix` — phone prefix selector

Phone field with country and dial-code selection. Accepts a local or remote list,
with search (country name, dial code, code) and "load more".

## Overview

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
    :class="open ? 'is-open' : ''">

    <div class="magma-phone__picker">
        <button type="button" class="magma-phone__trigger" x-ref="trigger" @click="toggle()"
                :aria-expanded="open" aria-haspopup="listbox" aria-label="Phone prefix">
            <span class="magma-phone__dial" x-text="currentDial"></span>
            <svg class="magma-phone__caret" width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 9.5 6 6 6-6"/></svg>
        </button>

        <div class="magma-select__menu" x-ref="menu" :style="menuStyle" x-show="open" x-cloak role="listbox">
            <div class="magma-select__search">
                <input type="text" x-model="searchTerm" @input="onSearchInput()" x-ref="search"
                       placeholder="Country or prefix…" aria-label="Search a country or prefix" />
            </div>

            <ul class="magma-select__list" x-ref="list" @scroll="onListScroll($event)">
                <template x-for="(option, index) in visibleOptions" :key="option.value">
                    <li :data-index="index">
                        <button type="button" class="magma-select__option" role="option"
                                :class="[String(option.value) === String(value) ? 'is-selected' : '', index === activeIndex ? 'is-active' : '']"
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

    <button type="button" class="magma-phone__clear" @click="clear()" aria-label="Clear the number">×</button>
</div>
```


> **Two references are required** for floating positioning: `x-ref="trigger"`
> on the button and `x-ref="menu"` on the panel. Without them, the panel falls
> back to the stylesheet's absolute positioning.

## Options

| Option | Default | Role |
| --- | --- | --- |
| `value` | `''` | Selected prefix (`+225`). |
| `code` | `''` | Associated country code (`ci`), to display a flag. |
| `options` | `[]` | Countries: `[{ value, label, code?, region? }]`. |
| `searchable` | `true` | Enables the search. |
| `emptyLabel` | `'No prefix found'` | Empty list. |
| `loadingLabel` / `errorLabel` / `loadMoreLabel` | – | Status messages. |
| `menuWidth` | `null` | Panel width: `'field'`, `'auto'`, a number of pixels or a CSS value. |
| `floating` | `true` | Lays out the panel in the window coordinate space (`position: fixed`): it thus escapes its ancestors' `overflow` — modal, card, table cell. |
| `color` | `null` | Accent of the panel: hover/selection background, text, check mark. Any CSS color. |
| `size` | `null` | Panel width: `'xs'`…`'2xl'`, `'auto'`, a number of pixels or a CSS value. Takes precedence over `menuWidth`. |
| `radius` | `null` | Panel corners: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'pill'`, `'field'`, a number of pixels or a CSS value. |

`color`, `size` and `radius` only affect this instance; see
[theming](theming.md#panel-appearance-color-size-radius).

All the [remote options](remote.md) are accepted. The default renaming is
`valueKey: 'dial'` and `labelKey: 'name'`.

## Local search

The local filter searches in **the label, the value, the country code and the
region**:

| Input | Finds |
| --- | --- |
| `séné` | Sénégal |
| `+254` | Kenya |
| `CI` | Côte d'Ivoire |
| `est` | all countries of the "Afrique de l'Est" region |

## State and methods

| Member | Role |
| --- | --- |
| `value` / `code` | Retained prefix and country code. |
| `currentDial` | Indicator ready to display. |
| `currentOption` | Retained row, with its own fields (`code`, `region`…): `flagSvg(currentOption?.code)`. |
| `visibleOptions` | Filtered list. |
| `choose(option)` | Retains the option and closes. |
| `clear()` | Clears the typed number without touching the prefix. |
| `onKeydown(event)` | Keyboard navigation. |
| `load*`, `onListScroll` | See [remote](remote.md). |

## Events

| Event | Detail |
| --- | --- |
| `magma-phone:change` | `{ dial, code }` |
| `magma-select:loaded` | `{ page, count, hasMore }` |
| `magma-select:error` | `{ message }` |

## Notes

- The panel reuses the `magma-select__*` classes: a single stylesheet covers the
  three selectors.
- The search and footer stay fixed; only `.magma-select__list` scrolls.
