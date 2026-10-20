/**
 * Date helpers for the date/time picker.
 *
 * Calendar dates are represented as local `YYYY-MM-DD` strings. Dates are
 * built at noon so daylight-saving transitions cannot move them to the
 * previous or next day. ISO weeks are Monday-based, as defined by ISO 8601.
 */

export const DATE_MODES = ['date', 'datetime', 'multiple', 'range', 'time', 'month', 'year', 'week'];

const MONTH_KEY = /^(\d{4})-(\d{2})$/;
const YEAR_KEY = /^(\d{4})$/;
const WEEK_KEY = /^(\d{4})-W(\d{2})$/;
const TIME_KEY = /^(\d{2}):(\d{2})$/;

export function pad2(value) {
    return String(value).padStart(2, '0');
}

export function toISODate(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function parseISODate(value) {
    if (typeof value !== 'string') {
        return null;
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(year, month, day, 12);

    if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
        return null;
    }

    return date;
}

export function todayISO() {
    return toISODate(new Date());
}

export function addDays(date, amount) {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + amount);

    return copy;
}

export function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

export function addMonths(date, amount) {
    const day = date.getDate();
    const copy = new Date(date.getFullYear(), date.getMonth() + amount, 1, 12);

    copy.setDate(Math.min(day, daysInMonth(copy.getFullYear(), copy.getMonth())));

    return copy;
}

export function startOfWeek(date, weekStartsOn = 1) {
    const copy = new Date(date);
    const offset = (copy.getDay() - weekStartsOn + 7) % 7;

    copy.setDate(copy.getDate() - offset);

    return copy;
}

export function endOfWeek(date, weekStartsOn = 1) {
    return addDays(startOfWeek(date, weekStartsOn), 6);
}

/**
 * Resolves a named shortcut period into an inclusive ISO range.
 *
 * Relative periods are computed from `today`; `this-*` periods cover the whole
 * unit (week, month, year), while `last-*` periods are rolling windows ending
 * today.
 *
 * @param {string} period
 * @param {{ today?: string, weekStartsOn?: number, amount?: number }} [options]
 * @returns {{ start: string, end: string } | null}
 */
export function resolveRangePeriod(period, options = {}) {
    const today = parseISODate(options.today ?? todayISO()) ?? new Date();
    const weekStartsOn = options.weekStartsOn ?? 1;
    const amount = Math.max(1, Math.floor(Number(options.amount) || 0));
    const iso = (date) => toISODate(date);
    const monthStart = (date, offset = 0) => new Date(date.getFullYear(), date.getMonth() + offset, 1, 12);
    const monthEnd = (date, offset = 0) => new Date(date.getFullYear(), date.getMonth() + offset + 1, 0, 12);
    const year = today.getFullYear();

    switch (period) {
        case 'today':
            return { start: iso(today), end: iso(today) };
        case 'yesterday':
        case 'last-day': {
            const date = addDays(today, -1);
            return { start: iso(date), end: iso(date) };
        }
        case 'this-week':
            return {
                start: iso(startOfWeek(today, weekStartsOn)),
                end: iso(endOfWeek(today, weekStartsOn)),
            };
        case 'last-week':
            return {
                start: iso(addDays(startOfWeek(today, weekStartsOn), -7)),
                end: iso(addDays(endOfWeek(today, weekStartsOn), -7)),
            };
        case 'this-month':
            return { start: iso(monthStart(today)), end: iso(monthEnd(today)) };
        case 'last-month':
            return { start: iso(monthStart(today, -1)), end: iso(monthEnd(today, -1)) };
        case 'this-year':
            return { start: `${year}-01-01`, end: `${year}-12-31` };
        case 'last-year':
            return { start: `${year - 1}-01-01`, end: `${year - 1}-12-31` };
        case 'last-days': {
            const days = amount || 7;
            return { start: iso(addDays(today, -(days - 1))), end: iso(today) };
        }
        case 'last-weeks': {
            const weeks = amount || 3;
            return { start: iso(addDays(today, -(weeks * 7 - 1))), end: iso(today) };
        }
        case 'last-months': {
            const months = amount || 3;
            return { start: iso(addMonths(today, -months)), end: iso(today) };
        }
        case 'last-years': {
            const years = amount || 3;
            return { start: iso(addMonths(today, -(years * 12))), end: iso(today) };
        }
        default:
            return null;
    }
}

/**
 * 42 calendar cells (six weeks) for a month, including adjacent-month days.
 */
export function buildMonthDays(year, month, weekStartsOn = 1) {
    const first = new Date(year, month, 1, 12);
    const start = startOfWeek(first, weekStartsOn);
    const days = [];

    for (let index = 0; index < 42; index += 1) {
        const date = addDays(start, index);

        days.push({
            date,
            iso: toISODate(date),
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear(),
            inMonth: date.getMonth() === month,
        });
    }

    return days;
}

/**
 * ISO 8601 week information for a local date.
 */
export function isoWeekInfo(date) {
    const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = utc.getUTCDay() || 7;

    utc.setUTCDate(utc.getUTCDate() + 4 - day);

    const year = utc.getUTCFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const week = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
    const start = startOfWeek(date, 1);

    return {
        year,
        week,
        key: `${year}-W${pad2(week)}`,
        start: toISODate(start),
        end: toISODate(addDays(start, 6)),
    };
}

export function isoWeekStart(year, week) {
    const january4 = new Date(year, 0, 4, 12);
    const firstWeek = startOfWeek(january4, 1);

    return addDays(firstWeek, (week - 1) * 7);
}

export function weekKeyInfo(key) {
    const match = WEEK_KEY.exec(key ?? '');

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const week = Number(match[2]);

    if (week < 1 || week > 53) {
        return null;
    }

    const start = isoWeekStart(year, week);

    return {
        year,
        week,
        key: `${year}-W${pad2(week)}`,
        start: toISODate(start),
        end: toISODate(addDays(start, 6)),
    };
}

export function isMonthKey(value) {
    const match = MONTH_KEY.exec(value ?? '');

    if (!match) {
        return false;
    }

    return Number(match[2]) >= 1 && Number(match[2]) <= 12;
}

export function isYearKey(value) {
    return YEAR_KEY.test(value ?? '');
}

export function isWeekKey(value) {
    return weekKeyInfo(value) !== null;
}

export function isTimeKey(value) {
    const match = TIME_KEY.exec(value ?? '');

    if (!match) {
        return false;
    }

    return Number(match[1]) <= 23 && Number(match[2]) <= 59;
}

/**
 * Parse a local datetime (`YYYY-MM-DDTHH:mm` or `YYYY-MM-DDTHH:mm:ss`).
 * A space is accepted instead of `T`; seconds default to `00`.
 */
export function parseDateTime(value) {
    if (typeof value !== 'string') {
        return null;
    }

    const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);

    if (!match || !parseISODate(match[1])) {
        return null;
    }

    const hour = Number(match[2]);
    const minute = Number(match[3]);
    const second = Number(match[4] ?? 0);

    if (hour > 23 || minute > 59 || second > 59) {
        return null;
    }

    const time = `${pad2(hour)}:${pad2(minute)}:${pad2(second)}`;

    return {
        date: match[1],
        time,
        iso: `${match[1]}T${time}`,
    };
}

export function isDateTimeKey(value) {
    return parseDateTime(value) !== null;
}

export function currentDateTime() {
    const now = new Date();

    return `${toISODate(now)}T${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
}

export function splitTime(value = '00:00:00') {
    const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value ?? '');

    if (!match) {
        return { hour: '00', minute: '00', second: '00' };
    }

    return {
        hour: match[1],
        minute: match[2],
        second: match[3] ?? '00',
    };
}

export function compareISODate(left, right) {
    return left === right ? 0 : left < right ? -1 : 1;
}

export function formatDate(iso, locale, options = {}) {
    const date = parseISODate(iso);

    if (!date) {
        return '';
    }

    return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...options,
    }).format(date);
}

export function formatFullDate(iso, locale) {
    return formatDate(iso, locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function formatMonth(year, month, locale) {
    return new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
    }).format(new Date(year, month, 1, 12));
}

export function formatMonthKey(key, locale) {
    const match = MONTH_KEY.exec(key ?? '');

    if (!match) {
        return '';
    }

    return formatMonth(Number(match[1]), Number(match[2]) - 1, locale);
}

export function weekdayLabels(locale, weekStartsOn = 1) {
    const monday = new Date(2024, 0, 1, 12);
    const start = startOfWeek(monday, weekStartsOn);
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });

    return Array.from({ length: 7 }, (_, index) => formatter.format(addDays(start, index)));
}

export function weekLabel(start, end, locale) {
    return `${formatDate(start, locale)} – ${formatDate(end, locale)}`;
}

/**
 * Complete time slots for a day, from 00:00 to 23:xx.
 */
export function timeSlots(step = 15) {
    const safeStep = Math.max(1, Math.min(720, Number(step) || 15));
    const slots = [];

    for (let minutes = 0; minutes < 24 * 60; minutes += safeStep) {
        slots.push(`${pad2(Math.floor(minutes / 60))}:${pad2(minutes % 60)}`);
    }

    return slots;
}

export function currentTimeKey(step = 15) {
    const now = new Date();
    const safeStep = Math.max(1, Number(step) || 15);
    const minutes = Math.floor((now.getHours() * 60 + now.getMinutes()) / safeStep) * safeStep;
    const capped = Math.min(minutes, 24 * 60 - 1);

    return `${pad2(Math.floor(capped / 60))}:${pad2(capped % 60)}`;
}
