# `magmaSwitch` — switch

Binary toggle: test and production mode, enabling an option.

## Overview

```html
<button type="button" class="magma-switch" x-data="magmaSwitch({ on: true })"
        :class="on ? 'is-on' : ''" @click="toggle()"
        role="switch" :aria-checked="on" aria-label="Test mode">
    <span class="magma-switch__dot"></span>
</button>
```

## Options and methods

| Member | Default | Role |
| --- | --- | --- |
| `on` | `false` | State. |
| `toggle()` | – | Toggles. |
| `set(value)` | – | Forces the state. |

## Events

| Event | Detail |
| --- | --- |
| `magma-switch:change` | `{ value }` |

## Accessibility

- `role="switch"` and `aria-checked` on the interactive element: the screen
  reader announces "on" or "off".
