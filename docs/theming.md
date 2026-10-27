# Theme and variables

All appearance flows through CSS variables. No color is hard-coded in the
stylesheet: redefining these tokens is enough to build a complete theme, without
touching the JavaScript.

```css
/* On :root for the whole page, or on a container for a local theme. */
.my-theme {
    --magma-primary: #0a7d55;
    --magma-primary-hover: #086345;
    --magma-primary-soft: #e6f5ef;
    --magma-primary-tint: #c9e9dd;
    --magma-primary-ghost: #f1faf6;
    --magma-font: "Inter", system-ui, sans-serif;
}
```

## Accent

| Variable | Default | Usage |
| --- | --- | --- |
| `--magma-primary` | `#ff6602` | Accent color: solid buttons, active tab, checked boxes, bullets. |
| `--magma-primary-hover` | `#e85c00` | Hover of the accent. |
| `--magma-primary-active` | `#cc5200` | Pressed state. |
| `--magma-primary-soft` | `#ffece0` | Background of secondary buttons, selected row. |
| `--magma-primary-tint` | `#ffdbc4` | Hover of soft backgrounds. |
| `--magma-primary-ghost` | `#fff0e8` | Current pagination page. |

## States

| Variable | Default | Usage |
| --- | --- | --- |
| `--magma-yellow` | `#ffde54` | Yellow button, "Payin" chart. |
| `--magma-yellow-soft` | `#fff0b2` | Background of soft yellow actions. |
| `--magma-yellow-badge` | `#ffff99` | "In progress" or "pending" badge. |
| `--magma-yellow-badge-ink` | `#666600` | Text of that badge. |
| `--magma-yellow-ink` | `#332900` | Text on yellow. |
| `--magma-green` | `#12b312` | "Success" badge, "BaaS" chart. |
| `--magma-green-ink` | `#0a7a0a` | Green text on a light background. |
| `--magma-green-soft` | `#e0efe0` | Light green background. |
| `--magma-green-tint` | `#edfff7` | "Test" pill. |
| `--magma-green-dot` | `#00bf6f` | Animated dot of the pill. |
| `--magma-blue` | `#3d3dff` | "Active" badge, notification icon. |
| `--magma-blue-soft` | `#ebebff` | Light blue background. |
| `--magma-blue-mid` | `#ccccff` | "Developer" role badge. |
| `--magma-pink` | `#ffccd3` | Failure or open badge. |
| `--magma-pink-ink` | `#cc001b` | Text on pink. |
| `--magma-red` | `#e60023` | Notification counter. |

## Grays and text

| Variable | Default | Usage |
| --- | --- | --- |
| `--magma-gray-soft` | `#e6e6e6` | "Expired" badge. |
| `--magma-gray-ink` | `#999999` | Text of that badge. |
| `--magma-ink` | `#000000` | Primary text. |
| `--magma-title` | `#1a1a1a` | Titles. |
| `--magma-body` | `#404040` | Body text. |
| `--magma-muted` | `#808080` | Secondary text. |
| `--magma-placeholder` | `#bcbcbc` | Input placeholder text. |

## Surfaces and contrasts

| Variable | Default | Usage |
| --- | --- | --- |
| `--magma-surface` | `#ffffff` | Background of cards, panels and fields. |
| `--magma-page` | `#fafafa` | Page background. |
| `--magma-line` | `#e6e6e6` | Borders. |
| `--magma-line-soft` | `#f2f2f2` | Discreet separators, hovers. |
| `--magma-on-accent` | `#ffffff` | Text placed on the accent. |
| `--magma-on-dark` | `#ffffff` | Text placed on a dark background. |
| `--magma-overlay` | `rgba(26,26,26,.45)` | Backdrop behind a modal, drawer or sheet. |
| `--magma-scrollbar` | `#d7d7d7` | List scrollbar thumb. |
| `--magma-focus-ring` | `0 0 0 3px rgba(255,102,2,.18)` | Full focus ring, applied as-is via `box-shadow`. |
| `--magma-accent-glow` | `rgba(255,102,2,.28)` | Drop shadow of a solid button on hover. |
| `--magma-accent-halo` | `rgba(255,102,2,.12)` | Light shadow under an active field. |

If you change `--magma-primary`, remember to also adjust `--magma-focus-ring`,
`--magma-accent-glow` and `--magma-accent-halo`: these are independent `rgba()`
values, they don't recompute on their own.

## Typography and shapes

| Variable | Default |
| --- | --- |
| `--magma-font` | `"Montserrat", system-ui, …` |
| `--magma-font-mono` | `ui-monospace, …` |
| `--magma-r-sm` · `--magma-r-md` · `--magma-r-lg` · `--magma-r-xl` | `8px` · `12px` · `16px` · `20px` |
| `--magma-r-pill` | `999px` |

Radii feed the `radius` option as well: `radius: 'lg'` resolves to
`--magma-r-lg`, so a theme change on the token propagates to the panels.

## Elevations and motion

| Variable | Default |
| --- | --- |
| `--magma-shadow-sm` · `--magma-shadow-md` · `--magma-shadow-lg` | increasing shadows |
| `--magma-t-fast` · `--magma-t` · `--magma-t-slow` | `140ms` · `220ms` · `420ms` |
| `--magma-fast` · `--magma-base` · `--magma-slow` | `140ms` · `220ms` · `420ms` |
| `--magma-ease` · `--magma-ease-out` | animation curves |

## Panel width

| Variable | Default | Usage |
| --- | --- | --- |
| `--magma-menu-width` | `min(324px, calc(100vw - 48px))` | Width of a dropdown panel. Set automatically by the `menuWidth` / `size` options, or manually. |
| `--magma-menu-min-width` | `0` | Minimum width of selector menus (0 = none); the `magmaDropdown` panel sets its own minimum width to 240 px. |
| `--magma-menu-max-height` | `300px` (`324px` for the phone prefix) | Maximum height before the list scrolls. |
| `--magma-menu-padding` | `6px` (`8px` for the phone prefix) | Inner padding of the panel. |
| `--magma-menu-radius` | `var(--magma-r-md)` | Corner radius of the panel. |

## Panel appearance (`color`, `size`, `radius`)

The three selectors (`magmaSelect`, `magmaMultiSelect`, `magmaPhonePrefix`) accept
appearance options for a single instance. They are applied as CSS variables on
the panel itself, so they never leak to the rest of the page:

```html
<div class="magma-select"
     x-data="magmaSelect({
         color: '#0a7d55',   // accent of this panel only
         size: 'lg',         // width
         radius: 'pill',     // corners
         options: [ … ],
     })">
    …
    <div class="magma-select__menu" :style="menuStyle" …>
```

| Option | Accepted values | Effect |
| --- | --- | --- |
| `color` | any CSS color (`#0a7d55`, `oklch(…)`, `var(--my-brand)`) | Panel accent: hovered/selected row background and text, check mark, search border. |
| `size` | `'xs'` `160px` · `'sm'` `220px` · `'md'` `280px` · `'lg'` `340px` · `'xl'` `420px` · `'2xl'` `520px` · `'auto'` · a number of pixels · any CSS `width` | Panel width (`--magma-menu-width`). |
| `radius` | `'none'` · `'sm'` · `'md'` · `'lg'` · `'xl'` · `'pill'` · `'field'` · a number of pixels · any CSS `border-radius` | Panel corners (`--magma-menu-radius`). `'field'` copies the field's radius. |

`size` and `menuWidth` set the same variable: `size` takes precedence when both
are given. `radius: 'field'` reads the radius of the field — set either on the
component root (`.magma-select`, `.magma-phone`) or, for any other markup, on the
trigger itself.

The color is applied **only to the panel**. To recolor the trigger as well, set
the same variable on the root or override it per instance:

```html
<div class="magma-select" style="--magma-menu-accent: #0a7d55"> … </div>
```

Derived shades are computed with `color-mix()`, so a custom `color` needs no
matching `-soft` / `-tint` token. Without JavaScript or without options, the
same result is obtained by setting the variables in a class:

```css
.magma-select--brand {
    --magma-primary: #0a7d55;
    --magma-menu-width: 340px;
    --magma-menu-radius: 999px;
}
```

## Floating menus

Selector panels are laid out with `position: fixed` (`floating: true` by
default) to escape their ancestors' `overflow`. A consequence to know: in this
mode, **a percentage width resolves against the window**, not the field. The
component therefore freezes the trigger width in pixels. If you supply a width
yourself (`menuWidth: '50%'`), it will be interpreted as a percentage of the
window.

## Example: dark theme

```css
[data-theme="dark"] {
    --magma-surface: #16181d;
    --magma-page: #0e1013;
    --magma-line: #2a2e36;
    --magma-line-soft: #1e2127;

    --magma-ink: #f5f6f8;
    --magma-title: #f5f6f8;
    --magma-body: #c9ccd2;
    --magma-muted: #8b9099;
    --magma-placeholder: #6b7078;

    --magma-overlay: rgba(0, 0, 0, 0.65);
    --magma-scrollbar: #363b44;

    /* The accent stays vivid on a dark background. */
    --magma-primary-soft: #33241a;
    --magma-primary-tint: #4a3423;
    --magma-primary-ghost: #2a1d14;

    --magma-blue-soft: #1e2140;
    --magma-green-soft: #14281a;
    --magma-pink: #401c22;
    --magma-pink-ink: #ff8b9c;
    --magma-gray-soft: #2a2e36;
}
```

```html
<html data-theme="dark">
    <body class="magma-root">
        <!-- all components follow -->
    </body>
</html>
```

## Best practices

- Put `magma-root` on a container: the local reset (font, color, `box-sizing`)
  then applies without touching the rest of the page.
- A theme can be limited to a subtree: declare the variables on any ancestor of
  the components to theme.
- All variables are prefixed `magma-`: no risk of collision with your own token
  system.
- `prefers-reduced-motion` neutralizes animations and transitions; no need to
  handle it yourself.
