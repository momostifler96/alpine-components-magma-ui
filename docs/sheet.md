# `magmaSheet` — bottom sheet

Panel anchored at the bottom, especially suited to mobile. It rises on open,
closes on backdrop click or with `Escape`, and its grabber lets the user drag it
down.

## Overview

```html
<button type="button" class="magma-btn magma-btn--primary" x-data
        @click="$dispatch('magma-sheet:open', { name: 'actions' })">
    Open actions
</button>

<div class="magma-sheet"
     x-data="magmaSheet({ name: 'actions', maxHeight: '70vh' })"
     x-show="open" x-cloak
     @magma-sheet:open.window="if ($event.detail?.name === name) show()"
     @magma-sheet:close.window="if ($event.detail?.name === name) hide()"
     @keydown.escape="hide()"
     role="dialog" aria-modal="true" aria-label="Actions">

    <div class="magma-sheet__backdrop" x-show="open" @click="onBackdrop()"
         x-transition:enter="magma-overlay-enter"
         x-transition:enter-start="magma-overlay-enter-start"
         x-transition:leave="magma-overlay-leave"
         x-transition:leave-end="magma-overlay-leave-end"></div>

    <div class="magma-sheet__panel" x-ref="panel" x-show="open" tabindex="-1"
         :style="panelStyle" :class="dragging ? 'is-dragging' : ''"
         x-transition:enter="magma-sheet-enter"
         x-transition:enter-start="magma-sheet-enter-start"
         x-transition:leave="magma-sheet-leave"
         x-transition:leave-end="magma-sheet-leave-end">

        <div class="magma-sheet__grabber" @pointerdown="startDrag($event)" aria-hidden="true">
            <span></span>
        </div>

        <header class="magma-sheet__head">
            <div>
                <h2 class="magma-sheet__title">Quick actions</h2>
                <p class="magma-sheet__subtitle">Drag the grabber down to close.</p>
            </div>
        </header>

        <div class="magma-sheet__body">
            <!-- content -->
        </div>

        <footer class="magma-sheet__foot">
            <button type="button" class="magma-btn magma-btn--neutral" @click="hide()">Cancel</button>
            <button type="button" class="magma-btn magma-btn--primary" @click="hide()">Confirm</button>
        </footer>
    </div>
</div>
```

## Options

| Option | Default | Role |
| --- | --- | --- |
| `open` | `false` | Initial state. |
| `name` | `null` | Identifier compared against the `magma-sheet:open` / `magma-sheet:close` commands. |
| `lockScroll` | `true` | Freezes document scrolling while open. |
| `closeOnBackdrop` | `true` | Closes on backdrop click. |
| `swipeToClose` | `true` | Allows swipe-to-close from the grabber. |
| `maxHeight` | `null` | Maximum height. Number = pixels, string = CSS value. CSS default: `85vh`. |

## Methods

| Method | Effect |
| --- | --- |
| `show()` | Opens, locks scrolling and places focus on the panel. |
| `hide()` | Closes, restores scrolling and restores previous focus. |
| `toggle()` | Toggles. |
| `onBackdrop()` | Closes if `closeOnBackdrop` is enabled. |
| `startDrag(event)` | Starts the drag (called by the grabber). |
| `onDragMove(event)` / `onDragEnd()` | Drag tracking and end. |

## Commands and events

| Event | Direction | Detail |
| --- | --- | --- |
| `magma-sheet:open` | listened | `{ name }` |
| `magma-sheet:close` | listened | `{ name }` |
| `magma-sheet:opened` | emitted | `{ name }` |
| `magma-sheet:closed` | emitted | `{ name }` |

## Swipe-to-close

- The movement follows the finger or mouse in real time.
- The sheet closes if the panel is pulled more than 30 % of its height (160 px
  max) **or** if the gesture exceeds 20 % of its height (48 px minimum) with a
  velocity above 0.6 px/ms.
- A pause before releasing cancels the velocity handling: a short slide followed
  by a rest returns to place.
- Below the threshold, it returns to place with the stylesheet transition.
- `swipeToClose: false` disables the gesture; the grabber stays decorative.

## Classes

| Class | Role |
| --- | --- |
| `magma-sheet` | Fixed container, bottom-aligned. |
| `magma-sheet__backdrop` | Backdrop. |
| `magma-sheet__panel` | Panel; `is-dragging` cuts the transition during the gesture. |
| `magma-sheet__grabber` | Drag grabber. |
| `magma-sheet__head` / `__body` / `__foot` | Head, scrolling body and actions. |
| `magma-sheet-enter` / `-enter-start` / `-leave` / `-leave-end` | Alpine transition classes. |

## Accessibility

- `role="dialog"` and `aria-modal="true"` on the container.
- `Escape` closes, backdrop click closes, focus enters the panel on open and
  returns to the trigger on close.
- The grabber is decorative (`aria-hidden`): the gesture is a comfort, never the
  only means of closing.
- `prefers-reduced-motion` reduces transitions to 1 ms.
- `padding-bottom: env(safe-area-inset-bottom)` protects the actions under the
  system bars of phones.

## Notes

- For a side panel, use [`magmaDrawer`](drawer.md).
- Scroll locking is shared between modal, drawer and sheet.
