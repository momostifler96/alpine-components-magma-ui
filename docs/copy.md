# `magmaCopy` — copy to clipboard

Uses `navigator.clipboard` and falls back to `execCommand` outside a secure
context.

## Overview

```html
<button type="button" class="magma-btn magma-btn--ghost"
        x-data="magmaCopy({ value: 'sk_live_51N8xQ2…' })"
        @click="copy()">
    <span x-text="copied ? 'Copied!' : 'Copy key'"></span>
</button>
```

## Options and methods

| Member | Default | Role |
| --- | --- | --- |
| `value` | `''` | Text to copy. |
| `copied` | `false` | True during the visual feedback. |
| `feedbackDuration` | `1600` | Feedback duration, in milliseconds. |
| `copy(value?)` | – | Copies the provided value, or `value`. |

## Events

| Event | Detail |
| --- | --- |
| `magma-copy:done` | `{ value }` |

## Notes

- `copy('other text')` lets you copy a value different from the one displayed.
- The fallback creates an off-screen `<textarea>` for the duration of the copy.
