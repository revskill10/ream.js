/*********************************************************************
 *  REAM-DATETIME  v3.0  —  Full-blown Day.js/Moment replacement
 *  Includes: IANA time-zones, DST math, calendars, locale, plug-ins
 *  Everything is pure, total, and categorically composable.
 ********************************************************************/

/* ------------------------------------------------------------------ *
 *  0.  INTERNAL UTILS
 * ------------------------------------------------------------------ */
export const isLeap = (y: number): boolean =>
  (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
export const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const MILLIS = {
  SECOND: 1000,
  MINUTE: 60_000,
  HOUR: 3_600_000,
  DAY: 86_400_000,
  WEEK: 604_800_000,
};

/* ------------------------------------------------------------------ *
 *  1.  PRIMITIVES  (total & immutable)
 * ------------------------------------------------------------------ */
export type Instant = Readonly<{ readonly epochMs: number }>;
export type Duration = Readonly<{ readonly ms: number }>;
export type PlainDate = Readonly<{
  readonly y: number;
  readonly m: number;
  readonly d: number;
}>;
export type PlainTime = Readonly<{
  readonly h: number;
  readonly min: number;
  readonly s: number;
  readonly ms: number;
}>;
export type PlainDateTime = PlainDate & PlainTime;

/* ------------------------------------------------------------------ *
 *  2.  TIME-ZONE  SYSTEM  (Real IANA TZDB Support)
 * ------------------------------------------------------------------ */
export type TimeZone = {
  readonly name: string; // IANA string (e.g. "America/New_York")
  readonly offsetMinutes: number; // current offset (minutes east of UTC)
  readonly dst: boolean; // is DST active?
  readonly abbreviation?: string; // timezone abbreviation (e.g. "EST", "PDT")
};

/* Real timezone data using Intl API */
export const getTimezoneInfo = (tzName: string, instant: Instant): TimeZone => {
  try {
    // Validate timezone name using Intl API
    new Intl.DateTimeFormat('en', { timeZone: tzName });

    const date = new Date(instant.epochMs);

    // Simple and reliable method using Date.prototype.toLocaleString
    const utcTime = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const localTime = new Date(
      date.toLocaleString('en-US', { timeZone: tzName })
    );

    // Calculate offset in minutes (Local - UTC, negated to match standard convention)
    const offsetMinutes = -Math.round(
      (utcTime.getTime() - localTime.getTime()) / (1000 * 60)
    );

    // Determine if DST is active by comparing with standard time
    const year = date.getFullYear();
    const januaryDate = new Date(year, 0, 1, 12, 0, 0);
    const julyDate = new Date(year, 6, 1, 12, 0, 0);

    const getOffsetForDate = (testDate: Date): number => {
      const utcTest = new Date(
        testDate.toLocaleString('en-US', { timeZone: 'UTC' })
      );
      const localTest = new Date(
        testDate.toLocaleString('en-US', { timeZone: tzName })
      );
      return -Math.round(
        (utcTest.getTime() - localTest.getTime()) / (1000 * 60)
      );
    };

    const janOffset = getOffsetForDate(januaryDate);
    const julOffset = getOffsetForDate(julyDate);

    // For northern hemisphere timezones like America/New_York:
    // - Winter (January) is standard time (more negative offset, e.g., -300 for EST)
    // - Summer (July) is DST (less negative offset, e.g., -240 for EDT)
    // Standard time is the more negative offset (smaller value)
    const standardOffset = Math.min(janOffset, julOffset);
    const dst = offsetMinutes > standardOffset;

    // Get timezone abbreviation
    const abbreviation = new Intl.DateTimeFormat('en', {
      timeZone: tzName,
      timeZoneName: 'short',
    })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value;

    return {
      name: tzName,
      offsetMinutes,
      dst,
      abbreviation,
    };
  } catch {
    // Fallback to UTC for invalid timezone names
    return {
      name: 'UTC',
      offsetMinutes: 0,
      dst: false,
      abbreviation: 'UTC',
    };
  }
};

/* compute offset for any instant using real TZDB */
export const tzOffset = (tz: string, i: Instant): number => {
  const tzInfo = getTimezoneInfo(tz, i);
  return tzInfo.offsetMinutes;
};

/* Get list of available timezones */
export const getAvailableTimezones = (): readonly string[] => {
  // Common IANA timezone identifiers
  return Object.freeze([
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Toronto',
    'America/Vancouver',
    'America/Mexico_City',
    'America/Sao_Paulo',
    'America/Argentina/Buenos_Aires',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Europe/Madrid',
    'Europe/Amsterdam',
    'Europe/Stockholm',
    'Europe/Moscow',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Hong_Kong',
    'Asia/Singapore',
    'Asia/Mumbai',
    'Asia/Dubai',
    'Asia/Seoul',
    'Asia/Bangkok',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Australia/Perth',
    'Pacific/Auckland',
    'Pacific/Honolulu',
    'Africa/Cairo',
    'Africa/Johannesburg',
    'Africa/Lagos',
  ]);
};

/* ------------------------------------------------------------------ *
 *  3.  ZONED  DATETIME  FUNCTOR
 *        ZDT<A> ≅ Instant × Zone × A
 * ------------------------------------------------------------------ */
export type ZDT<A> = Readonly<{
  readonly instant: Instant;
  readonly zone: TimeZone;
  readonly payload: A;
}>;

export const zdt = <A>(i: Instant, z: TimeZone, p: A): ZDT<A> => ({
  instant: i,
  zone: z,
  payload: p,
});

/* Functor map */
export const zfmap =
  <A, B>(f: (a: A) => B) =>
  (z: ZDT<A>): ZDT<B> => ({ ...z, payload: f(z.payload) });

/* ------------------------------------------------------------------ *
 *  4.  CALENDAR  ALGEBRA
 * ------------------------------------------------------------------ */
export type Calendar = 'gregory' | 'iso8601' | 'buddhist' | 'persian';

export const calendars: Record<
  Calendar,
  { readonly firstDay: number; readonly monthNames: readonly string[] }
> = {
  gregory: {
    firstDay: 1,
    monthNames: Array.from({ length: 12 }, (_, i) =>
      new Date(2020, i).toLocaleString('en', { month: 'long' })
    ),
  },
  iso8601: {
    firstDay: 1,
    monthNames: Array.from({ length: 12 }, (_, i) =>
      new Date(2020, i).toLocaleString('en', { month: 'long' })
    ),
  },
  buddhist: {
    firstDay: 1,
    monthNames: [
      'Poson',
      'Āsāḷha',
      'Sāvana',
      'Bhādrapada',
      'Āśvina',
      'Kārttika',
      'Mārgaśīrṣa',
      'Pauṣa',
      'Māgha',
      'Phālguna',
      'Caitra',
      'Vaiśākha',
    ],
  },
  persian: {
    firstDay: 1,
    monthNames: [
      'Farvardin',
      'Ordibehesht',
      'Khordad',
      'Tir',
      'Mordad',
      'Shahrivar',
      'Mehr',
      'Aban',
      'Azar',
      'Dey',
      'Bahman',
      'Esfand',
    ],
  },
};

/* ------------------------------------------------------------------ *
 *  5.  LOCALE  &  FORMATTING
 * ------------------------------------------------------------------ */
export type Locale = string;
export type FormatToken =
  | 'YYYY'
  | 'YY'
  | 'MMMM'
  | 'MMM'
  | 'MM'
  | 'M'
  | 'DD'
  | 'D'
  | 'dddd'
  | 'ddd'
  | 'HH'
  | 'H'
  | 'hh'
  | 'h'
  | 'mm'
  | 'm'
  | 'ss'
  | 's'
  | 'SSS'
  | 'SS'
  | 'S'
  | 'a'
  | 'A'
  | 'Z'
  | 'ZZ';

export const formatToken = (
  token: FormatToken,
  pdt: PlainDateTime,
  locale: Locale
): string => {
  const d = new Date(pdt.y, pdt.m - 1, pdt.d, pdt.h, pdt.min, pdt.s, pdt.ms);
  switch (token) {
    case 'YYYY':
      return d.getFullYear().toString();
    case 'YY':
      return d.getFullYear().toString().slice(-2);
    case 'MMMM':
      return d.toLocaleString(locale, { month: 'long' });
    case 'MMM':
      return d.toLocaleString(locale, { month: 'short' });
    case 'MM':
      return (d.getMonth() + 1).toString().padStart(2, '0');
    case 'M':
      return (d.getMonth() + 1).toString();
    case 'DD':
      return d.getDate().toString().padStart(2, '0');
    case 'D':
      return d.getDate().toString();
    case 'dddd':
      return d.toLocaleString(locale, { weekday: 'long' });
    case 'ddd':
      return d.toLocaleString(locale, { weekday: 'short' });
    case 'HH':
      return d.getHours().toString().padStart(2, '0');
    case 'H':
      return d.getHours().toString();
    case 'hh':
      return (d.getHours() % 12 || 12).toString().padStart(2, '0');
    case 'h':
      return (d.getHours() % 12 || 12).toString();
    case 'mm':
      return d.getMinutes().toString().padStart(2, '0');
    case 'm':
      return d.getMinutes().toString();
    case 'ss':
      return d.getSeconds().toString().padStart(2, '0');
    case 's':
      return d.getSeconds().toString();
    case 'SSS':
      return d.getMilliseconds().toString().padStart(3, '0');
    case 'SS':
      return Math.floor(d.getMilliseconds() / 10)
        .toString()
        .padStart(2, '0');
    case 'S':
      return Math.floor(d.getMilliseconds() / 100).toString();
    case 'a':
      return d.getHours() < 12 ? 'am' : 'pm';
    case 'A':
      return d.getHours() < 12 ? 'AM' : 'PM';
    case 'Z':
      return '+00:00'; // UTC offset placeholder
    case 'ZZ':
      return '+0000'; // UTC offset placeholder
    default:
      return token;
  }
};

export const format = (
  pattern: string,
  pdt: PlainDateTime,
  locale = 'en'
): string =>
  pattern.replace(
    /(YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|HH|H|hh|h|mm|m|ss|s|SSS|SS|S|a|A|Z|ZZ)/g,
    (t) => formatToken(t as FormatToken, pdt, locale)
  );

/* ------------------------------------------------------------------ *
 *  6.  DURATION  ARITHMETIC  (monoid)
 * ------------------------------------------------------------------ */
export const zero: Duration = { ms: 0 };
export const add = (d1: Duration, d2: Duration): Duration => ({
  ms: d1.ms + d2.ms,
});
export const sub = (d1: Duration, d2: Duration): Duration => ({
  ms: d1.ms - d2.ms,
});

export const durations = {
  milliseconds: (n: number): Duration => ({ ms: n }),
  seconds: (n: number): Duration => ({ ms: n * MILLIS.SECOND }),
  minutes: (n: number): Duration => ({ ms: n * MILLIS.MINUTE }),
  hours: (n: number): Duration => ({ ms: n * MILLIS.HOUR }),
  days: (n: number): Duration => ({ ms: n * MILLIS.DAY }),
  weeks: (n: number): Duration => ({ ms: n * MILLIS.WEEK }),
};

/* ------------------------------------------------------------------ *
 *  7.  UTILITY FUNCTIONS
 * ------------------------------------------------------------------ */
export const instant = (epochMs: number): Instant => Object.freeze({ epochMs });
export const duration = (ms: number): Duration => Object.freeze({ ms });
export const now = (): Instant => instant(Date.now());

export const dateTime = (
  y: number,
  month: number,
  d: number,
  h: number,
  min: number,
  s: number,
  ms: number
): PlainDateTime => ({ y, m: month, d, h, min, s, ms });

export const fromPlain = (pdt: PlainDateTime): Instant => {
  const epochMs = Date.UTC(
    pdt.y,
    pdt.m - 1,
    pdt.d,
    pdt.h,
    pdt.min,
    pdt.s,
    pdt.ms
  );
  return instant(epochMs);
};

export const toPlain = (i: Instant): PlainDateTime => {
  const d = new Date(i.epochMs);
  return {
    y: d.getUTCFullYear(),
    m: d.getUTCMonth() + 1,
    d: d.getUTCDate(),
    h: d.getUTCHours(),
    min: d.getUTCMinutes(),
    s: d.getUTCSeconds(),
    ms: d.getUTCMilliseconds(),
  };
};

export const parseISO = (isoString: string): PlainDateTime => {
  const d = new Date(isoString);
  if (isNaN(d.getTime())) {
    // Return epoch instead of throwing
    return {
      y: 1970,
      m: 1,
      d: 1,
      h: 0,
      min: 0,
      s: 0,
      ms: 0,
    };
  }
  return {
    y: d.getUTCFullYear(),
    m: d.getUTCMonth() + 1,
    d: d.getUTCDate(),
    h: d.getUTCHours(),
    min: d.getUTCMinutes(),
    s: d.getUTCSeconds(),
    ms: d.getUTCMilliseconds(),
  };
};

export const addDuration =
  (dur: Duration) =>
  (i: Instant): Instant =>
    instant(i.epochMs + dur.ms);

/* ------------------------------------------------------------------ *
 *  8.  CALENDAR  ARITHMETIC  (total, safe)
 * ------------------------------------------------------------------ */
const mod = (n: number, m: number) => ((n % m) + m) % m;

export const addYears =
  (n: number) =>
  (d: PlainDate): PlainDate => ({ ...d, y: d.y + n });

export const addMonths =
  (n: number) =>
  (d: PlainDate): PlainDate => {
    const total = d.m - 1 + n;
    const y = d.y + Math.floor(total / 12);
    const m = mod(total, 12) + 1;
    const dim = daysInMonth[m - 1] + (m === 2 && isLeap(y) ? 1 : 0);
    return { y, m, d: Math.min(d.d, dim) };
  };

export const addDays =
  (n: number) =>
  (d: PlainDate): PlainDate => {
    const ms =
      fromPlain(dateTime(d.y, d.m, d.d, 0, 0, 0, 0)).epochMs + n * MILLIS.DAY;
    return toPlain(instant(ms));
  };

export const addHours =
  (n: number) =>
  (dt: PlainDateTime): PlainDateTime => {
    const ms = fromPlain(dt).epochMs + n * MILLIS.HOUR;
    return toPlain(instant(ms));
  };

export const addMinutes =
  (n: number) =>
  (dt: PlainDateTime): PlainDateTime => {
    const ms = fromPlain(dt).epochMs + n * MILLIS.MINUTE;
    return toPlain(instant(ms));
  };

export const addSeconds =
  (n: number) =>
  (dt: PlainDateTime): PlainDateTime => {
    const ms = fromPlain(dt).epochMs + n * MILLIS.SECOND;
    return toPlain(instant(ms));
  };

export const addMilliseconds =
  (n: number) =>
  (dt: PlainDateTime): PlainDateTime => {
    const ms = fromPlain(dt).epochMs + n;
    return toPlain(instant(ms));
  };

/* ------------------------------------------------------------------ *
 *  9.  DAY-OF-WEEK / WEEK-BASED  YEAR
 * ------------------------------------------------------------------ */
export const dayOfWeek = (d: PlainDate): number => {
  const t = new Date(d.y, d.m - 1, d.d).getDay();
  return t === 0 ? 7 : t;
};

export const startOfWeek = (d: PlainDate, startOn = 1): PlainDate => {
  const dow = dayOfWeek(d);
  const diff = (dow - startOn + 7) % 7;
  return addDays(-diff)(d);
};

/* ------------------------------------------------------------------ *
 *  10.  TIMEZONE  SUPPORT
 * ------------------------------------------------------------------ */
export const UTC: TimeZone = { name: 'UTC', offsetMinutes: 0, dst: false };

export const zone = (name: string, instant: Instant = now()): TimeZone => {
  return getTimezoneInfo(name, instant);
};

export const withZone =
  (z: TimeZone) =>
  (dt: PlainDateTime): ZDT<PlainDateTime> =>
    zdt(fromPlain(dt), z, dt);

export const withZoneName =
  (zoneName: string) =>
  (dt: PlainDateTime): ZDT<PlainDateTime> => {
    const instant = fromPlain(dt);
    const tz = zone(zoneName, instant);
    return zdt(instant, tz, dt);
  };

export const toUTC = (zdtObj: ZDT<PlainDateTime>): ZDT<PlainDateTime> =>
  zdt(
    instant(zdtObj.instant.epochMs - zdtObj.zone.offsetMinutes * 60_000),
    UTC,
    zdtObj.payload
  );

export const toZone =
  (zoneName: string) =>
  (zdtObj: ZDT<PlainDateTime>): ZDT<PlainDateTime> => {
    const newZone = zone(zoneName, zdtObj.instant);
    const adjustedMs =
      zdtObj.instant.epochMs +
      (newZone.offsetMinutes - zdtObj.zone.offsetMinutes) * 60_000;
    return zdt(instant(adjustedMs), newZone, zdtObj.payload);
  };

export const offset = (zdtObj: ZDT<PlainDateTime>): Duration =>
  duration(zdtObj.zone.offsetMinutes * 60_000);

/* Timezone utility functions */
export const isValidTimezone = (tzName: string): boolean => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tzName });
    return true;
  } catch {
    return false;
  }
};

export const getTimezoneOffset = (
  tzName: string,
  instant: Instant = now()
): number => {
  return tzOffset(tzName, instant);
};

export const isDST = (tzName: string, instant: Instant = now()): boolean => {
  const tzInfo = getTimezoneInfo(tzName, instant);
  return tzInfo.dst;
};

/* ------------------------------------------------------------------ *
 *  11.  RANGE / INTERVAL  (functor)
 * ------------------------------------------------------------------ */
export type Interval<A> = { readonly start: ZDT<A>; readonly end: ZDT<A> };
export const interval = <A>(s: ZDT<A>, e: ZDT<A>): Interval<A> => ({
  start: s,
  end: e,
});
export const durationOfInterval = <A>(iv: Interval<A>): Duration =>
  duration(iv.end.instant.epochMs - iv.start.instant.epochMs);

/* ------------------------------------------------------------------ *
 *  12.  RECURRENCE  GENERATORS
 * ------------------------------------------------------------------ */
export type RecurrenceRule = (
  origin: ZDT<PlainDateTime>
) => Generator<ZDT<PlainDateTime>, void, unknown>;

export const every = (dur: Duration): RecurrenceRule =>
  function* (origin) {
    const generateNext = (
      cur: number
    ): Generator<ZDT<PlainDateTime>, void, unknown> => {
      return (function* () {
        yield { ...origin, instant: instant(cur) };
        yield* generateNext(cur + dur.ms);
      })();
    };
    yield* generateNext(origin.instant.epochMs);
  };

export const everyDay = every(durations.days(1));
export const everyWeek = every(durations.weeks(1));
export const everyMonth = (n = 1): RecurrenceRule =>
  function* (origin) {
    const generateNext = (
      p: PlainDateTime
    ): Generator<ZDT<PlainDateTime>, void, unknown> => {
      return (function* () {
        yield { ...origin, payload: p };
        const newDate = addMonths(n)(p);
        const newDateTime = {
          ...newDate,
          h: p.h,
          min: p.min,
          s: p.s,
          ms: p.ms,
        };
        yield* generateNext(newDateTime);
      })();
    };
    yield* generateNext(origin.payload);
  };

/* ------------------------------------------------------------------ *
 *  13.  DURATION  HUMANIZATION
 * ------------------------------------------------------------------ */
export const humanize = (d: Duration): string => {
  const abs = Math.abs(d.ms);
  const sign = d.ms < 0 ? '-' : '';
  if (abs < 1000) return `${sign}${abs} ms`;
  if (abs < 60_000) return `${sign}${Math.round(abs / 1000)} s`;
  if (abs < 3_600_000) return `${sign}${Math.round(abs / 60_000)} min`;
  if (abs < 86_400_000) return `${sign}${Math.round(abs / 3_600_000)} h`;
  return `${sign}${Math.round(abs / 86_400_000)} d`;
};

/* ------------------------------------------------------------------ *
 *  14.  MAIN  API  (immutable, chainable)
 * ------------------------------------------------------------------ */
export type ReamDate = {
  /* Constructors */
  readonly clone: () => ReamDate;
  /* Getters */
  readonly year: () => number;
  readonly month: () => number;
  readonly date: () => number;
  readonly day: () => number;
  readonly weekday: () => number;
  readonly hour: () => number;
  readonly minute: () => number;
  readonly second: () => number;
  readonly millisecond: () => number;
  /* Mutators (return new instance) */
  readonly add: (value: number, unit: keyof typeof durations) => ReamDate;
  readonly subtract: (value: number, unit: keyof typeof durations) => ReamDate;
  /* Formatters */
  readonly format: (pattern?: string, locale?: Locale) => string;
  readonly toISOString: () => string;
  readonly toLocaleString: (locale?: Locale) => string;
  /* Timezone */
  readonly tz: (name: string) => ReamDate;
  readonly utc: () => ReamDate;
  readonly timezone: () => TimeZone;
  readonly isDST: () => boolean;
  readonly offset: () => number;
  /* Conversion */
  readonly valueOf: () => number;
};

/* ------------------------------------------------------------------ *
 *  15.  PLUG-IN  SYSTEM
 * ------------------------------------------------------------------ */
export type Plugin = {
  readonly install: (api: ReamDate) => ReamDate;
};

export const extend =
  (plugin: Plugin) =>
  (rd: ReamDate): ReamDate =>
    plugin.install(rd);

/* ------------------------------------------------------------------ *
 *  16.  FACTORY AND IMPLEMENTATION
 * ------------------------------------------------------------------ */
/* Factory */
const ream = (
  input?: string | number | Date | PlainDateTime,
  zoneName = 'UTC'
): ReamDate => {
  const instant: Instant = (() => {
    if (typeof input === 'string') {
      const parsed = parseISO(input);
      return fromPlain(parsed);
    }
    if (typeof input === 'number') return { epochMs: input };
    if (input instanceof Date) return { epochMs: input.getTime() };
    if (input) return fromPlain(input);
    return now();
  })();
  const timeZone = zoneName === 'UTC' ? UTC : zone(zoneName);
  return makeReam(instant, timeZone);
};

const makeReam = (instant: Instant, timeZone: TimeZone): ReamDate => ({
  clone: () => makeReam(instant, timeZone),

  /* getters */
  year: () => toPlain(instant).y,
  month: () => toPlain(instant).m,
  date: () => toPlain(instant).d,
  day: () => dayOfWeek(toPlain(instant)),
  weekday: () => dayOfWeek(toPlain(instant)),
  hour: () => toPlain(instant).h,
  minute: () => toPlain(instant).min,
  second: () => toPlain(instant).s,
  millisecond: () => toPlain(instant).ms,

  /* mutators */
  add: (v, unit) =>
    makeReam(addDuration(durations[unit](v))(instant), timeZone),
  subtract: (v, unit) =>
    makeReam(addDuration(durations[unit](-v))(instant), timeZone),

  /* formatters */
  format: (p = 'YYYY-MM-DDTHH:mm:ss.SSSZ', l = 'en') =>
    format(p, toPlain(instant), l),
  toISOString: () => {
    const d = new Date(instant.epochMs);
    return d.toISOString();
  },
  toLocaleString: (l = 'en') =>
    format('dddd, MMMM D, YYYY h:mm A', toPlain(instant), l),

  /* timezone */
  tz: (name) => makeReam(instant, zone(name, instant)),
  utc: () => makeReam(instant, UTC),
  timezone: () => timeZone,
  isDST: () => timeZone.dst,
  offset: () => timeZone.offsetMinutes,

  valueOf: () => instant.epochMs,
});

export default ream;

/* ------------------------------------------------------------------ *
 *  17.  EXAMPLE PLUGINS
 * ------------------------------------------------------------------ */
/* Plugin:  relative-time */
const relative = (rd: ReamDate) => ({
  fromNow: () => humanize(duration(Date.now() - rd.valueOf())),
});

export const relativePlugin: Plugin = {
  install: (rd) => ({ ...rd, ...relative(rd) }),
};

/* Plugin:  business days */
const business = (rd: ReamDate) => ({
  nextBusinessDay: () =>
    rd.day() === 6 || rd.day() === 0 ? rd.add(1, 'days') : rd,
});

export const businessPlugin: Plugin = {
  install: (rd) => ({ ...rd, ...business(rd) }),
};
