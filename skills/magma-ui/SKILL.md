---
name: magma-ui
description: Build or modify interfaces with Magma UI, the Alpine.js component library @momoledev/alpine-magma-ui-component. Use when the user mentions magma-* classes, magmaSelect, magmaMultiSelect, magmaPhonePrefix, magmaDateTimePicker, Magma modal/drawer/sheet, or asks for Alpine selects, date/time pickers, range calendars, modals, drawers, sheets, accordions, tabs, pagination, search, copy, switch, refresh or toasts. Also use for French requests about composants Alpine, sélecteur, date picker, modale, tiroir, feuille ou accordéon.
license: MIT
---

# Magma UI

Magma UI separates behavior from markup: each Alpine factory owns state, data
loading and keyboard logic, while the HTML supplies the canonical structure and
class names. The safest workflow is to reuse an existing markup skeleton instead
of inventing one.

## 1. Confirm the integration

Check the project before writing code.

1. `package.json` contains `@momoledev/alpine-magma-ui-component` and
   `alpinejs`. If not, install them:

   ```bash
   npm install @momoledev/alpine-magma-ui-component alpinejs
   ```

2. The stylesheet is imported once, at the application entry point:

   ```js
   import '@momoledev/alpine-magma-ui-component/css';
   ```

3. Components are registered before or after Alpine starts:

   ```js
   import Alpine from 'alpinejs';
   import { install } from '@momoledev/alpine-magma-ui-component';
   import '@momoledev/alpine-magma-ui-component/css';

   install();          // waits for alpine:init if Alpine is not ready yet
   window.Alpine = Alpine;
   Alpine.start();
   ```

   With Livewire 3, Alpine already exists:

   ```js
   import { install } from '@momoledev/alpine-magma-ui-component';
   install({ Alpine: window.Alpine });
   ```

   Without a bundler, load `dist/magma-ui.css` and `dist/magma-ui.global.js`;
   the global bundle exposes the factories on `window`.

Do not add a second copy of Alpine when Livewire provides it.

## 2. Pick the component

All factory names are registered with Alpine and exposed globally. The package
root is usually `node_modules/@momoledev/alpine-magma-ui-component`.

| Factory | Root class | Read this first |
| --- | --- | --- |
| `magmaSelect` | `magma-select` | `docs/select.md` |
| `magmaMultiSelect` | `magma-select` | `docs/multi-select.md` |
| `magmaPhonePrefix` | `magma-phone` | `docs/phone-prefix.md` |
| `magmaDropdown` | `magma-dropdown` | `docs/dropdown.md` |
| `magmaModal` | `magma-modal` | `docs/modal.md` |
| `magmaDrawer` | `magma-drawer` | `docs/drawer.md` |
| `magmaSheet` | `magma-sheet` | `docs/sheet.md` |
| `magmaDateTimePicker` | `magma-datepicker` | `docs/date-time-picker.md` |
| `magmaAccordion` | `magma-accordion` | `docs/accordion.md` |
| `magmaTabs` | `magma-tabs` | `docs/tabs.md` |
| `magmaPagination` | `magma-pagination` | `docs/pagination.md` |
| `magmaToasts` | `magma-toasts` | `docs/toasts.md` |
| `magmaRefresh` | `magma-btn` | `docs/refresh.md` |
| `magmaSearch` | `magma-search` | `docs/search.md` |
| `magmaCopy` | `magma-btn` | `docs/copy.md` |
| `magmaSwitch` | `magma-switch` | `docs/switch.md` |

Read `references/components.md` for a compact API card of every component, and
`references/date-time-picker.md` before touching the date/time picker.

Read the matching `docs/<component>.md` before writing markup. Those files
contain the canonical skeleton: trigger, panel, option loop, empty/loading
states, `x-ref` names and transition classes. Copying that skeleton is faster
and safer than reconstructing it from memory. The short snippets in a doc's
overview are intentionally minimal; the component may also require a search
field, a footer state block or `@keydown="onKeydown($event)"`. Use the full
skeleton rather than inferring that an omitted element is unnecessary.

## 3. Wire a component

Every component follows the same shape:

```html
<div class="magma-select"
     x-data="magmaSelect({ value: 'ci', options })"
     @click.outside="close()"
     :class="open && 'is-open'">
    <button type="button" class="magma-select__trigger"
            x-ref="trigger" @click="toggle()" :aria-expanded="open">
        <span class="magma-select__value" x-text="currentLabel"></span>
    </button>

    <div class="magma-select__menu" x-ref="menu" :style="menuStyle"
         x-show="open" x-cloak role="listbox">
        <!-- option list from docs/select.md -->
    </div>
</div>
```

Rules that prevent most breakage:

- Keep `x-ref="trigger"` and `x-ref="menu"` (or `x-ref="panel"` for the date
  picker). Floating panels measure those elements to position themselves.
- Keep `:style="menuStyle"` and `x-show="open"` on floating panels.
- Keep `x-cloak` on panels so they do not flash before Alpine starts.
- Add `@click.outside="close()"` to floating components (select, multi-select,
  phone prefix, dropdown, date picker). Modals, drawers and sheets handle their
  backdrop internally.
- Wrap the application or page section in `class="magma-root"` to inherit the
  library typography and base resets.
- Do not put a floating panel inside an ancestor with `overflow: hidden`
  without keeping `floating: true`; fixed positioning is what escapes clipping.

## 4. Values and events

Components are controlled through their `x-data` config, not `x-model`. Listen
to the outgoing event and update the application state or Livewire property.
Initial config values do not emit a change event, so seed the external state to
the same value.

```html
<div x-data="magmaSelect({ value: @js($country), options: @js($countries) })"
     @magma-select:change="$wire.set('country', $event.detail.value)">
    ...
</div>
```

When a value contains an apostrophe, pass it through `@js()` in Blade or use a
single-quoted JS string. A double-quoted JS string inside a double-quoted
`x-data` attribute breaks the HTML (`"Côte d'Ivoire"` is the common trap).

Default UI labels differ between components and may not match the English
examples. Pass `placeholder`, `emptyLabel`, `allLabel`, `selectedLabel`,
`todayLabel`, etc. explicitly when the UI language matters.

Outgoing events use `$dispatch` and the `magma-` prefix, so they work with
`addEventListener`, Alpine `@magma-…`, `Livewire.on('magma-…', …)` and
`$wire.on(…)`.

| Component | Event and detail |
| --- | --- |
| Select | `magma-select:change` `{ value, option }` |
| Multi-select | `magma-multiselect:change` `{ values }` |
| Phone prefix | `magma-phone:change` `{ dial, code }` |
| Dropdown | `magma-dropdown:change` `{ open }` |
| Date/time picker | `magma-datepicker:change` `{ value, mode }` |
| Accordion | `magma-accordion:change` `{ key, open }` |
| Tabs | `magma-tabs:change` `{ tab }` |
| Pagination | `magma-page:change` `{ page }` |
| Switch | `magma-switch:change` `{ value }` |
| Copy | `magma-copy:done` `{ value }` |
| Search | `magma-search` `{ term }`, `magma-search:submit` `{ term }` |
| Refresh | `magma-refresh:start`, `magma-refresh:done` |

Remote selectors also emit `magma-select:loaded` and `magma-select:error`.

## 5. Date/time picker essentials

One factory covers eight modes. Pick the mode first; the value shape follows.

| Mode | Value |
| --- | --- |
| `date` | `'YYYY-MM-DD'` |
| `datetime` | `'YYYY-MM-DDTHH:mm:ss'` |
| `multiple` | `['YYYY-MM-DD', …]` |
| `range` | `{ start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }` |
| `time` | `'HH:mm'` |
| `month` | `'YYYY-MM'` |
| `year` | `'YYYY'` |
| `week` | `'YYYY-Www'` (ISO week) |

`datetime` keeps the panel open; day and time edits update the value
immediately. `multiple` also stays open by default. `range` shows two months
and a shortcuts rail; apply a shortcut with `applyShortcut(shortcut)`. Passing
a `shortcuts` array replaces the built-in presets rather than extending them.

Common options: `locale`, `weekStartsOn`, `min`, `max`, `disabledDates`,
`disabled`, `timeStep`, `closeOnSelect`, `panelWidth`, `floating`, `inline`,
`format`, `shortcuts`, `shortcutsLabel`.

Use `inline: true` for a calendar embedded in a form or card. It renders no
trigger, overlay or dialog and `close()` is a no-op.

Custom range shortcuts accept a label plus a named period, a fixed range or a
function:

```js
magmaDateTimePicker({
    mode: 'range',
    shortcuts: [
        { label: 'Ce mois', period: 'this-month' },
        { label: '3 derniers mois', period: 'last-months', amount: 3 },
        { label: 'T1 2026', range: { start: '2026-01-01', end: '2026-03-31' } },
    ],
});
```

Read `references/date-time-picker.md` for the mode matrix, option defaults,
datetime markup and range markup.

## 6. Livewire, remote data and notifications

- Remote selectors need only `url`; the component handles debounce, page and
  search parameters, loading and `hasMore`. The response may be a plain array,
  `{ data, hasMore }` or a custom `mapResponse`.
- Match `searchParam` and `pageParam` to the endpoint. The defaults are
  `search` and `page`; an endpoint expecting `q` must receive
  `searchParam: 'q'`.
- Remote labels resolve from loaded options. If the initial value is not on the
  first page, seed `options` with that option or make the endpoint include it in
  page 1; there is no separate selected-label lookup.
- The search field is markup, not a config switch: keep it in the skeleton, or
  remove it deliberately and wire your own input to `searchTerm` /
  `onSearchInput()`.
- Add `wire:key` to repeated Livewire rows that contain components. Alpine state
  lives on the element, so reusing a DOM node across different records can keep
  the wrong state.
- Open a named modal from the server with
  `$this->dispatch('magma-open', name: 'edition')`; drawers and sheets use
  `magma-drawer:open` / `magma-sheet:open`.
- Push a toast from JavaScript with `window.MagmaUI.notify({...})`, or from
  Livewire with `$this->dispatch('magma-notify', ...)`.
- Theme through CSS variables on `:root` or a wrapper: `--magma-primary`,
  `--magma-primary-hover`, `--magma-primary-soft`, `--magma-surface`,
  `--magma-line`, `--magma-ink`, `--magma-font`. See `docs/theming.md`.

## 7. Finish with a check

Before reporting done:

1. The component markup matches its `docs/<component>.md` skeleton.
2. Required refs, `menuStyle`, `x-show`, `x-cloak` and `@click.outside` are
   present where the skeleton has them.
3. The event name and value shape match the tables above.
4. The app builds and the browser console has no Alpine expression or missing
   factory errors.
5. Keyboard paths still work: arrows, `Home`/`End`, `Enter`, `Escape`, `Tab`.

When the package docs and this skill disagree, trust the installed package's
`docs/` and `src/components/*.js`; they are versioned with the code.
