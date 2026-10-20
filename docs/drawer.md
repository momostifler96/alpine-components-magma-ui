# `magmaDrawer` — side drawer

Panel anchored to an edge, laid over a backdrop. It slides in from the requested
side, locks document scrolling and restores focus on close.

## Overview

```html
<button type="button" class="magma-btn magma-btn--primary" x-data
        @click="$dispatch('magma-drawer:open', { name: 'filtres' })">
    Open filters
</button>

<div class="magma-drawer"
     x-data="magmaDrawer({ name: 'filtres', side: 'right', size: 420 })"
     x-show="open" x-cloak
     :class="'magma-drawer--' + side"
     @magma-drawer:open.window="if ($event.detail?.name === name) show()"
     @magma-drawer:close.window="if ($event.detail?.name === name) hide()"
     @keydown.escape="hide()"
     role="dialog" aria-modal="true" aria-label="Filters">

    <div class="magma-drawer__backdrop" x-show="open" @click="onBackdrop()"
         x-transition:enter="magma-overlay-enter"
         x-transition:enter-start="magma-overlay-enter-start"
         x-transition:leave="magma-overlay-leave"
         x-transition:leave-end="magma-overlay-leave-end"></div>

    <aside class="magma-drawer__panel" x-ref="panel" x-show="open" tabindex="-1" :style="panelStyle"
           x-transition:enter="magma-drawer-enter"
           x-transition:enter-start="magma-drawer-enter-start"
           x-transition:leave="magma-drawer-leave"
           x-transition:leave-end="magma-drawer-leave-end">

        <header class="magma-drawer__head">
            <div>
                <h2 class="magma-drawer__title">Filters</h2>
                <p class="magma-drawer__subtitle">Refine the transactions list.</p>
            </div>
            <button type="button" class="magma-modal__close" @click="hide()" aria-label="Close">×</button>
        </header>

        <div class="magma-drawer__body">
            <!-- filters -->
        </div>

        <footer class="magma-drawer__foot">
            <button type="button" class="magma-btn magma-btn--neutral" @click="hide()">Cancel</button>
            <button type="button" class="magma-btn magma-btn--primary" @click="hide()">Apply</button>
        </footer>
    </aside>
</div>
```

The `magma-drawer-enter` / `magma-drawer-leave` classes are generic: the
container's side class (`magma-drawer--right`, `--left`, `--top`, `--bottom`)
determines the direction of the slide. The markup above sets the side class
dynamically with `:class`.

## Options

| Option | Default | Role |
| --- | --- | --- |
| `open` | `false` | Initial state. |
| `name` | `null` | Identifier compared against the `magma-drawer:open` / `magma-drawer:close` commands. |
| `side` | `'right'` | Anchoring edge: `right`, `left`, `top`, `bottom`. |
| `size` | `null` | Width (sides) or height (top/bottom). Number = pixels, string = CSS value. CSS default: 420 px / 360 px. |
| `lockScroll` | `true` | Freezes document scrolling while open. |
| `closeOnBackdrop` | `true` | Closes on backdrop click. |

## Methods

| Method | Effect |
| --- | --- |
| `show()` | Opens the drawer, locks scrolling and places focus on the panel. |
| `hide()` | Closes, restores scrolling and restores previous focus. |
| `toggle()` | Toggles. |
| `onBackdrop()` | Closes if `closeOnBackdrop` is enabled. |

## Commands and events

| Event | Direction | Detail |
| --- | --- | --- |
| `magma-drawer:open` | listened | `{ name }` |
| `magma-drawer:close` | listened | `{ name }` |
| `magma-drawer:opened` | emitted | `{ name, side }` |
| `magma-drawer:closed` | emitted | `{ name, side }` |

```js
document.addEventListener('magma-drawer:opened', (event) => {
    console.log(event.detail.name, event.detail.side);
});
```

## Classes

| Class | Role |
| --- | --- |
| `magma-drawer` | Fixed container. |
| `magma-drawer--right` / `--left` / `--top` / `--bottom` | Anchoring edge and transition direction. |
| `magma-drawer__backdrop` | Backdrop. |
| `magma-drawer__panel` | Panel, width/height driven by `--magma-drawer-size`. |
| `magma-drawer__head` / `__body` / `__foot` | Fixed head and foot, body alone scrolling. |
| `magma-drawer-enter` / `-enter-start` / `-leave` / `-leave-end` | Alpine transition classes. |

## Accessibility

- `role="dialog"` and `aria-modal="true"` on the container.
- `aria-label` or `aria-labelledby` must describe the drawer.
- `Escape` closes, backdrop click closes, focus enters the panel on open and
  returns to the trigger on close.
- The panel is a three-zone column: the head and actions stay visible, only the
  body scrolls.
- `prefers-reduced-motion` reduces transitions to 1 ms.

## Notes

- Scroll locking is shared with `magmaModal` and `magmaSheet`: several layers can
  stack without making the page scrollable.
- For a panel that rises from the bottom with swipe-to-close, use
  [`magmaSheet`](sheet.md).
