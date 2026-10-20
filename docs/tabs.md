# `magmaTabs` — tabs

Local toggle, no navigation: chart filters, period selector, navigation within a
single page.

## Overview

```html
<div class="magma-tabs" x-data="magmaTabs({ current: 'all' })" role="tablist" aria-label="Filter">
    <button type="button" class="magma-tab" role="tab"
            :class="is('all') ? 'is-active' : ''"
            :aria-selected="is('all')"
            @click="select('all')">All</button>

    <button type="button" class="magma-tab" role="tab"
            :class="is('payout') ? 'is-active' : ''"
            :aria-selected="is('payout')"
            @click="select('payout')">Payout</button>
</div>
```

## Options and methods

| Member | Default | Role |
| --- | --- | --- |
| `current` | `null` | Active tab. |
| `select(tab)` | – | Activates a tab and emits the event. |
| `is(tab)` | – | Activity test. |

## Events

| Event | Detail |
| --- | --- |
| `magma-tabs:change` | `{ tab }` |

## Notes

- To navigate between URLs, use real links: these tabs do not change the
  address.
