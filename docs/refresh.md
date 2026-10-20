# `magmaRefresh` — refresh button

Switches to an "in progress" state, runs an action, then notifies the result.

## Overview

```html
<button type="button" class="magma-btn magma-btn--ghost"
        x-data="magmaRefresh({ title: 'Updated', message: 'Rates have been refreshed.' })"
        @click="run()"
        :disabled="spinning">
    <svg :class="spinning ? 'magma-spin' : ''" width="18" height="18" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <path d="M20.5 11.5A8.5 8.5 0 0 0 6.3 6.3L3.5 8.8"/>
        <path d="M3.5 4.5v4.3h4.3"/>
    </svg>
    Refresh
</button>
```

## Options

| Option | Default | Role |
| --- | --- | --- |
| `action` | – | Async function run on click. Without it, a simulated timeout. |
| `duration` | `900` | Simulated duration, in milliseconds. |
| `title` | – | Title of the completion notification. Without a title, no notification. |
| `message` | `''` | Notification text. |
| `type` | `'success'` | Notification type. |

## State, methods and events

| Member | Role |
| --- | --- |
| `spinning` | True during execution. |
| `run()` | Starts the action. Concurrent calls are ignored. |
| `magma-refresh:start` / `magma-refresh:done` | Execution boundaries. |
