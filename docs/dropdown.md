# `magmaDropdown` — dropdown panel

Common base for top-bar menus: notifications, account selector, language
selector.

## Overview

```html
<div class="magma-dropdown" x-data="magmaDropdown()" @click.outside="close()">
    <button type="button" class="magma-btn magma-btn--ghost" x-ref="trigger" @click="toggle()" :aria-expanded="open">
        My account
    </button>

    <div class="magma-menu" x-ref="menu" :style="menuStyle" x-show="open" x-cloak role="menu"
         x-transition:enter="magma-fade-enter" x-transition:enter-start="magma-fade-enter-start"
         x-transition:leave="magma-fade-leave" x-transition:leave-end="magma-fade-leave-end">
        <a href="/profile" class="magma-menu__item">My profile</a>
        <div class="magma-menu__sep"></div>
        <button type="button" class="magma-menu__item" @click="close()">Sign out</button>
    </div>
</div>
```


> **Two references are required** for floating positioning: `x-ref="trigger"`
> on the button and `x-ref="menu"` on the panel. Without them, the panel falls
> back to the stylesheet's absolute positioning.

## Options and methods

| Member | Default | Role |
| --- | --- | --- |
| `open` | `false` | Panel state. |
| `toggle()` | – | Toggles and emits the event. |
| `show()` / `close()` | – | Explicit open and close. |
| `menuWidth` | `null` | Panel width: `'field'`, `'auto'`, a number of pixels or a CSS value. |
| `floating` | `true` | Lays out the panel in the window coordinate space (`position: fixed`): it thus escapes its ancestors' `overflow` — modal, card, table cell. |

## Events

| Event | Detail |
| --- | --- |
| `magma-dropdown:change` | `{ open }` |

## Classes

| Class | Role |
| --- | --- |
| `magma-menu` | Panel aligned to the right of the trigger. |
| `magma-menu--left` | Left alignment. |
| `magma-menu__item` | Clickable row. |
| `magma-menu__item.is-active` | Current row. |
| `magma-menu__sep` | Separator. |

## Notes

- Always remember `@click.outside="close()"` on the container.
- Several panels can coexist: each has its own Alpine scope.
