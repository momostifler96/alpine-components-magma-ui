import { emit } from '../emit.js';
import { floatingMenu, menuPositionStyle, menuWidthStyle } from '../menu.js';
import {
    DATE_MODES,
    addMonths,
    buildMonthDays,
    currentDateTime,
    currentTimeKey,
    endOfWeek,
    formatDate,
    formatFullDate,
    formatMonth,
    formatMonthKey,
    isoWeekInfo,
    isDateTimeKey,
    isMonthKey,
    isTimeKey,
    isWeekKey,
    isYearKey,
    pad2,
    parseDateTime,
    parseISODate,
    splitTime,
    startOfWeek,
    timeSlots,
    toISODate,
    todayISO,
    weekKeyInfo,
    weekLabel,
} from '../date.js';

const PLACEHOLDERS = {
    date: 'Pick a date',
    datetime: 'Pick a date and time',
    multiple: 'Pick dates',
    range: 'Pick a date range',
    time: 'Pick a time',
    month: 'Pick a month',
    year: 'Pick a year',
    week: 'Pick a week',
};

const PANEL_LABELS = {
    date: 'Choose a date',
    datetime: 'Choose a date and time',
    multiple: 'Choose dates',
    range: 'Choose a date range',
    time: 'Choose a time',
    month: 'Choose a month',
    year: 'Choose a year',
    week: 'Choose a week',
};

function normalizeValue(value, mode) {
    if (mode === 'multiple') {
        return Array.isArray(value)
            ? [...new Set(value.filter((entry) => parseISODate(entry)))].sort()
            : [];
    }

    if (mode === 'range') {
        if (Array.isArray(value)) {
            value = { start: value[0] ?? null, end: value[1] ?? null };
        }

        const start = parseISODate(value?.start) ? value.start : null;
        const end = parseISODate(value?.end) ? value.end : null;

        return start && end && end < start ? { start: end, end: start } : { start, end };
    }

    if (mode === 'datetime') {
        if (value && typeof value === 'object') {
            value = `${value.date ?? ''}T${value.time ?? '00:00:00'}`;
        }

        return isDateTimeKey(value) ? parseDateTime(value).iso : null;
    }

    if (mode === 'month') {
        return isMonthKey(value) ? value : null;
    }

    if (mode === 'year') {
        return isYearKey(value) ? String(value) : null;
    }

    if (mode === 'week') {
        return isWeekKey(value) ? value : null;
    }

    if (mode === 'time') {
        return isTimeKey(value) ? value : null;
    }

    return parseISODate(value) ? value : null;
}

function emptyValue(mode) {
    if (mode === 'multiple') {
        return [];
    }

    if (mode === 'range') {
        return { start: null, end: null };
    }

    return null;
}

function initialBase(value, mode, today) {
    if (mode === 'datetime') {
        return parseDateTime(value)?.date ?? today;
    }

    if (mode === 'month') {
        return isMonthKey(value) ? `${value}-01` : today;
    }

    if (mode === 'year') {
        return isYearKey(value) ? `${value}-01-01` : today;
    }

    if (mode === 'week') {
        return weekKeyInfo(value)?.start ?? today;
    }

    if (mode === 'multiple') {
        return value[0] ?? today;
    }

    if (mode === 'range') {
        return value.start ?? value.end ?? today;
    }

    if (mode === 'time') {
        return today;
    }

    return value ?? today;
}

/**
 * Date and time picker.
 *
 * One factory, eight modes: `date`, `datetime`, `multiple`, `range`, `time`,
 * `month`, `year` and `week`. Values are local calendar strings
 * (`YYYY-MM-DD`), except:
 *
 *   - datetime: `'YYYY-MM-DDTHH:mm:ss'`
 *   - multiple: `['YYYY-MM-DD', …]`
 *   - range: `{ start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }`
 *   - time: `'HH:mm'`
 *   - month: `'YYYY-MM'`
 *   - year: `'YYYY'`
 *   - week: `'YYYY-Www'` (ISO 8601 week)
 *
 * Events:
 *   - `magma-datepicker:change` { value, mode, … }
 */
export function createDateTimePicker(config = {}) {
    const mode = DATE_MODES.includes(config.mode) ? config.mode : 'date';
    const locale = config.locale ?? undefined;
    const weekStartsOn = mode === 'week' ? 1 : (config.weekStartsOn ?? 1);
    const timeStep = Math.max(1, Math.min(720, Number(config.timeStep) || 15));
    const today = todayISO();
    const value = normalizeValue(config.value, mode);
    const base = initialBase(value, mode, today);
    const baseDate = parseISODate(base) ?? new Date();
    const initialTime = splitTime(parseDateTime(value)?.time ?? '00:00:00');

    return {
        mode,
        value,
        open: false,
        viewYear: baseDate.getFullYear(),
        viewMonth: baseDate.getMonth(),
        view: 'days',
        activeDate: toISODate(baseDate),
        hoverDate: null,
        previousFocus: null,
        timeDraft: { ...initialTime },
        today,
        locale,
        weekStartsOn,
        min: config.min ?? null,
        max: config.max ?? null,
        disabledDates: Array.isArray(config.disabledDates) ? config.disabledDates : [],
        disabled: typeof config.disabled === 'function' ? config.disabled : null,
        timeStep,
        closeOnSelect: config.closeOnSelect ?? !['multiple', 'datetime'].includes(mode),
        placeholder: config.placeholder ?? PLACEHOLDERS[mode],
        multipleLabel: config.multipleLabel ?? 'dates selected',
        todayLabel: config.todayLabel ?? 'Today',
        nowLabel: config.nowLabel ?? 'Now',
        doneLabel: config.doneLabel ?? 'Done',
        clearLabel: config.clearLabel ?? 'Clear',
        hourLabel: config.hourLabel ?? 'Hour',
        minuteLabel: config.minuteLabel ?? 'Minute',
        secondLabel: config.secondLabel ?? 'Second',
        panelWidth: config.panelWidth ?? 344,

        ...floatingMenu.options(config),

        get menuStyle() {
            return `${menuWidthStyle(this.panelWidth)} ${menuPositionStyle(this.anchor, this.panelWidth)}`.trim();
        },

        get panelLabel() {
            return PANEL_LABELS[this.mode];
        },

        get hasViewSwitcher() {
            return ['date', 'datetime', 'multiple', 'range', 'week'].includes(this.mode);
        },

        init() {
            this.startTracking();
        },

        destroy() {
            this.stopTracking();
        },

        show() {
            if (this.open) {
                return;
            }

            this.previousFocus = document.activeElement;
            this.open = true;
            this.syncView();
            this.syncTimeDraft();
            this.$nextTick(() => {
                this.placeMenuSoon();
                this.focusPanel();
                this.scrollSelectionIntoView();
            });
        },

        focusPanel() {
            window.requestAnimationFrame(() => {
                if (this.open) {
                    this.$refs.panel?.focus({ preventScroll: true });
                }
            });
        },

        close(options = {}) {
            if (!this.open) {
                return;
            }

            const restoreFocus = options?.restoreFocus !== false;

            this.open = false;
            this.hoverDate = null;

            if (!restoreFocus) {
                this.previousFocus = null;
                return;
            }

            this.$nextTick(() => {
                this.previousFocus?.focus?.({ preventScroll: true });
                this.previousFocus = null;
            });
        },

        toggle() {
            this.open ? this.close() : this.show();
        },

        clear() {
            this.value = emptyValue(this.mode);
            this.hoverDate = null;
            this.syncTimeDraft();
            this.commit();
        },

        selectToday() {
            if (this.hasViewSwitcher) {
                this.view = 'days';
            }

            if (this.mode === 'month') {
                const key = this.today.slice(0, 7);

                if (this.isMonthDisabled(key)) {
                    return;
                }

                this.value = key;
                this.commit();
                this.maybeClose();
                return;
            }

            if (this.mode === 'year') {
                const year = Number(this.today.slice(0, 4));

                if (this.isYearDisabled(year)) {
                    return;
                }

                this.value = String(year);
                this.commit();
                this.maybeClose();
                return;
            }

            if (this.mode === 'time') {
                this.value = currentTimeKey(this.timeStep);
                this.commit();
                this.maybeClose();
                return;
            }

            if (this.mode === 'datetime') {
                if (this.isDisabled(this.today)) {
                    return;
                }

                const time = parseDateTime(this.value)?.time ?? '00:00:00';

                this.value = `${this.today}T${time}`;
                this.commit();
                return;
            }

            if (this.mode === 'multiple' && this.isSelected(this.today)) {
                return;
            }

            this.selectDate(this.today);
        },

        selectNow() {
            if (this.mode !== 'datetime') {
                return;
            }

            const value = currentDateTime();

            if (this.isDisabled(value.slice(0, 10))) {
                return;
            }

            this.value = value;
            this.view = 'days';
            this.syncTimeDraft();
            this.commit();
        },

        previous() {
            this.shiftView(-1);
        },

        next() {
            this.shiftView(1);
        },

        shiftView(direction) {
            if (this.hasViewSwitcher) {
                if (this.view === 'years') {
                    this.viewYear += direction * 12;
                    return;
                }

                if (this.view === 'months') {
                    this.viewYear += direction;
                    return;
                }
            }

            if (this.mode === 'month') {
                this.viewYear += direction;
                return;
            }

            if (this.mode === 'year') {
                this.viewYear += direction * 12;
                return;
            }

            if (this.mode === 'time') {
                return;
            }

            const date = addMonths(new Date(this.viewYear, this.viewMonth, 1, 12), direction);

            this.viewYear = date.getFullYear();
            this.viewMonth = date.getMonth();
        },

        syncView() {
            const base = initialBase(this.value, this.mode, this.today);
            const date = parseISODate(base) ?? new Date();

            this.viewYear = date.getFullYear();
            this.viewMonth = date.getMonth();
            this.view = 'days';
            this.activeDate = toISODate(date);
        },

        selectDate(iso) {
            if (!parseISODate(iso) || this.isDisabled(iso)) {
                return;
            }

            this.setActive(iso);

            if (this.mode === 'date') {
                this.value = iso;
                this.commit();
                this.maybeClose();
                return;
            }

            if (this.mode === 'datetime') {
                const time = parseDateTime(this.value)?.time ?? '00:00:00';

                this.value = `${iso}T${time}`;
                this.commit();
                this.maybeClose();
                return;
            }

            if (this.mode === 'multiple') {
                this.value = this.value.includes(iso)
                    ? this.value.filter((entry) => entry !== iso)
                    : [...this.value, iso].sort();

                this.commit();
                this.maybeClose();
                return;
            }

            if (this.mode === 'range') {
                const { start, end } = this.value;

                if (!start || (start && end)) {
                    this.value = { start: iso, end: null };
                } else if (iso < start) {
                    this.value = { start: iso, end: start };
                } else {
                    this.value = { start, end: iso };
                }

                this.commit();
                this.maybeClose();
                return;
            }

            if (this.mode === 'week') {
                const info = isoWeekInfo(parseISODate(iso));

                this.selectWeek({
                    key: info.key,
                    start: info.start,
                    end: info.end,
                    disabled: this.isWeekDisabled(info.start),
                });
            }
        },

        selectWeek(week) {
            if (!week || week.disabled) {
                return;
            }

            this.value = week.key;
            this.commit({ start: week.start, end: week.end });
            this.maybeClose();
        },

        selectMonth(index) {
            const key = `${this.viewYear}-${pad2(index + 1)}`;

            if (this.isMonthDisabled(key)) {
                return;
            }

            if (this.hasViewSwitcher) {
                this.viewMonth = index;
                this.view = 'days';
                this.refreshLayout();
                return;
            }

            this.value = key;
            this.commit();
            this.maybeClose();
        },

        selectYear(year) {
            if (this.isYearDisabled(year)) {
                return;
            }

            if (this.hasViewSwitcher) {
                this.viewYear = year;
                this.view = 'months';
                this.refreshLayout();
                return;
            }

            this.value = String(year);
            this.commit();
            this.maybeClose();
        },

        selectTime(value) {
            if (!isTimeKey(value)) {
                return;
            }

            this.value = value;
            this.commit();
            this.maybeClose();
        },

        selectHour(value) {
            this.setTimePart('hour', value);
        },

        selectMinute(value) {
            this.setTimePart('minute', value);
        },

        selectSecond(value) {
            this.setTimePart('second', value);
        },

        setTimePart(part, value, options = {}) {
            const max = part === 'hour' ? 23 : 59;
            const clean = pad2(Math.min(max, Math.max(0, Number(value) || 0)));
            const parsed = parseDateTime(this.value);
            const date = parsed?.date ?? this.today;
            const parts = splitTime(parsed?.time);

            parts[part] = clean;
            this.value = `${date}T${parts.hour}:${parts.minute}:${parts.second}`;

            if (options.syncDraft !== false) {
                this.syncTimeDraft();
            }

            this.commit();
            this.maybeClose();
        },

        syncTimeDraft() {
            const parts = splitTime(parseDateTime(this.value)?.time ?? '00:00:00');

            this.timeDraft = { ...parts };
        },

        onTimePartInput(part, value) {
            const max = part === 'hour' ? 23 : 59;
            const raw = String(value ?? '').replace(/\D/g, '').slice(0, 2);

            if (raw === '') {
                this.timeDraft = { ...this.timeDraft, [part]: '' };
                return;
            }

            const number = Number(raw);
            const clamped = Math.min(max, number);

            this.timeDraft = {
                ...this.timeDraft,
                [part]: clamped === number ? raw : String(clamped),
            };
            this.setTimePart(part, clamped, { syncDraft: false });
        },

        normalizeTimePart(part) {
            const max = part === 'hour' ? 23 : 59;
            const raw = this.timeDraft[part];
            const number = raw === '' || raw === null || raw === undefined
                ? 0
                : Math.min(max, Math.max(0, Number(raw) || 0));

            this.timeDraft = { ...this.timeDraft, [part]: pad2(number) };
            this.setTimePart(part, number, { syncDraft: false });
        },

        showMonths() {
            if (this.hasViewSwitcher) {
                this.view = 'months';
                this.refreshLayout();
            }
        },

        showYears() {
            if (this.hasViewSwitcher) {
                this.view = 'years';
                this.refreshLayout();
            }
        },

        refreshLayout() {
            this.$nextTick(() => this.placeMenuSoon());
        },

        isSelected(iso) {
            if (this.mode === 'date') {
                return this.value === iso;
            }

            if (this.mode === 'datetime') {
                return parseDateTime(this.value)?.date === iso;
            }

            if (this.mode === 'multiple') {
                return this.value.includes(iso);
            }

            if (this.mode === 'range') {
                return this.value.start === iso || this.value.end === iso;
            }

            return false;
        },

        isInRange(iso) {
            if (this.mode !== 'range') {
                return false;
            }

            let { start, end } = this.value;

            if (start && !end && this.hoverDate) {
                if (this.hoverDate < start) {
                    end = start;
                    start = this.hoverDate;
                } else {
                    end = this.hoverDate;
                }
            }

            return Boolean(start && end && iso >= start && iso <= end);
        },

        isRangeStart(iso) {
            return this.mode === 'range' && this.value.start === iso;
        },

        isRangeEnd(iso) {
            return this.mode === 'range' && this.value.end === iso;
        },

        isToday(iso) {
            return iso === this.today;
        },

        isActive(iso) {
            return iso === this.activeDate;
        },

        isDisabled(iso) {
            if (this.min && iso < this.min) {
                return true;
            }

            if (this.max && iso > this.max) {
                return true;
            }

            if (this.disabledDates.includes(iso)) {
                return true;
            }

            return typeof this.disabled === 'function' ? Boolean(this.disabled(iso)) : false;
        },

        isMonthDisabled(key) {
            return (this.min && key < this.min.slice(0, 7))
                || (this.max && key > this.max.slice(0, 7));
        },

        isYearDisabled(year) {
            return (this.min && year < Number(this.min.slice(0, 4)))
                || (this.max && year > Number(this.max.slice(0, 4)));
        },

        isWeekSelected(key) {
            return this.mode === 'week' && this.value === key;
        },

        isWeekDisabled(start) {
            const date = parseISODate(start);

            if (!date) {
                return true;
            }

            for (let index = 0; index < 7; index += 1) {
                if (this.isDisabled(toISODate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + index, 12)))) {
                    return true;
                }
            }

            return false;
        },

        setActive(iso) {
            const date = parseISODate(iso);

            if (!date) {
                return;
            }

            this.activeDate = iso;

            if (date.getFullYear() !== this.viewYear || date.getMonth() !== this.viewMonth) {
                this.viewYear = date.getFullYear();
                this.viewMonth = date.getMonth();
            }
        },

        commit(extra = {}) {
            const snapshot = this.mode === 'multiple'
                ? [...this.value]
                : this.mode === 'range'
                    ? { ...this.value }
                    : this.value;

            emit(this, 'magma-datepicker:change', {
                value: snapshot,
                mode: this.mode,
                ...extra,
            });
        },

        maybeClose() {
            if (this.mode === 'datetime' || !this.closeOnSelect) {
                return;
            }

            if (this.mode === 'range' && !(this.value.start && this.value.end)) {
                return;
            }

            this.close();
        },

        scrollSelectionIntoView() {
            this.$nextTick(() => {
                this.$refs.panel
                    ?.querySelector('.is-selected')
                    ?.scrollIntoView({ block: 'nearest' });
            });
        },

        onKeydown(event) {
            if (!this.open) {
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                this.close();
                return;
            }

            if (this.hasViewSwitcher && this.view !== 'days') {
                return;
            }

            if (!['date', 'datetime', 'multiple', 'range', 'week'].includes(this.mode)) {
                return;
            }

            const current = parseISODate(this.activeDate) ?? new Date();
            let next = current;

            switch (event.key) {
                case 'ArrowLeft':
                    next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1, 12);
                    break;
                case 'ArrowRight':
                    next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1, 12);
                    break;
                case 'ArrowUp':
                    next = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 7, 12);
                    break;
                case 'ArrowDown':
                    next = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 7, 12);
                    break;
                case 'Home':
                    next = startOfWeek(current, this.weekStartsOn);
                    break;
                case 'End':
                    next = endOfWeek(current, this.weekStartsOn);
                    break;
                case 'PageUp':
                    next = addMonths(current, event.shiftKey ? -12 : -1);
                    break;
                case 'PageDown':
                    next = addMonths(current, event.shiftKey ? 12 : 1);
                    break;
                case 'Enter':
                    event.preventDefault();
                    this.selectDate(this.activeDate);
                    return;
                default:
                    return;
            }

            event.preventDefault();
            this.setActive(toISODate(next));
        },

        get calendarDays() {
            return buildMonthDays(this.viewYear, this.viewMonth, this.weekStartsOn).map((day) => ({
                ...day,
                label: formatFullDate(day.iso, this.locale),
                selected: this.isSelected(day.iso),
                inRange: this.isInRange(day.iso),
                rangeStart: this.isRangeStart(day.iso),
                rangeEnd: this.isRangeEnd(day.iso),
                today: this.isToday(day.iso),
                active: this.isActive(day.iso),
                disabled: this.isDisabled(day.iso),
            }));
        },

        get weeks() {
            const days = buildMonthDays(this.viewYear, this.viewMonth, 1);
            const rows = [];

            for (let index = 0; index < days.length; index += 7) {
                const weekDays = days.slice(index, index + 7);
                const info = isoWeekInfo(weekDays[0].date);
                const disabled = weekDays.some((day) => this.isDisabled(day.iso));

                rows.push({
                    key: info.key,
                    week: info.week,
                    year: info.year,
                    start: info.start,
                    end: info.end,
                    disabled,
                    selected: this.isWeekSelected(info.key),
                    label: `Week ${info.week}, ${weekLabel(info.start, info.end, this.locale)}`,
                    days: weekDays.map((day) => ({
                        ...day,
                        today: this.isToday(day.iso),
                        disabled: this.isDisabled(day.iso),
                    })),
                });
            }

            return rows;
        },

        get weekdayNames() {
            const monday = new Date(2024, 0, 1, 12);
            const start = startOfWeek(monday, this.weekStartsOn);
            const formatter = new Intl.DateTimeFormat(this.locale, { weekday: 'short' });

            return Array.from({ length: 7 }, (_, index) => formatter.format(
                new Date(start.getFullYear(), start.getMonth(), start.getDate() + index, 12)
            ));
        },

        get calendarTitle() {
            if (this.mode === 'datetime') {
                return this.view === 'years'
                    ? `${this.decadeStart} – ${this.decadeStart + 11}`
                    : `${this.monthTitle} ${this.viewYear}`;
            }

            if (this.mode === 'month') {
                return String(this.viewYear);
            }

            if (this.mode === 'year') {
                return `${this.decadeStart} – ${this.decadeStart + 11}`;
            }

            if (this.mode === 'time') {
                return 'Time';
            }

            return formatMonth(this.viewYear, this.viewMonth, this.locale);
        },

        get monthTitle() {
            return new Intl.DateTimeFormat(this.locale, { month: 'long' })
                .format(new Date(this.viewYear, this.viewMonth, 1, 12));
        },

        get decadeStart() {
            return Math.floor(this.viewYear / 12) * 12;
        },

        get selectedMonthKey() {
            if (this.mode === 'multiple') {
                return this.value[0]?.slice(0, 7) ?? null;
            }

            if (this.mode === 'range') {
                return (this.value.start ?? this.value.end)?.slice(0, 7) ?? null;
            }

            if (this.mode === 'week') {
                return weekKeyInfo(this.value)?.start.slice(0, 7) ?? null;
            }

            if (this.mode === 'datetime') {
                return parseDateTime(this.value)?.date?.slice(0, 7) ?? null;
            }

            if (this.mode === 'date') {
                return this.value?.slice(0, 7) ?? null;
            }

            if (this.mode === 'month') {
                return this.value;
            }

            return null;
        },

        get selectedYearKey() {
            if (this.mode === 'multiple') {
                return this.value[0]?.slice(0, 4) ?? null;
            }

            if (this.mode === 'range') {
                return (this.value.start ?? this.value.end)?.slice(0, 4) ?? null;
            }

            if (this.mode === 'week') {
                return weekKeyInfo(this.value)?.start.slice(0, 4) ?? null;
            }

            if (this.mode === 'datetime') {
                return parseDateTime(this.value)?.date?.slice(0, 4) ?? null;
            }

            if (this.mode === 'date') {
                return this.value?.slice(0, 4) ?? null;
            }

            if (this.mode === 'year') {
                return this.value;
            }

            return null;
        },

        get months() {
            const formatter = new Intl.DateTimeFormat(this.locale, { month: 'short' });

            return Array.from({ length: 12 }, (_, index) => {
                const key = `${this.viewYear}-${pad2(index + 1)}`;

                return {
                    index,
                    key,
                    label: formatter.format(new Date(2024, index, 1, 12)),
                    selected: this.selectedMonthKey === key,
                    disabled: this.isMonthDisabled(key),
                };
            });
        },

        get years() {
            const start = this.decadeStart;

            return Array.from({ length: 12 }, (_, index) => {
                const year = start + index;

                return {
                    year,
                    selected: this.selectedYearKey === String(year),
                    disabled: this.isYearDisabled(year),
                };
            });
        },

        get timeOptions() {
            return timeSlots(this.timeStep).map((value) => ({
                value,
                selected: this.value === value,
            }));
        },

        get timeParts() {
            return splitTime(parseDateTime(this.value)?.time ?? '00:00:00');
        },

        get displayValue() {
            if (typeof config.format === 'function') {
                return config.format(this.value, this.mode, this);
            }

            if (this.mode === 'datetime') {
                const parsed = parseDateTime(this.value);

                return parsed
                    ? `${formatDate(parsed.date, this.locale)}, ${parsed.time}`
                    : this.placeholder;
            }

            if (this.mode === 'multiple') {
                if (this.value.length === 0) {
                    return this.placeholder;
                }

                if (this.value.length === 1) {
                    return formatDate(this.value[0], this.locale);
                }

                return `${this.value.length} ${this.multipleLabel}`;
            }

            if (this.mode === 'range') {
                if (!this.value.start) {
                    return this.placeholder;
                }

                if (!this.value.end) {
                    return `${formatDate(this.value.start, this.locale)} – …`;
                }

                return `${formatDate(this.value.start, this.locale)} – ${formatDate(this.value.end, this.locale)}`;
            }

            if (this.mode === 'week') {
                const info = weekKeyInfo(this.value);

                return info
                    ? `${this.value.replace('-W', ' W')} · ${formatDate(info.start, this.locale)} – ${formatDate(info.end, this.locale)}`
                    : this.placeholder;
            }

            if (this.mode === 'month') {
                return this.value ? formatMonthKey(this.value, this.locale) : this.placeholder;
            }

            if (this.mode === 'year' || this.mode === 'time') {
                return this.value ?? this.placeholder;
            }

            return this.value ? formatDate(this.value, this.locale) : this.placeholder;
        },

        get hasValue() {
            if (this.mode === 'multiple') {
                return this.value.length > 0;
            }

            if (this.mode === 'range') {
                return Boolean(this.value.start || this.value.end);
            }

            return this.value !== null && this.value !== undefined && this.value !== '';
        },

        get selectedCount() {
            if (this.mode === 'multiple') {
                return this.value.length;
            }

            if (this.mode === 'range') {
                return (this.value.start ? 1 : 0) + (this.value.end ? 1 : 0);
            }

            return this.hasValue ? 1 : 0;
        },
    };
}
