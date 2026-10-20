# `magmaModal` — modal dialog

Locks document scrolling, closes with `Escape` or on backdrop click. Can be
opened remotely via event.

## Overview

```html
<div class="magma-modal" x-data="magmaModal({ name: 'edition' })"
     x-show="open" x-cloak
     @magma-open.window="if ($event.detail.name === name) show()"
     @keydown.escape.window="hide()"
     role="dialog" aria-modal="true" aria-label="Edit record">

    <div class="magma-modal__backdrop" x-show="open"
         x-transition:enter="magma-fade-enter" x-transition:enter-start="magma-fade-enter-start"
         x-transition:leave="magma-fade-leave" x-transition:leave-end="magma-fade-leave-end"
         @click="hide()"></div>

    <div class="magma-modal__panel" x-show="open"
         x-transition:enter="magma-zoom-enter" x-transition:enter-start="magma-zoom-enter-start"
         x-transition:leave="magma-zoom-leave" x-transition:leave-end="magma-zoom-leave-end">

        <header class="magma-modal__head">
            <div>
                <h2 class="magma-modal__title">Edit record</h2>
                <p class="magma-modal__subtitle">Fields marked with an asterisk are required.</p>
            </div>
            <button type="button" class="magma-modal__close" @click="hide()" aria-label="Close">×</button>
        </header>

        <div class="magma-modal__body">
            <!-- content -->
        </div>

        <footer class="magma-modal__foot">
            <button type="button" class="magma-btn magma-btn--neutral" @click="hide()">Cancel</button>
            <button type="button" class="magma-btn magma-btn--primary" @click="hide()">Save</button>
        </footer>
    </div>
</div>
```

## Opening

| From | Code |
| --- | --- |
| A page button | `<button x-data @click="$dispatch('magma-open', { name: 'edition' })">` |
| Another Alpine scope | `$dispatch('magma-open', { name: 'edition' })` |
| Livewire | `$this->dispatch('magma-open', name: 'edition');` |

> **The opening button's `x-data` is not decorative.** On page load Alpine only
> initializes directives located inside an `x-data` scope: an `@click` placed on
> an isolated static element is never wired up and the click does nothing, with
> no error message. Since the trigger is necessarily outside the modal's scope
> (it is closed at load), it needs its own.

## Options

| Option | Default | Role |
| --- | --- | --- |
| `open` | `false` | Initial state. |
| `name` | `null` | Identifier, compared against `$event.detail.name`. |
| `lockScroll` | `true` | Freezes document scrolling while open. |

## Methods

| Method | Effect |
| --- | --- |
| `show()` | Opens and locks scrolling. |
| `hide()` | Closes and restores scrolling. |
| `toggle()` | Toggles. |

## Events

| Event | Detail |
| --- | --- |
| `magma-modal:opened` | `{ name }` |
| `magma-modal:closed` | `{ name }` |

## Size classes

| Class | Maximum width |
| --- | --- |
| *(default)* | 620 px |
| `magma-modal__panel--sm` | 460 px |
| `magma-modal__panel--lg` | 860 px |

## Panel structure

The panel is a **three-zone** column:

| Zone | Scrolling |
| --- | --- |
| `.magma-modal__head` | fixed — the title stays visible while reading |
| `.magma-modal__body` | **only scrolling zone** |
| `.magma-modal__foot` | fixed — actions stay accessible |

The panel itself carries `overflow: hidden`: it is the body that scrolls. A
fully scrolling panel would drag its title along with the content, and the title
would slip under the first field.

### Dropdowns inside a modal

A menu in `position: absolute` would be clipped by the scrolling body. The
selectors solve the problem by default: they lay out their panel in
`position: fixed` and reposition it on scroll (`floating`, enabled by default).
No configuration is required.

## Accessibility

- `role="dialog"` and `aria-modal="true"` on the container.
- `aria-label` or `aria-labelledby` must describe the dialog.
- `Escape` closes; clicking the backdrop closes.
- Document scrolling is restored on close, even if the dialog is closed through
  another path.

## Notes

- The container is always mounted in the DOM (`x-show`), preserving field state
  between two opens. To start from a blank form, reset the fields in a
  `@magma-modal:closed.window`.
- Multiple modals can coexist: `name` distinguishes them.
