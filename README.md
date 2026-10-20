# Magma UI

A small **Alpine.js** component library, designed to work equally well with
**Alpine alone** or with **Alpine embedded by Livewire**. Zero runtime
dependencies: no CSS framework, no utilities, no remote font.

- **16 components**: selectors (local, remote, multiple, phone prefix), date and
  time picker (eight modes), modal, side drawer, bottom sheet, dropdown panel,
  accordion, tabs, pagination, notifications, search, refresh, copy, switch.
- **Built-in remote loading**: debounced server-side search, pagination, and
  "load more" on scroll.
- **Zero dependencies**: Alpine is a `peerDependency`, exactly like Alpine's
  official plugins.
- **Accessible**: full keyboard navigation, ARIA roles, visible focus.
- **Themeable via CSS variables**, unique `magma-` prefix.

---

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Alpine alone or Alpine + Livewire](#alpine-alone-or-alpine--livewire)
- [Remote loading and "load more"](#remote-loading-and-load-more)
- [Components](#components)
- [Customization](#customization)
- [Accessibility](#accessibility)
- [Compatibility](#compatibility)
- [Development](#development)
- [License](#license)

---

## Installation

```bash
npm install @momoledev/alpine-magma-ui-component
```

Alpine must be present in the application:

```bash
npm install alpinejs
```

### Without a bundler

```html
<link rel="stylesheet" href="https://unpkg.com/@momoledev/alpine-magma-ui-component/dist/magma-ui.css" />
<script src="https://unpkg.com/@momoledev/alpine-magma-ui-component/dist/magma-ui.global.js" defer></script>
<script src="https://unpkg.com/alpinejs/dist/cdn.min.js" defer></script>
```

The global bundle exposes `window.MagmaUI`, registers the components with Alpine,
and publishes each factory globally (`window.magmaSelect`, `window.magmaModal`,
…). The order of the two tags does not matter: if Alpine starts after the
library, registration is deferred until `alpine:init`.

---

## Quick start

```html
<link rel="stylesheet" href="/node_modules/@momoledev/alpine-magma-ui-component/dist/magma-ui.css" />

<div class="magma-root">
    <div
        class="magma-select"
        x-data="magmaSelect({
            value: 'ci',
            placeholder: 'Choose a country',
            options: [
                { value: 'ci', label: "Côte d'Ivoire" },
                { value: 'sn', label: 'Sénégal' },
            ],
        })"
        @click.outside="close()"
        :class="open && 'is-open'"
    >
        <button type="button" class="magma-select__trigger" x-ref="trigger" @click="toggle()" :aria-expanded="open">
            <span class="magma-select__value" x-text="currentLabel"></span>
            <svg class="magma-select__caret" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m6 9.5 6 6 6-6" /></svg>
        </button>

        <div class="magma-select__menu" x-ref="menu" :style="menuStyle" x-show="open" x-cloak
             x-transition:enter="magma-fade-enter" x-transition:enter-start="magma-fade-enter-start"
             x-transition:leave="magma-fade-leave" x-transition:leave-end="magma-fade-leave-end"
             role="listbox">
            <div class="magma-select__search">
                <input type="text" x-model="searchTerm" @input="onSearchInput()" x-ref="search" placeholder="Search" />
            </div>

            <ul class="magma-select__list" x-ref="list" @scroll="onListScroll($event)">
                <template x-for="(option, index) in visibleOptions" :key="option.value">
                    <li data-index="index">
                        <button type="button" class="magma-select__option"
                                :class="[String(option.value) === String(value) && 'is-selected', index === activeIndex && 'is-active']"
                                @click="choose(option)"
                                role="option"
                                :aria-selected="String(option.value) === String(value)">
                            <span class="magma-select__name" x-text="option.label"></span>
                        </button>
                    </li>
                </template>
            </ul>
        </div>
    </div>
</div>
```

A complete, self-contained, build-free example lives in
[`examples/index.html`](examples/index.html).

---

## Alpine alone or Alpine + Livewire

The library is designed for both scenarios.

### Alpine alone

```js
import Alpine from 'alpinejs';
import { install } from '@momoledev/alpine-magma-ui-component';
import '@momoledev/alpine-magma-ui-component/css';

install();                    // waits for `alpine:init` if Alpine isn't there yet
window.Alpine = Alpine;
Alpine.start();
```

### Alpine embedded by Livewire

Livewire 3 ships its own Alpine, so the library registers against that existing
instance:

```js
import { install } from '@momoledev/alpine-magma-ui-component';
import '@momoledev/alpine-magma-ui-component/css';

// Livewire is loaded via `@livewireScripts`: `window.Alpine` already exists
// by the time this module runs.
install({ Alpine: window.Alpine });
```

Or, if the load order isn't guaranteed, just let `install()` do the work: it
detects `window.Alpine`, and otherwise subscribes to `alpine:init`.

```js
install();   // covers both cases
```

### What Livewire compatibility implies

| Point | Handling |
| --- | --- |
| Alpine already started | `install()` registers immediately, and also publishes the factories globally so that `x-data="magmaSelect({…})"` works on HTML mounted later. |
| `wire:navigate` | Components live on the element: after a Livewire navigation, Alpine re-initializes state from `x-data`. No special code required. |
| Events | All outgoing events are prefixed `magma-` and emitted via `$dispatch`, so they are listenable with `Livewire.on('magma-select:change', …)` and `$wire.on(…)`. |
| Inputs | `$wire.dispatch('magma-notify', {…})` or `window.MagmaUI.notify({…})` feed the notification stack without coupling. |
| Server-side rendering | No component requires the DOM at `x-data` evaluation time: remote loading starts on open or via `init()`. |
| Animations | Enter/leave animations are **CSS animations**, never `x-transition`: Alpine does not apply these directives to the children of an `x-for`, which notifications depend on. |

---

## Remote loading and "load more"

Any selector accepts a URL instead of an array. The component then handles
debounced server-side search, pagination, and fetching subsequent pages.

```html
<div x-data="magmaSelect({
        url: '/api/countries',
        perPage: 25,
        valueKey: 'code',
        labelKey: 'name',
        searchParam: 'q',
        pageParam: 'page',
        debounce: 250,
        minChars: 2,
        loadMoreLabel: 'Load more countries',
        mapResponse: (payload) => ({ items: payload.results, hasMore: payload.next !== null }),
    })">
```

### Response contract

The component accepts the following formats without configuration:

```jsonc
// Plain array
[{ "value": "ci", "label": "Côte d'Ivoire" }]

// Object with explicit pagination
{ "data": [ … ], "hasMore": true }

// Laravel pagination
{ "data": [ … ], "current_page": 1, "last_page": 4 }

// "total" pagination
{ "data": [ … ], "total": 150, "current_page": 1 }
```

For any other format, `mapResponse(payload) → { items, hasMore }` takes over.

### Remote loading options

| Option | Default | Role |
| --- | --- | --- |
| `url` | `null` | Endpoint. When absent, the component stays local. |
| `perPage` | `25` | Page size announced to the server and used to infer `hasMore`. |
| `pageParam` | `'page'` | Name of the page parameter. |
| `searchParam` | `'search'` | Name of the search parameter. |
| `debounce` | `250` | Delay before re-running a search (ms). |
| `minChars` | `0` | Minimum length before sending the search. |
| `params` | `{}` or `() => ({})` | Additional parameters sent with each request. |
| `fetchOptions` | `{}` | Merged into the `fetch` call (headers, `signal`, …). |
| `credentials` | `'same-origin'` | Cookies policy. |
| `mapResponse` | – | Rewrites the server response. |
| `mapOption` | – | Rewrites each entry. |
| `valueKey` / `labelKey` | `'value'` / `'label'` | Entry keys. |
| `loadOnOpen` | `true` | Loads the first page on open. |
| `loadMoreLabel` | `'Load more'` | Label of the pagination button. |
| `onError` | `console.error` | Failure callback. |

### Triggers

- **On open**: the first page is requested if `loadOnOpen` is enabled.
- **On input**: the search restarts from page 1 after `debounce`.
- **On scroll**: `onListScroll($event)` on the list fires `loadMore()` when fewer
  than 48 px remain.
- **On click**: the `.magma-select__more` button calls `loadMore()`.
- **Automatically**: if the first page doesn't fill the visible height, the next
  pages are fetched to avoid an overly short list.

### Events

| Event | Detail |
| --- | --- |
| `magma-select:loaded` | `{ page, count, hasMore }` |
| `magma-select:error` | `{ message }` |
| `magma-select:change` | `{ value, option }` |

```js
document.addEventListener('magma-select:loaded', (event) => {
    console.log(event.detail.page, event.detail.count);
});
```

---

## Components

Each component has its own documentation:

| Component | Factory | Documentation |
| --- | --- | --- |
| Dropdown | `magmaSelect` | [docs/select.md](docs/select.md) |
| Multi-select | `magmaMultiSelect` | [docs/multi-select.md](docs/multi-select.md) |
| Phone prefix | `magmaPhonePrefix` | [docs/phone-prefix.md](docs/phone-prefix.md) |
| Date & time picker | `magmaDateTimePicker` | [docs/date-time-picker.md](docs/date-time-picker.md) |
| Modal dialog | `magmaModal` | [docs/modal.md](docs/modal.md) |
| Side drawer | `magmaDrawer` | [docs/drawer.md](docs/drawer.md) |
| Bottom sheet | `magmaSheet` | [docs/sheet.md](docs/sheet.md) |
| Dropdown panel | `magmaDropdown` | [docs/dropdown.md](docs/dropdown.md) |
| Accordion | `magmaAccordion` | [docs/accordion.md](docs/accordion.md) |
| Tabs | `magmaTabs` | [docs/tabs.md](docs/tabs.md) |
| Pagination | `magmaPagination` | [docs/pagination.md](docs/pagination.md) |
| Notifications | `magmaToasts` | [docs/toasts.md](docs/toasts.md) |
| Refresh | `magmaRefresh` | [docs/refresh.md](docs/refresh.md) |
| Search | `magmaSearch` | [docs/search.md](docs/search.md) |
| Copy | `magmaCopy` | [docs/copy.md](docs/copy.md) |
| Switch | `magmaSwitch` | [docs/switch.md](docs/switch.md) |
| Remote loading | – | [docs/remote.md](docs/remote.md) |
| **Theme and CSS variables** | – | [docs/theming.md](docs/theming.md) |

### Global API

```js
import { notify } from '@momoledev/alpine-magma-ui-component';

notify({ type: 'success', title: 'Saved', message: 'Your changes have been applied.' });
```

`notify()` emits the global `magma-notify` event, listened to by the
`magmaToasts` component. It is also available as `window.MagmaUI.notify` in the
global bundle, so it can be called from a Livewire component without importing
anything.

---

## Customization

Everything flows through CSS variables — **no color is hard-coded** in the
stylesheet. Override the tokens on `:root`, or on any ancestor of the components
to theme.

```css
.my-theme {
    --magma-primary: #0a7d55;
    --magma-primary-hover: #086345;
    --magma-primary-soft: #e6f5ef;
    --magma-font: "Inter", system-ui, sans-serif;
    --magma-r-sm: 6px;
}
```

The full list of tokens (accent, states, grays, surfaces, contrasts, typography,
radii, elevations, motion, panel width) and a **dark theme example** live in
[docs/theming.md](docs/theming.md).

```html
<html data-theme="dark">
    <body class="magma-root">
        <!-- all components follow the theme -->
    </body>
</html>
```

Add the `magma-root` class to a container to benefit from the local reset (font,
color, `box-sizing`) without touching the rest of the page.

### Dropdown panel width

The selectors (`magmaSelect`, `magmaMultiSelect`, `magmaPhonePrefix`) and the
dropdown panel (`magmaDropdown`) accept a `menuWidth` option:

| Value | Effect |
| --- | --- |
| *(absent)* | Default stylesheet width — `min(324px, calc(100vw - 48px))` for a selector, 240 px minimum for the dropdown panel. |
| `'field'` | The panel takes **exactly the field's width**. |
| `'auto'` | The panel fits its content, never narrower than the field. |
| `320` | Explicit width in pixels. |
| `'20rem'` | Any value accepted by `width`. |

```html
<div class="magma-select"
     x-data="magmaSelect({ menuWidth: 'field', options: [ … ] })">
    <button class="magma-select__trigger" …></button>

    <!-- `menuStyle` sets the --magma-menu-width variable -->
    <div class="magma-select__menu" :style="menuStyle" x-show="open" …>
        …
    </div>
</div>
```

Without JavaScript, the same variants exist as classes:
`magma-select__menu--field` and `magma-select__menu--auto`.

## Accessibility

- Triggers are real `<button>` elements with `aria-expanded` and
  `aria-haspopup="listbox"`.
- Lists carry `role="listbox"` / `role="option"` and `aria-selected`.
- Keyboard navigation: `↓` / `↑` move the selection, `Home` / `End` go to the
  ends, `Enter` confirms, `Escape` closes.
- The modal locks document scrolling and closes with `Escape`.
- `prefers-reduced-motion` neutralizes animations and transitions.
- Focus is always visible (`:focus-visible`) and follows the accent color.

---

## Compatibility

| Browser | Version |
| --- | --- |
| Chrome / Edge | ≥ 90 |
| Firefox | ≥ 90 |
| Safari | ≥ 15 |

Targets ES2020. No polyfill is required: `fetch`, `URL`,
`navigator.clipboard` (with an `execCommand` fallback), and `CustomEvent` are
native in these versions.

### Two Alpine pitfalls to know

**1. An isolated trigger needs its own `x-data`.** On load, Alpine only
initializes directives inside `x-data` scopes. An `@click` placed on a static
element that isn't under any `x-data` is never wired up: the click does nothing,
with no console error. This is the case for buttons that open a modal, since
they are necessarily outside its scope.

```html
<!-- The x-data is required -->
<button x-data @click="$dispatch('magma-open', { name: 'edition' })">Edit</button>
```

An element added to the DOM later (Alpine sees it through its observer) is
initialized even outside scope: the pitfall only concerns HTML present at load.

**2. Prefer `cond ? 'class' : ''` over `cond && 'class'`.** Alpine 3.17 writes
the boolean value as-is into the `class` attribute, producing a spurious `false`
class on the element (`<div class="magma-toast false">`) that is absent in 3.15.
The ternary returns an empty string in all versions:
`scripts/fix-class-idioms.py` rewrites the `:class` attributes of a file.

---

## Development

```bash
npm run build     # generates dist/magma-ui.esm.js, dist/magma-ui.global.js and dist/magma-ui.css
```

The generator only uses Node's native modules: relative imports, topological
bundling, `export` rewriting. No transpiler, no minifier, no external tool.

### The styles come from the application

`src/styles/magma-ui.css` is **generated**: the application's stylesheet
(`resources/css/new-design.css`, itself pixel-matched to the mockups) is the
reference, and the library is its exact transposition under the `magma-` names
(classes, variables, and animations renamed; the accordion reuses the FAQ style,
the tabs those of the dashboard filters).

```bash
python packages/magma-ui/scripts/generate-styles.py   # transposition
python packages/magma-ui/scripts/compare-styles.py    # parity check
npm run build
```

`compare-styles.py` verifies that no component selector is missing and no
declaration diverges: it should exit with no diff. Always fix the style in the
application, never in the generated file.

Browse [`examples/index.html`](examples/index.html) in a browser to see each
component in action, including simulated remote loading.

A standalone Vite mini-project that installs the package and serves as a test
bed for the 16 components lives in [`examples/mini-alpine`](examples/mini-alpine)
(`npm install && npm run dev`).

---

## License

MIT — see [LICENSE](LICENSE).
