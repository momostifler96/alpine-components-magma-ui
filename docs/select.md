# `magmaSelect` — dropdown

Single-select dropdown. Works on a local array **or** on a remote endpoint, with
server-side search, pagination and "load more".

## Overview

```html
<div
    class="magma-select"
    x-data="magmaSelect({
        value: 'ci',
        placeholder: 'Select a country',
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

    <!-- `:style="menuStyle"` applies the menuWidth option -->
    <div class="magma-select__menu" x-ref="menu" :style="menuStyle" x-show="open" x-cloak role="listbox"
         x-transition:enter="magma-fade-enter" x-transition:enter-start="magma-fade-enter-start"
         x-transition:leave="magma-fade-leave" x-transition:leave-end="magma-fade-leave-end">

        <div class="magma-select__search">
            <input type="text" x-model="searchTerm" @input="onSearchInput()" x-ref="search"
                   placeholder="Search" aria-label="Search" />
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

        <!-- States and pagination -->
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


> **Two references are required** for floating positioning: `x-ref="trigger"`
> on the button and `x-ref="menu"` on the panel. Without them, the panel falls
> back to the stylesheet's absolute positioning.

## Options

| Option | Default | Role |
| --- | --- | --- |
| `options` | `[]` | Local list: `[{ value, label }]`. |
| `value` | `null` | Selected value. |
| `searchable` | `false` | Enables the search field. In local mode, filters on `label`. |
| `placeholder` | `''` | Label shown when nothing is selected. |
| `emptyLabel` | `'No results'` | Message when the list is empty. |
| `loadingLabel` | `'Loading…'` | Loading message. |
| `errorLabel` | `'Loading failed'` | Failure message. |
| `loadMoreLabel` | `'Load more'` | Label of the pagination button. |
| `floating` | `true` | Lays out the panel in the window coordinate space (`position: fixed`): it thus escapes its ancestors' `overflow` — modal, card, table cell. |
| `menuWidth` | `null` | Panel width: `'field'`, `'auto'`, a number of pixels or a CSS value. See [theming](theming.md#panel-width). |
| `color` | `null` | Accent of the panel: hover/selection background, text, check mark. Any CSS color. |
| `size` | `null` | Panel width: `'xs'`…`'2xl'`, `'auto'`, a number of pixels or a CSS value. Takes precedence over `menuWidth`. |
| `radius` | `null` | Panel corners: `'none'`, `'sm'`, `'md'`, `'lg'`, `'xl'`, `'pill'`, `'field'`, a number of pixels or a CSS value. |

```html
<div class="magma-select"
     x-data="magmaSelect({ color: '#0a7d55', size: 'lg', radius: 'pill', options: [ … ] })">
```

The three appearance options only affect this instance; see
[theming](theming.md#panel-appearance-color-size-radius).

All the [remote options](../docs/remote.md) are also accepted: `url`, `perPage`,
`pageParam`, `searchParam`, `debounce`, `minChars`, `params`, `fetchOptions`,
`mapResponse`, `mapOption`, `valueKey`, `labelKey`.

## Exposed state

| Property | Type | Description |
| --- | --- | --- |
| `open` | `boolean` | Panel open. |
| `value` | `any` | Selected value. |
| `options` | `array` | Loaded or provided options. |
| `visibleOptions` | `array` | Options after local filtering. |
| `currentLabel` | `string` | Label of the current value, or the placeholder. |
| `searchTerm` | `string` | Search input. |
| `activeIndex` | `number` | Index hovered or selected via keyboard. |
| `loading` / `error` / `hasMore` / `loaded` | `boolean` / `string` | Remote loading state. |
| `isEmpty` | `boolean` | Empty list outside loading. |

## Methods

| Method | Effect |
| --- | --- |
| `toggle()` | Opens or closes. |
| `show()` / `close()` | Explicitly open / close. |
| `choose(option)` | Selects an option and closes. |
| `onSearchInput()` | Filters live; in remote mode, debounces then reloads. |
| `onKeydown(event)` | Keyboard navigation (`↓ ↑ Home End Enter Escape`). |
| `loadMore()` | Loads the next page. |
| `load(reset)` | Reloads, restarting from page 1 if `reset` is true. |
| `scrollActiveIntoView()` | Keeps the active option visible. |

## Events

| Event | Detail |
| --- | --- |
| `magma-select:change` | `{ value, option }` |
| `magma-select:loaded` | `{ page, count, hasMore }` |
| `magma-select:error` | `{ message }` |

```js
@magma-select\:change.window="console.log($event.detail.value)"
```

## Remote loading

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

Without further configuration, the next pages load on scroll and via the "load
more" button. `checkOverflow()` automatically chains pages if the first one
doesn't fill the panel.

## Accessibility

- `aria-haspopup="listbox"` on the trigger, `aria-expanded` kept up to date.
- `role="listbox"` on the panel, `role="option"` + `aria-selected` on each row.
- The search field receives focus on open.
- The list scrolls independently of the search and footer (see the
  `magma-select__menu` column, `.magma-select__list` the only scrolling area).

## Notes

- `currentLabel` relies on `options`. In remote mode with a preselected value,
  `init()` loads the first page to resolve the label.
- The panel closes on outside click: add `@click.outside="close()"`.
- For multiple selection, use [`magmaMultiSelect`](multi-select.md).
