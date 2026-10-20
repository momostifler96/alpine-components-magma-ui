# `magmaMultiSelect` — multi-select

Same mechanic as [`magmaSelect`](select.md), with a cumulative selection.

## Overview

```html
<div class="magma-select" x-data="magmaMultiSelect({
        values: ['ci'],
        placeholder: 'Select one or more countries',
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
                   placeholder="Search" aria-label="Search" />
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


> **Two references are required** for floating positioning: `x-ref="trigger"`
> on the button and `x-ref="menu"` on the panel. Without them, the panel falls
> back to the stylesheet's absolute positioning.

## Options

| Option | Default | Role |
| --- | --- | --- |
| `values` | `[]` | Selected values. |
| `searchable` | `true` | Local or server search. |
| `placeholder` | `''` | Label when nothing is selected. |
| `allLabel` | `'Select all'` | Global selection row. |
| `selectedLabel` | `'selected'` | Counter suffix: "3 selected". |
| `emptyLabel` / `loadingLabel` / `errorLabel` / `loadMoreLabel` | – | Status messages. |
| `menuWidth` | `null` | Panel width: `'field'`, `'auto'`, a number of pixels or a CSS value. |
| `floating` | `true` | Lays out the panel in the window coordinate space (`position: fixed`): it thus escapes its ancestors' `overflow` — modal, card, table cell. |

All the [remote options](remote.md) are accepted.

## State and methods

| Member | Role |
| --- | --- |
| `values` | Array of retained values. |
| `label` | Summary: placeholder, single label, or counter. |
| `allSelected` | All **visible** (filtered) options are retained. |
| `isSelected(value)` | Membership test. |
| `choose(option)` | Adds or removes a value. |
| `toggleAll()` | Selects or deselects all visible options, without touching values outside the filter. |
| `onKeydown(event)` | Arrows, `Home` / `End`, `Enter`, `Escape` and `Tab`. |
| `clear()` | Empties the selection. |
| `visibleOptions`, `isEmpty`, `load*` | See [remote](remote.md). |

## Events

| Event | Detail |
| --- | --- |
| `magma-multiselect:change` | `{ values }` |

## Keyboard navigation

- `↓` / `↑` move the active option, `Home` / `End` go to the ends.
- `Enter` selects or deselects the active option without closing the panel.
- `Escape` and `Tab` close the panel.
- The search keeps focus: selection is therefore done via keyboard without
  leaving the field.

## Notes

- The selection is never overwritten by a reload: `values` is independent of
  `options`.
- The search is cleared on close; in remote mode, the first page is reloaded on
  open so as not to reopen on an old filter.
- With a server search, already-retained values stay selected even if they fall
  out of the filter.
- `toggleAll()` only acts on `visibleOptions`: a "séné" search does not select
  countries hidden by the filter.
- The `magma-multiselect:change` event carries a real array in
  `event.detail.values`.
