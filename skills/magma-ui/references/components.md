# Component API cards

Paths are relative to the installed package root. Always read the full
`docs/<component>.md` before writing markup: it contains the skeleton with the
required classes and refs.

## Selection

Appearance of the three selector panels stays per instance: `color` (accent of
hover/selection, check mark, search border), `size` (`'xs'`…`'2xl'`, `'auto'`,
pixels, CSS width; same variable as `menuWidth`, which it overrides) and
`radius` (`'none'`…`'xl'`, `'pill'`, `'field'`, pixels, CSS radius). They only
set CSS variables on the panel via `:style="menuStyle"`, so keep that binding.
For a global look, override `--magma-menu-accent`, `--magma-menu-width`,
`--magma-menu-radius`, `--magma-menu-max-height` or `--magma-menu-padding`
instead.

### `magmaSelect` — `docs/select.md`

- Root: `.magma-select`; trigger `x-ref="trigger"`, panel `x-ref="menu"`.
- Config: `options`, `value`, `searchable`, `placeholder`, `emptyLabel`,
  `loadingLabel`, `errorLabel`, `loadMoreLabel`, `floating`, `menuWidth`,
  `color`, `size`, `radius`.
- Remote: `url`, `perPage`, `pageParam`, `searchParam`, `debounce`, `minChars`,
  `params`, `headers`, `credentials`, `mapResponse`, `mapOption`,
  `valueKey`, `labelKey`, `loadOnOpen`, `onError`.
- Methods: `toggle()`, `show()`, `close()`, `choose(option)`,
  `onSearchInput()`, `onKeydown(event)`, `loadMore()`, `load(reset)`.
- State: `open`, `value`, `options`, `visibleOptions`, `currentLabel`,
  `searchTerm`, `activeIndex`, `loading`, `error`, `hasMore`, `isEmpty`.
- Event: `magma-select:change` `{ value, option }`.

### `magmaMultiSelect` — `docs/multi-select.md`

- Root: `.magma-select`; same refs as select.
- Config: `options`, `values`, `searchable`, `placeholder`, `allLabel`,
  `selectedLabel`, `emptyLabel`, `loadingLabel`, `errorLabel`, `loadMoreLabel`,
  `floating`, `menuWidth`, `color`, `size`, `radius`, plus the remote options.
- Methods: `choose(option)`, `toggleAll()`, `clear()`, `onKeydown(event)`.
- State: `values`, `label`, `allSelected` (visible options only).
- Event: `magma-multiselect:change` `{ values }`.
- `toggleAll()` never changes values hidden by the current filter.
- The doc skeleton only shows the "load more" footer. For no-results, loading
  and error states, reuse the footer block from `docs/select.md` with
  `isEmpty`, `loading`, `error`, `emptyLabel`, `loadingLabel` and
  `errorLabel`; the classes are shared.

### `magmaPhonePrefix` — `docs/phone-prefix.md`

- Root: `.magma-phone`; trigger `x-ref="trigger"`, panel `x-ref="menu"`.
- Config: `value` (`+225`), `code` (`ci`), `options`, `searchable`,
  `emptyLabel`, `loadingLabel`, `errorLabel`, `loadMoreLabel`, `floating`,
  `menuWidth`, `color`, `size`, `radius`, plus remote options.
- Methods: `choose(option)`, `clear()`, `onKeydown(event)`.
- State: `currentDial`, `currentOption`, `visibleOptions`.
- Event: `magma-phone:change` `{ dial, code }`.

### `magmaDropdown` — `docs/dropdown.md`

- Root: `.magma-dropdown`; trigger `x-ref="trigger"`, panel `x-ref="menu"`
  (`.magma-menu`).
- Config: `menuWidth`, `floating`.
- Methods: `toggle()`, `show()`, `close()`.
- Event: `magma-dropdown:change` `{ open }`.

## Overlays

### `magmaModal` — `docs/modal.md`

- Root: `.magma-modal`; panel class `.magma-modal__panel`.
- Config: `open`, `name`, `lockScroll`.
- Methods: `show()`, `hide()`, `toggle()`.
- Open from the server: `$this->dispatch('magma-open', name: 'edition')`.
- Events: `magma-modal:opened`, `magma-modal:closed` `{ name }`.
- Panel structure: fixed head, scrolling body, fixed foot.

### `magmaDrawer` — `docs/drawer.md`

- Root: `.magma-drawer` with `:class="'magma-drawer--' + side"`; panel
  `x-ref="panel"` and `tabindex="-1"`.
- Config: `open`, `name`, `side`, `size`, `lockScroll`, `closeOnBackdrop`.
- Methods: `show()`, `hide()`, `toggle()`, `onBackdrop()`.
- Commands/events: `magma-drawer:open`, `magma-drawer:close`;
  `magma-drawer:opened`, `magma-drawer:closed`.
- Focus panel: `x-ref="panel"`, `tabindex="-1"`.

### `magmaSheet` — `docs/sheet.md`

- Root: `.magma-sheet`; panel `x-ref="panel"`, grabber
  `.magma-sheet__grabber`.
- Config: `open`, `name`, `lockScroll`, `closeOnBackdrop`, `swipeToClose`,
  `maxHeight`.
- Methods: `show()`, `hide()`, `toggle()`, `onBackdrop()`, `startDrag(event)`,
  `onDragMove(event)`, `onDragEnd()`.
- Commands/events: `magma-sheet:open`, `magma-sheet:close`;
  `magma-sheet:opened`, `magma-sheet:closed`.

## Date and time

### `magmaDateTimePicker` — `docs/date-time-picker.md`

Read `references/date-time-picker.md`. Key points:

- Root: `.magma-datepicker`; trigger `x-ref="trigger"`, panel `x-ref="panel"`.
- Modes: `date`, `datetime`, `multiple`, `range`, `time`, `month`, `year`,
  `week`.
- Event: `magma-datepicker:change` `{ value, mode }`; week adds
  `{ start, end }`.
- `inline: true` removes trigger, overlay and dialog.
- `range` renders two months and a shortcut rail.

## Navigation and content

### `magmaAccordion` — `docs/accordion.md`

- Root: `.magma-accordion`; items use `.magma-disclosure.is-open`.
- Config: `open` (section key), `items` for the demo loop.
- Methods: `isOpen(key)`, `toggle(key)`, `close()`.
- Event: `magma-accordion:change` `{ key, open }`.

### `magmaTabs` — `docs/tabs.md`

- Root: `.magma-tabs` with `role="tablist"`; tabs use `.magma-tab`.
- Config: `current`.
- Methods: `select(tab)`, `is(tab)`.
- Event: `magma-tabs:change` `{ tab }`.

### `magmaPagination` — `docs/pagination.md`

- Root: `.magma-pagination`.
- Config: `page`, `perPage`, `total`, `window`.
- Computed: `lastPage`, `from`, `to`, `pages`.
- Methods: `goTo(page)`, `next()`, `previous()`.
- Event: `magma-page:change` `{ page }`.

### `magmaSearch` — `docs/search.md`

- Root: `.magma-search`.
- Config: `term`, `live`, `debounce`, `busyDuration`.
- Methods: `clear()`, `submit()`, `onInput()`.
- Events: `magma-search` `{ term }` (deferred), `magma-search:submit`
  `{ term }`.
- With Livewire:
  `@magma-search.debounce.300ms="$wire.set('search', $event.detail.term)"`.

## Feedback and utilities

### `magmaToasts` — `docs/toasts.md`

- Root: `.magma-toasts`; listens for `magma-notify`.
- Config: `duration`, `leaveDuration`.
- Methods: `push(payload)`, `remove(id)`, `clear()`.
- Payload: `type`, `title`, `message`, `duration`.
- From JS: `window.MagmaUI.notify({...})`.
- From Livewire: `$this->dispatch('magma-notify', type: 'success', ...)`.

### `magmaRefresh` — `docs/refresh.md`

- Root: usually `.magma-btn`; state `spinning`.
- Config: `action` (async), `duration`, `title`, `message`, `type`.
- Method: `run()`; concurrent calls are ignored.
- Events: `magma-refresh:start`, `magma-refresh:done`.

### `magmaCopy` — `docs/copy.md`

- Root: usually `.magma-btn`.
- Config: `value`, `feedbackDuration`; state `copied`.
- Method: `copy(value?)`.
- Event: `magma-copy:done` `{ value }`.

### `magmaSwitch` — `docs/switch.md`

- Root: `.magma-switch`; add `.is-on` when on.
- Config: `on`; methods `toggle()`, `set(value)`.
- Event: `magma-switch:change` `{ value }`.

## Remote response contract

A selector becomes remote as soon as it receives `url`. Accepted responses:

```jsonc
// Plain array, one page
[{ "value": "ci", "label": "Côte d'Ivoire" }]

// Known page size
{ "data": [{ "value": "ci", "label": "Côte d'Ivoire" }], "hasMore": true }

// Custom shape
{ "results": [...], "next": "/api/countries?page=2" }
```

Use `mapResponse(payload) => ({ items, hasMore })` and
`mapOption(entry) => ({ value, label, ... })` when the server shape differs.
