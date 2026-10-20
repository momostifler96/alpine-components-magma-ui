# `magmaSearch` — search field

Debouncing, clearing and submission events.

## Overview

```html
<div class="magma-search" x-data="magmaSearch({ live: true, debounce: 300 })">
    <input type="search" x-model="term" @input="onInput()" @keydown.enter="submit()"
           placeholder="Search" aria-label="Search" />
    <button type="button" class="magma-search__icon" @click="submit()" aria-label="Search">🔍</button>
</div>
```

## Options

| Option | Default | Role |
| --- | --- | --- |
| `term` | `''` | Initial value. |
| `live` | `false` | Emits `magma-search` after debounce, on each keystroke. |
| `debounce` | `300` | Debounce, in milliseconds. |
| `busyDuration` | `500` | Duration of the `busy` state after submission. |

## State and methods

| Member | Role |
| --- | --- |
| `term` | Current input. |
| `busy` | True just after a submission. |
| `clear()` | Empties the field, and emits if `live`. |
| `submit()` | Emits `magma-search:submit`. |
| `onInput()` | Schedules the deferred emission if `live`. |

## Events

| Event | Detail |
| --- | --- |
| `magma-search` | `{ term }` — deferred, on each keystroke. |
| `magma-search:submit` | `{ term }` — immediate, on Enter or click. |

## Notes

- With Livewire, wire `@magma-search.debounce.300ms="$wire.set('search', $event.detail.term)"`.
