# Changelog

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
versioning follows [SemVer](https://semver.org/).

## 1.1.0 — 2026-10-27

### Added

- `magmaDrawer` — drawer anchored to the right, left, top or bottom, with
  backdrop, scroll locking, focus and directional transitions.
- `magmaSheet` — sheet anchored at the bottom, swipe-to-close from the grabber,
  enter/exit transitions and configurable maximum height.
- `magmaDateTimePicker` — one picker with eight modes: date, datetime, multiple,
  range, time, month, year and ISO week; datetime combines the calendar, a
  month/year switcher and a single bordered `HH:MM:SS` widget in the same panel;
  the month/year switcher is shared by date, datetime, multiple, range and week
  modes, with keyboard navigation (including `ArrowUp`/`ArrowDown` stepping on
  the time fields), min/max, disabled dates, localized labels and floating or
  inline rendering (`inline: true`, no trigger/overlay/dialog). Range mode shows
  two consecutive months and a customizable shortcuts rail (`shortcuts`,
  `period`/`range`/`getRange`, label per entry; `shortcuts: false` to hide it).
  The datetime `HH:MM:SS` widget is one rounded bordered field with large
  numeric values.
- Scroll locking shared between modal, drawer and sheet: the page only becomes
  scrollable again once the last layer is closed.
- `magma-disclosure` — pure-CSS open/close animation (`grid-template-rows`),
  used by the accordion; the `@alpinejs/collapse` plugin is no longer needed.
- `skills/magma-ui` — distributable AI agent skill with installation, markup
  contract, component API cards and date/time picker reference; install guide in
  `docs/skill.md`.
- Selector panels (`magmaSelect`, `magmaMultiSelect`, `magmaPhonePrefix`) accept
  `color`, `size` and `radius` options to customize a single panel; shades
  derived from `color` are computed with `color-mix()` and the new
  `--magma-menu-radius`, `--magma-menu-max-height` and `--magma-menu-padding`
  tokens join `--magma-menu-width` (`panelAppearanceStyle` exported from
  `menu.js`).

### Fixed

- `magmaMultiSelect` is registered with the other components (it was missing
  from the registry); keyboard navigation, `Escape`, active-option scrolling and
  search reset are handled.
- "Select all" now only acts on visible options and does not modify values hidden
  by the filter.
- The selectors and the phone prefix clear their search on close and reload the
  first page on reopen in remote mode.
- The `magma-multiselect:change` event carries a real array and
  `magma-select:change` a shallow copy of the option.
- `.magma-select__menu` is a flex column: the search and the footer stay fixed,
  only the list scrolls; remote loading no longer chains all pages
  automatically.
- `magmaSwitch` finally has an "on" state style (`is-on`) and a visible focus
  ring.
- Floating panels now accept either `x-ref="menu"` or `x-ref="panel"` and
  re-measure after their content is laid out, so tall date/time grids flip
  above the field instead of overflowing the viewport.
- Pagination stacks its counter and controls on narrow screens, avoiding
  horizontal overflow.

## 1.0.0 — 2026-10-15

First published version under the name `@momoledev/alpine-magma-ui-component`.

### Components

- `magmaSelect` — single-select dropdown, local or remote, with search,
  pagination and "load more".
- `magmaMultiSelect` — multiple selection, global selection, counter.
- `magmaPhonePrefix` — phone prefix, search by country, dial code or region,
  clearing the number.
- `magmaModal` — modal with scroll locking, closing via `Escape` and backdrop
  click, remote opening via `magma-open`.
- `magmaDropdown` — dropdown panel, base of top-bar menus.
- `magmaAccordion` — single-open accordion.
- `magmaTabs` — local tabs.
- `magmaPagination` — counter, direct jump, computed numbers.
- `magmaToasts` — notification stack driven by the global `magma-notify` event.
- `magmaRefresh` — refresh button with execution state.
- `magmaSearch` — search with debounce and submission events.
- `magmaCopy` — clipboard copy with `execCommand` fallback.
- `magmaSwitch` — accessible switch.

### Shared mechanics

- `createRemoteState` — AJAX loading, debounced server-side search, pagination
  and "load more" on scroll.
- `normalizeResponse` — support for plain arrays, `hasMore`, Laravel pagination
  and total-based pagination.
- `emit` — event emission tolerant of Alpine's absence (tests, Node).

### Theme

- Complete palette of CSS variables: accent, states, grays, surfaces, contrasts,
  typography, radii, elevations, motion and panel width. **No hard-coded color**
  remains in the stylesheet.
- `--magma-focus-ring` carries the full focus ring (applied as `box-shadow`).
- Dark theme example and full reference in `docs/theming.md`.

### Panel width

- New `menuWidth` option on `magmaSelect`, `magmaMultiSelect`, `magmaPhonePrefix`
  and `magmaDropdown`: `'field'` (field width), `'auto'` (content width, never
  narrower than the field), a number of pixels or any CSS value.
- The `menuStyle` getters and the `magma-select__menu--field` / `--auto` classes
  cover both use cases, with and without JavaScript.

### Fixed

- **Modal**: the panel is now a three-zone column — fixed head and foot, body
  alone scrolling. The title no longer scrolls away with the content.
- **Dropdown menus**: floating positioning (`floating`, enabled by default). The
  panel is laid out in the window coordinate space and follows its trigger on
  scroll, resize and size change. It is no longer clipped by a modal's, card's or
  cell's `overflow`, and flips above the field when there is no room underneath.


- Notifications animate again: entry and exit are state-driven CSS animations
  (`is-leaving`), because Alpine does not apply `x-transition` directives carried
  by the children of an `x-for`. The documentation no longer recommended that
  pattern.

### Notable points

- No runtime dependency; Alpine is an optional `peerDependency`.
- Registration compatible with Alpine alone **and** with Alpine embedded by
  Livewire, regardless of load order.
- Standalone stylesheet, driven by CSS variables, `magma-` prefix.
- The selector panel separates the search, the list and the footer: the search
  stays visible while only the list scrolls.
