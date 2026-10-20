# `magmaAccordion` — accordion

Only one section open at a time.

## Overview

```html
<div class="magma-accordion" x-data="magmaAccordion({ open: 0 })">
    <template x-for="(item, index) in items" :key="item.id">
        <div class="magma-accordion__item" :class="isOpen(index) ? 'is-open' : ''">
            <button type="button" class="magma-accordion__trigger" @click="toggle(index)"
                    :aria-expanded="isOpen(index)">
                <span x-text="item.title"></span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </button>

            <div class="magma-disclosure" :class="isOpen(index) ? 'is-open' : ''"
                 :aria-hidden="!isOpen(index)" :inert="isOpen(index) ? null : true">
                <div>
                    <p class="magma-accordion__panel" x-text="item.body"></p>
                </div>
            </div>
        </div>
    </template>
</div>
```

> The opening animation is pure CSS: `magma-disclosure` goes from
> `grid-template-rows: 0fr` to `1fr`, without any plugin. The content stays in
> the DOM (closed with `inert`) so the height can animate. `x-collapse` remains
> compatible if you prefer the `@alpinejs/collapse` plugin, but it is no longer
> required.

The `magma-disclosure` class is generic: it can animate any collapsible block,
with the `is-open` class on the container.

## Options and methods

| Member | Default | Role |
| --- | --- | --- |
| `open` | `null` | Key of the open section. |
| `isOpen(key)` | – | Openness test. |
| `toggle(key)` | – | Opens, or closes if already open. |
| `close()` | – | Closes everything. |

## Events

| Event | Detail |
| --- | --- |
| `magma-accordion:change` | `{ key, open }` |
