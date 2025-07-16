# REAM.js Complete API Documentation

A comprehensive, functional datetime library for JavaScript/TypeScript with immutable data structures, real IANA timezone database support, and a plugin system.

## Table of Contents

- [Installation](#installation)
- [Core Types](#core-types)
- [Basic Usage](#basic-usage)
- [Timezone Support](#timezone-support)
- [Calendar Arithmetic](#calendar-arithmetic)
- [Duration Operations](#duration-operations)
- [Formatting](#formatting)
- [Recurrence Generators](#recurrence-generators)
- [Plugin System](#plugin-system)
- [Advanced Features](#advanced-features)

## Installation

```bash
npm install ream.js
```

```typescript
import ream from 'ream.js';
// or
import { instant, duration, zone, format } from 'ream.js';
```

## Core Types

### Instant
Represents a point in time (epoch milliseconds).

```typescript
import { instant, now } from 'ream.js';

const specificTime = instant(1689436245123); // July 15, 2023
const currentTime = now();
```

### Duration
Represents a time span in milliseconds.

```typescript
import { duration, durations } from 'ream.js';

const fiveMinutes = duration(300000); // 5 minutes in ms
const oneHour = durations.hours(1);
const twoWeeks = durations.weeks(2);
```

### PlainDate, PlainTime, PlainDateTime
Immutable date/time representations without timezone.

```typescript
import { dateTime } from 'ream.js';

const dt = dateTime(2023, 7, 15, 14, 30, 45, 123);
// { y: 2023, m: 7, d: 15, h: 14, min: 30, s: 45, ms: 123 }
```

### TimeZone
Enhanced timezone information with real IANA data.

```typescript
import { getTimezoneInfo, instant } from 'ream.js';

const tzInfo = getTimezoneInfo('America/New_York', instant(Date.now()));
// {
//   name: 'America/New_York',
//   offsetMinutes: -240,  // EDT (UTC-4) or -300 (EST, UTC-5)
//   dst: true,           // true during daylight saving time
//   abbreviation: 'EDT'  // timezone abbreviation
// }
```

## Basic Usage

### Creating Dates

```typescript
import ream from 'ream.js';

// From ISO string
const date1 = ream('2023-07-15T14:30:45.123Z');

// From timestamp
const date2 = ream(1689436245123);

// From Date object
const date3 = ream(new Date());

// Current time
const now = ream();

// With timezone
const nyDate = ream('2023-07-15T14:30:45.123Z', 'America/New_York');
```

### Basic Operations

```typescript
import ream from 'ream.js';

const date = ream('2023-07-15T14:30:45.123Z');

// Getters
console.log(date.year());        // 2023
console.log(date.month());       // 7
console.log(date.date());        // 15
console.log(date.hour());        // 14
console.log(date.minute());      // 30
console.log(date.second());      // 45
console.log(date.millisecond()); // 123
console.log(date.day());         // Day of week (1-7)
console.log(date.weekday());     // Same as day()

// Immutable operations
const tomorrow = date.add(1, 'days');
const lastWeek = date.subtract(1, 'weeks');
const nextHour = date.add(1, 'hours');

// Cloning
const copy = date.clone();
```

## Timezone Support

### Real IANA Timezone Database

```typescript
import { 
  getTimezoneInfo, 
  isValidTimezone, 
  isDST, 
  getTimezoneOffset,
  getAvailableTimezones 
} from 'ream.js';

// Get timezone information
const summer = instant(Date.UTC(2023, 6, 15)); // July 15, 2023
const winter = instant(Date.UTC(2023, 0, 15)); // January 15, 2023

const summerInfo = getTimezoneInfo('America/New_York', summer);
console.log(summerInfo);
// {
//   name: 'America/New_York',
//   offsetMinutes: -240,
//   dst: true,
//   abbreviation: 'EDT'
// }

const winterInfo = getTimezoneInfo('America/New_York', winter);
console.log(winterInfo);
// {
//   name: 'America/New_York', 
//   offsetMinutes: -300,
//   dst: false,
//   abbreviation: 'EST'
// }

// Timezone validation
console.log(isValidTimezone('America/New_York')); // true
console.log(isValidTimezone('Invalid/Timezone')); // false

// DST detection
console.log(isDST('America/New_York', summer)); // true (EDT)
console.log(isDST('America/New_York', winter)); // false (EST)

// Get offset
console.log(getTimezoneOffset('America/New_York', summer)); // -240
console.log(getTimezoneOffset('America/New_York', winter)); // -300

// Available timezones
const timezones = getAvailableTimezones();
console.log(timezones.includes('Europe/London')); // true
```

### ReamDate Timezone Methods

```typescript
import ream from 'ream.js';

const date = ream('2023-07-15T14:30:00', 'America/New_York');

// Get timezone information
console.log(date.timezone().name);        // 'America/New_York'
console.log(date.timezone().abbreviation); // 'EDT'
console.log(date.isDST());                // true
console.log(date.offset());               // -240

// Convert timezones
const utcDate = date.utc();
const londonDate = date.tz('Europe/London');
const tokyoDate = date.tz('Asia/Tokyo');

console.log(`UTC:    ${utcDate.format()}`);
console.log(`London: ${londonDate.format()} ${londonDate.timezone().abbreviation}`);
console.log(`Tokyo:  ${tokyoDate.format()} ${tokyoDate.timezone().abbreviation}`);
```

### Advanced Timezone Operations

```typescript
import { withZone, withZoneName, toZone, dateTime } from 'ream.js';

const dt = dateTime(2023, 7, 15, 14, 30, 0, 0);

// Create ZDT with timezone
const nyZdt = withZoneName('America/New_York')(dt);
console.log(nyZdt.zone.name); // 'America/New_York'

// Convert between timezones
const londonZdt = toZone('Europe/London')(nyZdt);
console.log(londonZdt.zone.name); // 'Europe/London'
```

## Calendar Arithmetic

### Safe Date Operations

```typescript
import { addYears, addMonths, addDays } from 'ream.js';

const date = { y: 2023, m: 1, d: 31 }; // January 31, 2023

// Add months safely (handles overflow)
const feb = addMonths(1)(date);
console.log(feb); // { y: 2023, m: 2, d: 28 } - Feb 28, not Feb 31

// Add years
const nextYear = addYears(1)(date);
console.log(nextYear); // { y: 2024, m: 1, d: 31 }

// Add days
const tomorrow = addDays(1)(date);
console.log(tomorrow); // { y: 2023, m: 2, d: 1 }
```

### DateTime Operations

```typescript
import { addHours, addMinutes, addSeconds, addMilliseconds } from 'ream.js';

const dt = dateTime(2023, 7, 15, 14, 30, 45, 123);

const laterHour = addHours(2)(dt);
const laterMinute = addMinutes(30)(dt);
const laterSecond = addSeconds(15)(dt);
const laterMs = addMilliseconds(500)(dt);
```

### Day of Week Operations

```typescript
import { dayOfWeek, startOfWeek } from 'ream.js';

const date = { y: 2023, m: 7, d: 15 }; // Saturday

console.log(dayOfWeek(date)); // 6 (Saturday, 1=Monday)

// Start of week (Monday by default)
const monday = startOfWeek(date);
console.log(monday); // { y: 2023, m: 7, d: 10 }

// Start of week (Sunday)
const sunday = startOfWeek(date, 0);
console.log(sunday); // { y: 2023, m: 7, d: 9 }
```

## Duration Operations

### Creating Durations

```typescript
import { duration, durations, zero } from 'ream.js';

// From milliseconds
const fiveSeconds = duration(5000);

// Using duration helpers
const oneMinute = durations.minutes(1);
const twoHours = durations.hours(2);
const threeDays = durations.days(3);
const oneWeek = durations.weeks(1);

// Zero duration
const noDuration = zero;
```

### Duration Arithmetic (Monoid Operations)

```typescript
import { add, sub, duration } from 'ream.js';

const d1 = durations.hours(2);
const d2 = durations.minutes(30);

// Add durations
const total = add(d1, d2);
console.log(total.ms); // 9000000 (2.5 hours in ms)

// Subtract durations
const difference = sub(d1, d2);
console.log(difference.ms); // 5400000 (1.5 hours in ms)
```

### Duration Humanization

```typescript
import { humanize, duration } from 'ream.js';

console.log(humanize(duration(500)));      // "500 ms"
console.log(humanize(duration(5000)));     // "5 s"
console.log(humanize(duration(300000)));   // "5 min"
console.log(humanize(duration(7200000)));  // "2 h"
console.log(humanize(duration(86400000))); // "1 d"
console.log(humanize(duration(-5000)));    // "-5 s"
```

### Working with Instants and Durations

```typescript
import { addDuration, instant, durations } from 'ream.js';

const now = instant(Date.now());
const oneHour = durations.hours(1);

// Add duration to instant
const later = addDuration(oneHour)(now);
console.log(later.epochMs - now.epochMs); // 3600000
```

## Formatting

### Token-Based Formatting

```typescript
import { format, formatToken, dateTime } from 'ream.js';

const dt = dateTime(2023, 7, 15, 14, 30, 45, 123);

// Full formatting
const formatted = format('YYYY-MM-DD HH:mm:ss.SSS', dt);
console.log(formatted); // "2023-07-15 14:30:45.123"

// Individual tokens
console.log(formatToken('YYYY', dt, 'en')); // "2023"
console.log(formatToken('MMMM', dt, 'en')); // "July"
console.log(formatToken('dddd', dt, 'en')); // "Saturday"
console.log(formatToken('A', dt, 'en'));    // "PM"
```

### Available Format Tokens

```typescript
// Year
'YYYY' // 2023
'YY'   // 23

// Month
'MMMM' // July
'MMM'  // Jul
'MM'   // 07
'M'    // 7

// Day
'DD'   // 15
'D'    // 15
'dddd' // Saturday
'ddd'  // Sat

// Hour
'HH'   // 14 (24-hour)
'H'    // 14
'hh'   // 02 (12-hour)
'h'    // 2

// Minute
'mm'   // 30
'm'    // 30

// Second
'ss'   // 45
's'    // 45

// Millisecond
'SSS'  // 123
'SS'   // 12
'S'    // 1

// AM/PM
'a'    // am/pm
'A'    // AM/PM

// Timezone
'Z'    // +00:00
'ZZ'   // +0000
```

### ReamDate Formatting

```typescript
import ream from 'ream.js';

const date = ream('2023-07-15T14:30:45.123Z');

// Default format
console.log(date.format()); // "2023-07-15T14:30:45.123Z"

// Custom format
console.log(date.format('YYYY-MM-DD')); // "2023-07-15"
console.log(date.format('MMMM D, YYYY')); // "July 15, 2023"
console.log(date.format('dddd, MMMM D, YYYY h:mm A')); // "Saturday, July 15, 2023 2:30 PM"

// With locale
console.log(date.format('MMMM', 'fr')); // French month name

// ISO string
console.log(date.toISOString()); // "2023-07-15T14:30:45.123Z"

// Locale string
console.log(date.toLocaleString()); // "Saturday, July 15, 2023 2:30 PM"
```

## Recurrence Generators

### Basic Recurrence

```typescript
import { every, everyDay, everyWeek, durations, zdt, instant, UTC, dateTime } from 'ream.js';

const origin = zdt(instant(0), UTC, dateTime(2023, 1, 1, 0, 0, 0, 0));

// Every 5 minutes
const everyFiveMinutes = every(durations.minutes(5));
const generator = everyFiveMinutes(origin);

const first = generator.next().value;
const second = generator.next().value;
console.log(second.instant.epochMs - first.instant.epochMs); // 300000 (5 minutes)

// Every day
const dailyGenerator = everyDay(origin);
const day1 = dailyGenerator.next().value;
const day2 = dailyGenerator.next().value;
console.log(day2.instant.epochMs - day1.instant.epochMs); // 86400000 (1 day)

// Every week
const weeklyGenerator = everyWeek(origin);
```

### Monthly Recurrence

```typescript
import { everyMonth, zdt, instant, UTC, dateTime } from 'ream.js';

const origin = zdt(instant(0), UTC, dateTime(2023, 1, 15, 12, 0, 0, 0));

// Every month
const monthlyGenerator = everyMonth(1)(origin);
const month1 = monthlyGenerator.next().value;
const month2 = monthlyGenerator.next().value;

console.log(month1.payload.m); // 1 (January)
console.log(month2.payload.m); // 2 (February)
console.log(month1.payload.d); // 15
console.log(month2.payload.d); // 15

// Every 3 months
const quarterlyGenerator = everyMonth(3)(origin);
```

### Working with Generated Dates

```typescript
import { everyDay, zdt, instant, UTC, dateTime } from 'ream.js';

const origin = zdt(instant(0), UTC, dateTime(2023, 1, 1, 9, 0, 0, 0));
const dailyMeetings = everyDay(origin);

// Generate next 5 meeting dates
const meetings = [];
for (let i = 0; i < 5; i++) {
  const meeting = dailyMeetings.next().value;
  meetings.push(meeting);
}

meetings.forEach((meeting, index) => {
  const date = meeting.payload;
  console.log(`Meeting ${index + 1}: ${date.y}-${date.m}-${date.d} at ${date.h}:00`);
});
```

## Plugin System

### Built-in Plugins

#### Relative Time Plugin

```typescript
import ream, { extend, relativePlugin } from 'ream.js';

const date = ream('2023-07-15T14:30:45.123Z');
const extended = extend(relativePlugin)(date);

// Access the fromNow method
const relativeTime = (extended as any).fromNow();
console.log(relativeTime); // e.g., "2 hours ago" or "in 3 minutes"
```

#### Business Days Plugin

```typescript
import ream, { extend, businessPlugin } from 'ream.js';

const saturday = ream('2023-07-15T14:30:45.123Z'); // Saturday
const extended = extend(businessPlugin)(saturday);

// Access the nextBusinessDay method
const nextBusiness = (extended as any).nextBusinessDay();
console.log(nextBusiness.day()); // Monday (skips weekend)
```

### Creating Custom Plugins

```typescript
import { Plugin, ReamDate } from 'ream.js';

// Define plugin functionality
const customPlugin = (rd: ReamDate) => ({
  isWeekend: () => {
    const day = rd.day();
    return day === 6 || day === 7; // Saturday or Sunday
  },

  addBusinessDays: (days: number) => {
    let current = rd;
    let remaining = days;

    while (remaining > 0) {
      current = current.add(1, 'days');
      const currentDay = current.day();
      if (currentDay !== 6 && currentDay !== 7) { // Not weekend
        remaining--;
      }
    }

    return current;
  },

  quarterStart: () => {
    const month = rd.month();
    const quarterStartMonth = Math.floor((month - 1) / 3) * 3 + 1;
    return ream(`${rd.year()}-${quarterStartMonth.toString().padStart(2, '0')}-01`);
  }
});

// Create plugin object
const businessDaysPlugin: Plugin = {
  install: (rd) => ({ ...rd, ...customPlugin(rd) })
};

// Use the plugin
const date = ream('2023-07-15T14:30:45.123Z');
const enhanced = extend(businessDaysPlugin)(date);

console.log((enhanced as any).isWeekend()); // true (Saturday)
console.log((enhanced as any).addBusinessDays(5).format('YYYY-MM-DD')); // Next Friday
console.log((enhanced as any).quarterStart().format('YYYY-MM-DD')); // 2023-07-01
```

### Chaining Multiple Plugins

```typescript
import ream, { extend, relativePlugin, businessPlugin } from 'ream.js';

const date = ream('2023-07-15T14:30:45.123Z');

// Chain multiple plugins
const fullyExtended = extend(businessPlugin)(extend(relativePlugin)(date));

// Or create a combined plugin
const combinedPlugin: Plugin = {
  install: (rd) => {
    const withRelative = extend(relativePlugin)(rd);
    return extend(businessPlugin)(withRelative);
  }
};

const enhanced = extend(combinedPlugin)(date);
```

## Advanced Features

### ZDT (Zoned DateTime) Functor

```typescript
import { zdt, zfmap, instant, zone, dateTime } from 'ream.js';

// Create ZDT
const i = instant(Date.now());
const z = zone('America/New_York');
const dt = dateTime(2023, 7, 15, 14, 30, 45, 123);

const zdtObj = zdt(i, z, dt);

// Map over the payload (Functor operation)
const mappedZdt = zfmap((payload: PlainDateTime) => ({
  ...payload,
  h: payload.h + 1 // Add one hour
}))(zdtObj);

console.log(zdtObj.payload.h);    // 14
console.log(mappedZdt.payload.h); // 15
```

### Interval Operations

```typescript
import { interval, durationOfInterval, zdt, instant, UTC, dateTime } from 'ream.js';

const start = zdt(instant(Date.UTC(2023, 6, 15, 10, 0, 0)), UTC, dateTime(2023, 7, 15, 10, 0, 0, 0));
const end = zdt(instant(Date.UTC(2023, 6, 15, 14, 30, 0)), UTC, dateTime(2023, 7, 15, 14, 30, 0, 0));

// Create interval
const meeting = interval(start, end);

// Get duration
const duration = durationOfInterval(meeting);
console.log(duration.ms); // 16200000 (4.5 hours in milliseconds)

// Convert to hours
console.log(duration.ms / (1000 * 60 * 60)); // 4.5
```

### Utility Functions

```typescript
import { isLeap, parseISO, fromPlain, toPlain, instant, dateTime } from 'ream.js';

// Leap year detection
console.log(isLeap(2024)); // true
console.log(isLeap(2023)); // false

// ISO parsing (safe - returns epoch on invalid input)
const parsed = parseISO('2023-07-15T14:30:45.123Z');
console.log(parsed); // PlainDateTime object

const invalid = parseISO('invalid-date');
console.log(invalid); // { y: 1970, m: 1, d: 1, h: 0, min: 0, s: 0, ms: 0 }

// Convert between PlainDateTime and Instant
const dt = dateTime(2023, 7, 15, 14, 30, 45, 123);
const i = fromPlain(dt);
const backToDt = toPlain(i);

console.log(dt);       // Original PlainDateTime
console.log(i.epochMs); // Epoch milliseconds
console.log(backToDt); // Converted back to PlainDateTime
```

### Working with Different Calendars

```typescript
import { calendars } from 'ream.js';

// Available calendars
console.log(Object.keys(calendars)); // ['gregory', 'iso8601', 'buddhist', 'persian']

// Calendar information
const gregorian = calendars.gregory;
console.log(gregorian.firstDay);    // 1 (Monday)
console.log(gregorian.monthNames);  // ['January', 'February', ...]

const buddhist = calendars.buddhist;
console.log(buddhist.monthNames);   // ['Poson', 'Āsāḷha', ...]
```

### Constants and Utilities

```typescript
import { MILLIS, daysInMonth } from 'ream.js';

// Time constants
console.log(MILLIS.SECOND); // 1000
console.log(MILLIS.MINUTE); // 60000
console.log(MILLIS.HOUR);   // 3600000
console.log(MILLIS.DAY);    // 86400000
console.log(MILLIS.WEEK);   // 604800000

// Days in each month (non-leap year)
console.log(daysInMonth); // [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
```

## Error Handling and Edge Cases

### Safe Operations

```typescript
import ream, { parseISO, zone, addMonths } from 'ream.js';

// Invalid dates return safe defaults
const invalidDate = parseISO('not-a-date');
console.log(invalidDate); // Returns epoch (1970-01-01)

// Invalid timezones return UTC
const invalidZone = zone('Invalid/Timezone');
console.log(invalidZone.name); // 'UTC'

// Safe month arithmetic
const jan31 = { y: 2023, m: 1, d: 31 };
const feb = addMonths(1)(jan31);
console.log(feb); // { y: 2023, m: 2, d: 28 } - safely handles Feb 31 -> Feb 28
```

### Immutability Guarantees

```typescript
import ream from 'ream.js';

const original = ream('2023-07-15T14:30:45.123Z');
const modified = original.add(1, 'days');

console.log(original.format());  // "2023-07-15T14:30:45.123Z" (unchanged)
console.log(modified.format());  // "2023-07-16T14:30:45.123Z" (new instance)
console.log(original !== modified); // true (different objects)
```

## Performance Considerations

### Efficient Operations

```typescript
import ream, { instant, durations } from 'ream.js';

// Reuse duration objects
const oneDay = durations.days(1);
const oneHour = durations.hours(1);

let date = ream('2023-07-15T14:30:45.123Z');

// Chain operations efficiently
const result = date
  .add(1, 'days')
  .add(2, 'hours')
  .tz('America/New_York')
  .format('YYYY-MM-DD HH:mm:ss');

// Use instant for timestamp operations
const timestamp = instant(Date.now());
const later = instant(timestamp.epochMs + oneDay.ms);
```

## Quick Reference

### Most Common Operations

```typescript
import ream from 'ream.js';

// Create dates
const now = ream();
const specific = ream('2023-07-15T14:30:45.123Z');
const withTz = ream('2023-07-15T14:30:45.123Z', 'America/New_York');

// Basic operations
const tomorrow = now.add(1, 'days');
const lastWeek = now.subtract(1, 'weeks');
const formatted = now.format('YYYY-MM-DD HH:mm:ss');

// Timezone operations
const nyTime = now.tz('America/New_York');
const utcTime = nyTime.utc();
const isDst = nyTime.isDST();

// Comparisons
const isAfter = tomorrow.valueOf() > now.valueOf();
const isSame = now.format('YYYY-MM-DD') === tomorrow.format('YYYY-MM-DD');
```

### Import Patterns

```typescript
// Default import
import ream from 'ream.js';

// Named imports for specific functions
import {
  instant,
  duration,
  zone,
  format,
  getTimezoneInfo,
  isDST,
  isValidTimezone
} from 'ream.js';

// Import everything
import * as Ream from 'ream.js';
```

### TypeScript Types

```typescript
import {
  Instant,
  Duration,
  TimeZone,
  PlainDate,
  PlainTime,
  PlainDateTime,
  ZDT,
  ReamDate,
  Plugin,
  Locale
} from 'ream.js';
```

---

This comprehensive API documentation covers all aspects of ream.js, from basic usage to advanced features, with practical examples for each function and concept. The library provides a powerful, functional approach to date and time manipulation with real timezone support and immutable data structures.
