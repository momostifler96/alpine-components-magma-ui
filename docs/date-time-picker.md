# `magmaDateTimePicker` — date and time picker

One component, eight modes: a single date, a combined date and time, multiple
dates, a date range, a time, a month, a year or an ISO week. The panel is
positioned like the other Magma floating panels and works without any external
date library.

## Overview

Changing `mode` and the shape of `value` is enough to switch variants; the
markup stays the same. The overview below shows the date mode. The month/year
switcher shared by date-based modes and the datetime time fields are described
in [Datetime mode](#datetime-mode).

```html
<div class="magma-datepicker"
     x-data="magmaDateTimePicker({ mode: 'date', value: '2026-10-20', locale: 'en-US' })"
     @click.outside="close({ restoreFocus: false })" :class="open ? 'is-open' : ''">

    <div class="magma-datepicker__field">
        <button type="button" class="magma-datepicker__trigger"
                x-ref="trigger" @click="toggle()" @keydown.down.prevent="show()"
                :aria-expanded="open" aria-haspopup="dialog">
            <svg class="magma-datepicker__icon" width="18" height="18" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <rect x="3" y="5" width="18" height="16" rx="2"/>
                <path d="M16 3v4M8 3v4M3 10h18"/>
            </svg>
            <span class="magma-datepicker__value"
                  :class="hasValue ? '' : 'is-placeholder'" x-text="displayValue"></span>
        </button>

        <button type="button" class="magma-datepicker__clear"
                x-show="hasValue" x-cloak @click.stop="clear()" aria-label="Clear">×</button>
    </div>

    <div class="magma-datepicker__panel" x-ref="panel" x-show="open" x-cloak
         tabindex="-1" role="dialog" :aria-label="panelLabel" :style="menuStyle"
         @keydown="onKeydown($event)"
         x-transition:enter="magma-fade-enter"
         x-transition:enter-start="magma-fade-enter-start"
         x-transition:leave="magma-fade-leave"
         x-transition:leave-end="magma-fade-leave-end">

        <div class="magma-datepicker__head">
            <button type="button" class="magma-datepicker__nav" @click="previous()"
                    x-show="mode !== 'time'" aria-label="Previous">‹</button>
            <span class="magma-datepicker__title" x-text="calendarTitle"></span>
            <button type="button" class="magma-datepicker__nav" @click="next()"
                    x-show="mode !== 'time'" aria-label="Next">›</button>
        </div>

        <div class="magma-datepicker__weekdays"
             :class="mode === 'week' ? 'magma-datepicker__weekdays--weeks' : ''"
             x-show="['date', 'datetime', 'multiple', 'range', 'week'].includes(mode)" aria-hidden="true">
            <span x-show="mode === 'week'"></span>
            <template x-for="(name, index) in weekdayNames" :key="index">
                <span class="magma-datepicker__weekday" x-text="name"></span>
            </template>
        </div>

        <div class="magma-datepicker__grid" role="grid" @mouseleave="hoverDate = null"
             x-show="['date', 'multiple', 'range'].includes(mode)">
            <template x-for="day in calendarDays" :key="day.iso">
                <button type="button" class="magma-datepicker__day"
                        :class="[day.inMonth ? '' : 'is-other', day.selected ? 'is-selected' : '', day.inRange ? 'is-in-range' : '', day.rangeStart ? 'is-range-start' : '', day.rangeEnd ? 'is-range-end' : '', day.today ? 'is-today' : '', day.active ? 'is-active' : '']"
                        :disabled="day.disabled" :aria-label="day.label"
                        :aria-pressed="day.selected" :aria-current="day.today ? 'date' : null"
                        @click="selectDate(day.iso)" @mouseenter="hoverDate = day.iso"
                        @focus="activeDate = day.iso" x-text="day.day"></button>
            </template>
        </div>

        <div class="magma-datepicker__weeks" x-show="mode === 'week'">
            <template x-for="week in weeks" :key="week.key">
                <button type="button" class="magma-datepicker__week"
                        :class="week.selected ? 'is-selected' : ''" :disabled="week.disabled"
                        :aria-label="week.label" :aria-pressed="week.selected" @click="selectWeek(week)">
                    <span class="magma-datepicker__week-number" x-text="week.week"></span>
                    <template x-for="day in week.days" :key="day.iso">
                        <span class="magma-datepicker__week-day"
                              :class="[day.inMonth ? '' : 'is-other', day.today ? 'is-today' : '']"
                              x-text="day.day"></span>
                    </template>
                </button>
            </template>
        </div>

        <div class="magma-datepicker__grid magma-datepicker__grid--months" x-show="mode === 'month'">
            <template x-for="month in months" :key="month.key">
                <button type="button" class="magma-datepicker__cell"
                        :class="month.selected ? 'is-selected' : ''" :disabled="month.disabled"
                        :aria-pressed="month.selected" @click="selectMonth(month.index)"
                        x-text="month.label"></button>
            </template>
        </div>

        <div class="magma-datepicker__grid magma-datepicker__grid--years" x-show="mode === 'year'">
            <template x-for="year in years" :key="year.year">
                <button type="button" class="magma-datepicker__cell"
                        :class="year.selected ? 'is-selected' : ''" :disabled="year.disabled"
                        :aria-pressed="year.selected" @click="selectYear(year.year)"
                        x-text="year.year"></button>
            </template>
        </div>

        <div class="magma-datepicker__time" x-show="mode === 'time'">
            <template x-for="slot in timeOptions" :key="slot.value">
                <button type="button" class="magma-datepicker__time-option"
                        :class="slot.selected ? 'is-selected' : ''" :aria-pressed="slot.selected"
                        @click="selectTime(slot.value)" x-text="slot.value"></button>
            </template>
        </div>

        <div class="magma-datepicker__foot">
            <button type="button" class="magma-datepicker__action"
                    @click="selectToday()" x-text="todayLabel"></button>
            <button type="button" class="magma-datepicker__action magma-datepicker__action--muted"
                    @click="clear()" x-text="clearLabel"></button>
        </div>
    </div>
</div>
```

> `x-ref="trigger"` and `x-ref="panel"` are required by the floating
> positioning. Without them the panel falls back to absolute positioning.

The overview shows the date mode. Datetime adds the time widget below the day
grid; range replaces the single day grid with the two-month block described in
[Range: two months and shortcuts](#range-two-months-and-shortcuts).

## Datetime mode

`mode: 'datetime'` combines the calendar, a month/year switcher and
hour/minute/second numeric fields in one panel. The value is a local datetime
string:
`'2026-10-20T14:30:45'` (seconds are optional on input and normalized to
`00`).

The header exposes the month and the year as two buttons. `view` switches
between `'days'`, `'months'` and `'years'` without leaving the panel. The same
switcher is available in `date`, `multiple`, `range` and `week` modes; it only
navigates and never changes the selection by itself.

```html
<div class="magma-datepicker__head">
    <button type="button" class="magma-datepicker__nav" @click="previous()"
            x-show="mode !== 'time'" aria-label="Previous">‹</button>

    <span class="magma-datepicker__title" x-show="!hasViewSwitcher"
          x-text="calendarTitle"></span>

    <div class="magma-datepicker__title-group" x-show="hasViewSwitcher">
        <button type="button" class="magma-datepicker__title-button"
                :class="view === 'months' ? 'is-active' : ''"
                @click="showMonths()" x-text="monthTitle"></button>
        <button type="button" class="magma-datepicker__title-button"
                :class="view === 'years' ? 'is-active' : ''"
                @click="showYears()" x-text="viewYear"></button>
    </div>

    <button type="button" class="magma-datepicker__nav" @click="next()"
            x-show="mode !== 'time'" aria-label="Next">›</button>
</div>
```

Show the day, month and year grids with the `view` state:

```html
<div x-show="['date', 'datetime', 'multiple', 'range'].includes(mode) && view === 'days'">
    <!-- day grid -->
</div>
<div x-show="mode === 'month' || (hasViewSwitcher && view === 'months')">
    <!-- month grid -->
</div>
<div x-show="mode === 'year' || (hasViewSwitcher && view === 'years')">
    <!-- year grid -->
</div>
```

For week mode, show the week rows only when `mode === 'week' && view === 'days'`.

Below the day grid, a single bordered widget groups the three time fields as
`HH : MM : SS`. It stays visible while the date is changed. Values are
digit-only, clamped to `0–23` / `0–59` and padded to two digits on blur or
`Enter`:

```html
<div class="magma-datepicker__time-widget" role="group" aria-label="Time"
     x-show="mode === 'datetime' && view === 'days'">
    <input class="magma-datepicker__time-input" type="text" inputmode="numeric"
           pattern="[0-9]*" maxlength="2" autocomplete="off" placeholder="HH"
           :value="timeDraft.hour" :aria-label="hourLabel"
           @input="onTimePartInput('hour', $event.target.value)"
           @blur="normalizeTimePart('hour')"
           @keydown.enter.prevent="normalizeTimePart('hour')"
           @keydown.up.prevent="stepTimePart('hour', 1)"
           @keydown.down.prevent="stepTimePart('hour', -1)"
           @focus="$event.target.select()">
    <span class="magma-datepicker__time-separator" aria-hidden="true">:</span>
    <!-- same input with timeDraft.minute / 'minute' / minuteLabel / MM and the
         same ArrowUp/ArrowDown handlers -->
    <span class="magma-datepicker__time-separator" aria-hidden="true">:</span>
    <!-- same input with timeDraft.second / 'second' / secondLabel / SS -->
</div>
```

The footer adds `Now` and `Done` for datetime:

```html
<div class="magma-datepicker__foot">
    <div class="magma-datepicker__foot-start">
        <button type="button" class="magma-datepicker__action"
                @click="selectToday()" x-text="todayLabel"></button>
        <button type="button" class="magma-datepicker__action"
                x-show="mode === 'datetime'" @click="selectNow()"
                x-text="nowLabel"></button>
    </div>
    <div class="magma-datepicker__foot-end">
        <button type="button" class="magma-datepicker__action magma-datepicker__action--muted"
                @click="clear()" x-text="clearLabel"></button>
        <button type="button" class="magma-datepicker__done"
                x-show="mode === 'datetime'" @click="close()"
                x-text="doneLabel"></button>
    </div>
</div>
```

In `date`, `datetime`, `multiple`, `range` and `week`, `selectMonth()` and
`selectYear()` only navigate: choosing a year opens the months, choosing a month
returns to the days. In datetime mode the value changes when a day or a time
field is edited. `Done`, `Escape` or an outside click closes the panel.

## Inline (no modal)

Set `inline: true` to render the calendar directly in the page. Inline mode has
no trigger, no floating positioning, no overlay and no `role="dialog"`; the
panel is always visible and `close()` is a no-op.

```html
<div class="magma-datepicker magma-datepicker--inline"
     x-data="magmaDateTimePicker({ mode: 'date', value: '2026-10-20', inline: true })"
     role="group" aria-label="Inline date picker">

    <div class="magma-datepicker__panel magma-datepicker__panel--inline"
         tabindex="-1" role="group" :aria-label="panelLabel" @keydown="onKeydown($event)">
        <!-- same head, weekday row, day/month/year grids and footer as above -->
    </div>
</div>
```

The panel uses `position: static`, fills its container and drops the shadow.
Selecting a day only updates `value`; the calendar stays in place. This is the
variant to use when the picker must live in a form or a card instead of a
popover. In datetime mode, omit the trigger, the dialog role and the Done
button: edits commit immediately and there is nothing to close.

## Range: two months and shortcuts

`range` shows two consecutive months and a shortcuts rail. The rail is built
from the `shortcuts` option and sits on the left of the calendars; below 900px
it becomes a horizontal strip above them, and below 640px the two months stack.

The default shortcuts are `Today`, `Yesterday`, `Last 7 days`, `This week`,
`This month`, `Last 3 months` and `This year`. Each entry combines a `label`
with one of:

| Key | Role |
| --- | --- |
| `period` | Named period: `today`, `yesterday`, `last-day`, `this-week`, `last-week`, `this-month`, `last-month`, `this-year`, `last-year`, `last-days`, `last-weeks`, `last-months`, `last-years`. |
| `amount` | Size of a rolling `last-*` period. Defaults: 7 days, 3 weeks/months/years. |
| `range` | Fixed `{ start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }`. |
| `getRange` | Function returning `{ start, end }`, evaluated when the panel renders. |

```js
magmaDateTimePicker({
    mode: 'range',
    shortcuts: [
        { label: 'Aujourd’hui', period: 'today' },
        { label: 'Hier', period: 'yesterday' },
        { label: '7 derniers jours', period: 'last-days', amount: 7 },
        { label: 'Cette semaine', period: 'this-week' },
        { label: 'Ce mois', period: 'this-month' },
        { label: '3 derniers mois', period: 'last-months', amount: 3 },
        { label: 'T1 2026', range: { start: '2026-01-01', end: '2026-03-31' } },
    ],
});
```

Pass `shortcuts: false` to hide the rail. A supplied `shortcuts` array replaces
the default entries rather than extending them. A shortcut is highlighted when
its range equals the current value; applying one clamps the range to `min`/`max`
and commits `magma-datepicker:change`.

```html
<div class="magma-datepicker__range" :class="shortcuts.length ? '' : 'is-single'"
     x-show="mode === 'range' && view === 'days'">
    <div class="magma-datepicker__shortcuts" role="group" :aria-label="shortcutsLabel"
         x-show="shortcuts.length">
        <template x-for="shortcut in shortcuts" :key="shortcut.key">
            <button type="button" class="magma-datepicker__shortcut"
                    :class="shortcut.active ? 'is-active' : ''"
                    @click="applyShortcut(shortcut)" x-text="shortcut.label"></button>
        </template>
    </div>

    <div class="magma-datepicker__months" @mouseleave="hoverDate = null">
        <template x-for="month in calendarMonths" :key="month.key">
            <div class="magma-datepicker__month">
                <button type="button" class="magma-datepicker__month-title"
                        @click="showMonths(month.year)" x-text="month.title"></button>

                <div class="magma-datepicker__weekdays" aria-hidden="true">
                    <template x-for="(name, index) in weekdayNames" :key="index">
                        <span class="magma-datepicker__weekday" x-text="name"></span>
                    </template>
                </div>

                <div class="magma-datepicker__grid" role="grid" :aria-label="month.title">
                    <template x-for="day in month.days" :key="day.iso">
                        <button type="button" class="magma-datepicker__day"
                                :aria-hidden="day.inMonth ? null : 'true'"
                                :tabindex="day.inMonth ? 0 : -1"
                                :class="[day.inMonth ? '' : 'is-other', day.selected ? 'is-selected' : '', day.inRange ? 'is-in-range' : '', day.rangeStart ? 'is-range-start' : '', day.rangeEnd ? 'is-range-end' : '', day.today ? 'is-today' : '', day.active ? 'is-active' : '']"
                                :disabled="day.disabled" :aria-label="day.label"
                                :aria-pressed="day.selected"
                                :aria-current="day.today ? 'date' : null"
                                @click="selectDate(day.iso)"
                                @mouseenter="hoverDate = day.inMonth ? day.iso : null"
                                @focus="activeDate = day.iso" x-text="day.day"></button>
                    </template>
                </div>
            </div>
        </template>
    </div>
</div>
```

Keep this block inside `.magma-datepicker__panel`, replacing the single day
grid. The shared head and footer stay. In range `days` view you can hide the
header title group and rely on the two month-title buttons; keep it visible in
the months/years views so the year selector remains reachable. Outside-month
days are hidden automatically inside `.magma-datepicker__range`.

## Modes

| `mode` | Selection | `value` shape |
| --- | --- | --- |
| `date` | One day | `'YYYY-MM-DD'` |
| `datetime` | Date + time, with month/year switcher | `'YYYY-MM-DDTHH:mm:ss'` |
| `multiple` | Several days | `['YYYY-MM-DD', …]` |
| `range` | Start and end | `{ start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }` |
| `time` | One time slot | `'HH:mm'` |
| `month` | One month | `'YYYY-MM'` |
| `year` | One year | `'YYYY'` — navigation by 12-year page |
| `week` | One ISO week | `'YYYY-Www'` |

In `date`, `datetime`, `multiple`, `range` and `week`, the month/year buttons
only navigate the calendar. In `month` and `year` modes, the grids choose the
value itself.

```js
magmaDateTimePicker({ mode: 'datetime', value: '2026-10-20T14:30:45' })
magmaDateTimePicker({ mode: 'multiple', value: ['2026-10-20', '2026-10-22'] })
magmaDateTimePicker({ mode: 'range', value: { start: '2026-10-20', end: '2026-10-24' } })
magmaDateTimePicker({ mode: 'time', value: '14:30', timeStep: 15 })
magmaDateTimePicker({ mode: 'month', value: '2026-10' })
magmaDateTimePicker({ mode: 'year', value: '2026' })
magmaDateTimePicker({ mode: 'week', value: '2026-W43' })
```

## Options

| Option | Default | Role |
| --- | --- | --- |
| `mode` | `'date'` | One of the eight modes above. |
| `value` | `null` / `[]` / `{ start, end }` / `'YYYY-MM-DDTHH:mm:ss'` | Initial value, shaped according to the mode. |
| `locale` | browser locale | Locale used for month, weekday and value labels. |
| `weekStartsOn` | `1` | `1` = Monday, `0` = Sunday. Week mode always uses ISO Monday weeks. |
| `min` / `max` | `null` | ISO date bounds (`YYYY-MM-DD`). Months and years outside the bounds are disabled. |
| `disabledDates` | `[]` | Array of ISO dates that cannot be selected. |
| `disabled` | `null` | Function `(iso) => boolean` for custom disabling. |
| `timeStep` | `15` | Minutes between time slots. |
| `closeOnSelect` | `true` (multiple: `false`; datetime: ignored) | Closes after selection. A range closes when both ends are set; datetime always stays open until `Done`, `Escape` or an outside click. |
| `placeholder` | mode-specific | Text shown without a value. |
| `multipleLabel` | `'dates selected'` | Suffix for the multiple counter. |
| `todayLabel` / `nowLabel` / `clearLabel` / `doneLabel` | `'Today'` / `'Now'` / `'Clear'` / `'Done'` | Footer actions. |
| `hourLabel` / `minuteLabel` / `secondLabel` | `'Hour'` / `'Minute'` / `'Second'` | Time column labels in datetime mode. |
| `panelWidth` | `344` (`680` in range) | Number (pixels) or any CSS width. |
| `shortcuts` | range presets | Array of `{ label, period, amount, range, getRange }` entries for the range rail. `false` hides it. |
| `shortcutsLabel` | `'Shortcuts'` | Accessible label of the shortcuts rail. |
| `floating` | `true` | Positions the panel in the viewport (`position: fixed`). Ignored when `inline` is true. |
| `inline` | `false` | Renders the calendar in the page: no trigger, overlay or dialog; `open` is forced and `close()` is a no-op. |
| `format` | – | `(value, mode, picker) => string` to rewrite the trigger label. |

## State and methods

| Member | Role |
| --- | --- |
| `value` | Current value; shape depends on `mode`. |
| `displayValue` | Localized label shown in the trigger. |
| `hasValue` / `selectedCount` | Whether a value exists / number of selected days or ends. |
| `open` | Panel state. |
| `show()` / `close()` / `toggle()` | Panel control. Focus enters the panel and returns to the trigger. |
| `selectDate(iso)` | Select a day; behavior follows `mode`. |
| `selectWeek(week)` | Select an ISO week row. |
| `selectMonth(index)` / `selectYear(year)` | Select a month/year in `month`/`year` modes; navigate in day-based modes. |
| `selectTime(value)` | Select a time slot (time mode). |
| `selectHour(value)` / `selectMinute(value)` / `selectSecond(value)` | Set a time part programmatically. |
| `onTimePartInput(part, value)` / `normalizeTimePart(part)` | Clamp/pad a numeric time field. |
| `stepTimePart(part, direction)` | Step a time field by `±1`, wrapping at 24/60. |
| `selectToday()` | Select today in the current mode. |
| `selectNow()` | Set the current date and time in datetime mode. |
| `showMonths()` / `showYears()` | Switch the calendar view inside the same panel. |
| `clear()` | Reset to the empty value for the mode. |
| `previous()` / `next()` | Previous/next month, year or 12-year page. |
| `isSelected(iso)` / `isInRange(iso)` / `isDisabled(iso)` | Cell state helpers. |
| `calendarDays` / `weeks` / `months` / `years` / `timeOptions` | Render collections. |
| `calendarMonths` | Month blocks; two consecutive months in range mode. |
| `shortcuts` | Resolved range shortcuts, each with `range` and `active`. |
| `applyShortcut(shortcut)` | Applies a shortcut range and closes like a completed range. |
| `timeDraft` | Editable hour/minute/second field values. |
| `timeParts` | Current value split into hour/minute/second. |
| `view` | Calendar sub-view for day-based modes: `'days'`, `'months'` or `'years'`. |

## Events

| Event | Detail |
| --- | --- |
| `magma-datepicker:change` | `{ value, mode }` |

For week mode the event also carries `{ start, end }`; for range mode, `value`
is `{ start, end }`. Arrays and range objects are shallow copies, so mutating
the event detail does not mutate the component. Datetime values are local
`YYYY-MM-DDTHH:mm:ss` strings, updated as soon as a day or a time column
changes.

```js
document.addEventListener('magma-datepicker:change', (event) => {
    console.log(event.detail.mode, event.detail.value);
});
```

## Keyboard

- Arrow keys move the active day (or week in `week` mode); in datetime mode
  they work in the days view.
- `Home` / `End` go to the start/end of the current week.
- `PageUp` / `PageDown` move one month; add `Shift` for one year.
- `Enter` selects the active day; `Escape` closes.
- Month, year and time views use regular buttons, so `Tab` and `Enter` work
  natively. The three datetime time controls are numeric fields; `Enter` or
  blur normalizes them.
- In a datetime time field, `ArrowUp` / `ArrowDown` increase or decrease the
  value by one, wrapping at 23→00 for hours and 59→00 for minutes and seconds.
  The arrow keys stay in the field and do not move the calendar selection.

## Classes

| Class | Role |
| --- | --- |
| `magma-datepicker` | Root scope. |
| `magma-datepicker--inline` | In-page variant. |
| `magma-datepicker__trigger` | Field trigger. |
| `magma-datepicker__panel` | Floating panel. |
| `magma-datepicker__panel--inline` | Static, full-width in-page panel. |
| `magma-datepicker__head` / `__title` / `__nav` | Header and navigation. |
| `magma-datepicker__title-group` / `__title-button` | Datetime month/year switcher. |
| `magma-datepicker__weekdays` / `__weekday` | Weekday row. |
| `magma-datepicker__grid` / `__day` | Day grid (also `--months`, `--years`). |
| `magma-datepicker__weeks` / `__week` | ISO week rows. |
| `magma-datepicker__time` / `__time-option` | Time slots. |
| `magma-datepicker__time-widget` / `__time-input` / `__time-separator` | Single bordered `HH:MM:SS` widget. |
| `magma-datepicker__range` / `__months` / `__month` | Range layout: shortcuts rail and two-month area. |
| `magma-datepicker__shortcuts` / `__shortcut` | Range shortcut rail and its buttons (`is-active`). |
| `magma-datepicker__month-title` | Clickable month title that opens the month grid. |
| `magma-datepicker__cell` | Month/year cells. |
| `magma-datepicker__foot` / `__action` / `__done` | Today, Now, clear and Done actions. |

## Accessibility

- The trigger is a button with `aria-haspopup="dialog"` and `aria-expanded`.
- The floating panel is a dialog with a mode-specific `aria-label`; the inline
  panel is a labelled `role="group"`.
- Days expose `aria-pressed`, `aria-current="date"` for today and a full
  localized `aria-label`.
- Disabled dates use the native `disabled` attribute.
- Focus moves into the panel on open and returns to the trigger after a
  selection (including `Done`) or `Escape`. A click outside closes the panel
  without stealing focus from the element that was clicked.
- The datetime hour/minute/second fields share a labelled group, use
  `inputmode="numeric"` and clamp invalid values.
- Range shortcuts are real buttons in a labelled group; the two month grids are
  labelled with their month name.
- `prefers-reduced-motion` reduces the cell and panel transitions.

## Notes

- Values are local calendar dates; they are not timezone conversions. Build
  dates at noon internally to avoid daylight-saving shifts.
- In `date`, `datetime`, `multiple`, `range` and `week`, the month and year
  buttons change the calendar view without changing the value. In datetime mode,
  a day click writes the date while keeping the current time, and editing a time
  field writes the time while keeping the current date. With no date yet, a time
  edit uses today.
- Week mode uses ISO 8601 weeks, Monday-based, with the `YYYY-Www` key.
- The floating panel uses the shared floating-panel behavior: it follows its
  trigger on scroll and resize and flips above the field when there is not
  enough room.
- Use `inline: true` when the calendar must stay in the document flow (form,
  card, dashboard) and no popover or modal should appear.
- Use `format` when the application needs a specific display format while
  keeping the ISO value for the server.
