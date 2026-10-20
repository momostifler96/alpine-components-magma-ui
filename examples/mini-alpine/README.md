# Alpine mini-project — Magma UI

Self-contained test bed for the package's 16 components, with Vite and a local
paginated API. The package is installed from the repository (`file:../..`) and
imported like any npm dependency.

## Run

```bash
cd examples/mini-alpine
npm install
npm run dev
```

Open <http://127.0.0.1:5173/>.

The demo API is served by Vite: `/api/countries?page=1&per_page=8&q=…`.
No external service is required.

## What is verified

| Component | Scenario |
| --- | --- |
| `magmaSelect` local | open, search "séné", keyboard selection (`Enter`), close |
| `magmaSelect` remote | loading page 1, "load more", server search, selection |
| `magmaMultiSelect` | cumulative add, "select all" scoped to the filter, reset search, keyboard navigation, `Escape` |
| `magmaPhonePrefix` | search by country, dial-code selection, clearing the number |
| `magmaDateTimePicker` | all eight modes; month/year switcher in date, datetime, multiple, range and week; a single `HH:MM:SS` field group in datetime; an inline calendar without modal; range with two months and shortcut presets |
| `magmaModal` | open via `magma-open`, scroll locking, `Escape`, confirmation + notification |
| `magmaDrawer` | open from the right edge, backdrop, focus, `Escape`, lateral transition |
| `magmaSheet` | open from the bottom, swipe-to-close, elastic return, transitions |
| `magmaDropdown` | open, `fixed` positioning, close on outside click |
| `magmaAccordion` | single open section, `aria-expanded`, disclosure animation without plugin |
| `magmaTabs` | tab change, `aria-selected` |
| `magmaPagination` | next page, direct jump to page 10, counter |
| `magmaToasts` | notification via `MagmaUI.notify()` and via event |
| `magmaRefresh` | `spinning` state, disabled button, completion notification |
| `magmaSearch` | debounce, `Enter` submission, clear |
| `magmaCopy` | copy, "Copied!" feedback, `magma-copy:done` event |
| `magmaSwitch` | toggle, `aria-checked`, `is-on` visual state |

The log at the bottom of the page prints all the emitted `magma-*` events. The
console must stay empty (errors and warnings included).

## Installation used

```js
import Alpine from 'alpinejs';
import { install } from '@momoledev/alpine-magma-ui-component';
import '@momoledev/alpine-magma-ui-component/css';

install();
window.Alpine = Alpine;
Alpine.start();
```

`install()` registers on `alpine:init` when Alpine hasn't started yet. The
package exposes the 16 factories on `window` and `window.MagmaUI`.

## Test notes

- The package was also verified via `npm pack` then installed in a blank
  project: the `dist/` bundles and the 16 components are present.
- Defects fixed while setting up this test bed:
  - `magmaMultiSelect` was missing from the component registry;
  - the multi-select had neither keyboard navigation nor search reset, and
    "select all" ignored the filter;
  - `.magma-select__menu` was not a flex column, which scrolled the whole search
    and chained all the remote pages;
  - the `is-on` state of `magmaSwitch` had no style;
  - disclosures had no animation without `x-collapse`.
