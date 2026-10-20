# `magmaToasts` — floating notifications

A stack of ephemeral messages, driven by a global event: any part of the
application can notify without knowing about the stack.

## Overview

```html
<div class="magma-toasts" x-data="magmaToasts({ duration: 5000 })"
     @magma-notify.window="push($event.detail)"
     aria-live="polite" aria-atomic="false">

    <template x-for="toast in items" :key="toast.id">
        <!-- `toast.leaving` triggers the exit animation; the notification
             is removed from the array once the animation has played. -->
        <div class="magma-toast" :class="[`magma-toast--${toast.type}`, toast.leaving ? 'is-leaving' : '']">
            <span class="magma-toast__icon">!</span>
            <span style="min-width:0">
                <span class="magma-toast__title" x-text="toast.title"></span>
                <span class="magma-toast__text" x-text="toast.message"></span>
            </span>
            <button type="button" class="magma-modal__close" @click="remove(toast.id)" aria-label="Close">×</button>
        </div>
    </template>
</div>
```

## Triggering

| From | Code |
| --- | --- |
| Alpine | `$dispatch('magma-notify', { type: 'success', title: 'Saved' })` |
| Livewire | `$this->dispatch('magma-notify', type: 'success', title: 'Saved');` |
| JavaScript | `import { notify } from '@momoledev/alpine-magma-ui-component'; notify({ … })` |
| Without bundler | `window.MagmaUI.notify({ … })` |

## Payload

| Field | Default | Role |
| --- | --- | --- |
| `type` | `info` | `success`, `error`, `warning` or `info`. |
| `title` | `''` | Bold title. |
| `message` | `''` | Secondary text. |
| `duration` | option value | Display duration in ms; `0` for a persistent message. |

## Options and methods

| Member | Default | Role |
| --- | --- | --- |
| `duration` | `5000` | Default display duration, in milliseconds. |
| `leaveDuration` | `200` | Delay before effective removal, aligned with the exit animation. |
| `push(payload)` | – | Adds a notification and returns its identifier. |
| `remove(id)` | – | Removes a notification. |
| `clear()` | – | Empties the stack. |

## Animation

Entry and exit are **CSS animations**, not Alpine transitions:

- `.magma-toast` plays `magma-toast-in` (260 ms) on insertion;
- `remove()` marks the notification `leaving` — applying `.is-leaving` and
  playing `magma-toast-out` (200 ms) — then removes it from the array.

This detour is necessary: Alpine does not apply `x-transition` directives carried
by the children of an `x-for` (the clones are inserted and removed without going
through the transition engine). The `leaveDuration` option (200 ms by default)
must stay aligned with the exit animation duration.

## Accessibility

- `aria-live="polite"`: messages are announced without interrupting reading.
- The close button carries an `aria-label`.
- `prefers-reduced-motion` neutralizes the entry animation.
