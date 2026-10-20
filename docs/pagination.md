# `magmaPagination` — pagination

Counter, direct jump and computed page numbers.

## Overview

```html
<div class="magma-pagination" x-data="magmaPagination({ page: 1, perPage: 25, total: 1500 })">
    <p class="magma-pagination__count">
        <strong x-text="from"></strong>–<strong x-text="to"></strong>
        of <strong x-text="total"></strong>
    </p>

    <div class="magma-pagination__nav">
        <span>Go to</span>
        <input type="text" class="magma-pagination__jump" x-model.number="page"
               @keydown.enter="goTo(page)" aria-label="Go to page" />

        <button type="button" class="magma-pagination__step" @click="previous()"
                :disabled="page <= 1">Previous</button>

        <template x-for="item in pages" :key="item">
            <button type="button" class="magma-pagination__page"
                    :class="page === item ? 'is-active' : ''"
                    @click="goTo(item)" x-text="item"></button>
        </template>

        <button type="button" class="magma-pagination__next" @click="next()">Next</button>
    </div>
</div>
```

## Options

| Option | Default | Role |
| --- | --- | --- |
| `page` | `1` | Current page. |
| `perPage` | `25` | Items per page. |
| `total` | `0` | Total number of items. |
| `window` | `1` | Pages shown on either side of the current page. |

## Computed state

| Property | Description |
| --- | --- |
| `lastPage` | Last page. |
| `from` / `to` | Displayed bounds. |
| `pages` | Numbers to render: first, neighbors, last. |

## Methods and events

| Member | Role |
| --- | --- |
| `goTo(page)` | Goes to a page, clamped to `[1, lastPage]`. |
| `next()` / `previous()` | Next and previous step. |
| `magma-page:change` | `{ page }` |

## Server side

Wire the event to Livewire:

```blade
<div @magma-page:change.window="$wire.set('page', $event.detail.page)">
```
