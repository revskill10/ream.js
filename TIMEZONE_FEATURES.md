# Real Timezone Database Support

ream.js now includes comprehensive support for real IANA timezone data using the built-in JavaScript `Intl` API. This provides accurate timezone information including DST transitions, timezone abbreviations, and offset calculations.

## Features

### ✅ Real IANA Timezone Data
- Uses browser/Node.js built-in `Intl.DateTimeFormat` API
- No external dependencies required
- Supports all IANA timezone identifiers
- Automatic DST detection and handling

### ✅ Enhanced TimeZone Type
```typescript
export type TimeZone = {
  readonly name: string;          // IANA string (e.g. "America/New_York")
  readonly offsetMinutes: number; // current offset (minutes east of UTC)
  readonly dst: boolean;          // is DST active?
  readonly abbreviation?: string; // timezone abbreviation (e.g. "EST", "PDT")
};
```

### ✅ New Timezone Functions

#### `getTimezoneInfo(tzName: string, instant: Instant): TimeZone`
Get comprehensive timezone information for a specific moment in time.

```typescript
import { getTimezoneInfo, instant } from 'ream.js';

const nyTime = instant(Date.UTC(2023, 6, 15, 16, 30, 0)); // July 15, 2023
const tzInfo = getTimezoneInfo('America/New_York', nyTime);

console.log(tzInfo);
// {
//   name: 'America/New_York',
//   offsetMinutes: -240,  // EDT (UTC-4)
//   dst: true,
//   abbreviation: 'EDT'
// }
```

#### `isValidTimezone(tzName: string): boolean`
Validate IANA timezone identifiers.

```typescript
import { isValidTimezone } from 'ream.js';

console.log(isValidTimezone('America/New_York')); // true
console.log(isValidTimezone('Invalid/Timezone')); // false
```

#### `isDST(tzName: string, instant?: Instant): boolean`
Check if Daylight Saving Time is active.

```typescript
import { isDST, instant } from 'ream.js';

const summer = instant(Date.UTC(2023, 6, 15)); // July
const winter = instant(Date.UTC(2023, 0, 15)); // January

console.log(isDST('America/New_York', summer)); // true (EDT)
console.log(isDST('America/New_York', winter)); // false (EST)
```

#### `getTimezoneOffset(tzName: string, instant?: Instant): number`
Get timezone offset in minutes.

```typescript
import { getTimezoneOffset, instant } from 'ream.js';

const summer = instant(Date.UTC(2023, 6, 15));
console.log(getTimezoneOffset('America/New_York', summer)); // -240 (EDT)
```

#### `getAvailableTimezones(): readonly string[]`
Get list of commonly used timezone identifiers.

```typescript
import { getAvailableTimezones } from 'ream.js';

const timezones = getAvailableTimezones();
console.log(timezones.includes('America/New_York')); // true
```

### ✅ Enhanced ReamDate API

#### New Methods
- `timezone(): TimeZone` - Get current timezone information
- `isDST(): boolean` - Check if DST is active
- `offset(): number` - Get timezone offset in minutes

```typescript
import ream from 'ream.js';

const date = ream('2023-07-15T14:30:00', 'America/New_York');

console.log(date.timezone().name);        // 'America/New_York'
console.log(date.timezone().abbreviation); // 'EDT'
console.log(date.isDST());                // true
console.log(date.offset());               // -240
```

#### Enhanced Timezone Conversion
```typescript
import ream from 'ream.js';

const utcDate = ream('2023-07-15T16:30:00Z');

// Convert to different timezones
const nyDate = utcDate.tz('America/New_York');
const londonDate = utcDate.tz('Europe/London');
const tokyoDate = utcDate.tz('Asia/Tokyo');

console.log(`UTC:      ${utcDate.format()}`);
console.log(`New York: ${nyDate.format()} ${nyDate.timezone().abbreviation}`);
console.log(`London:   ${londonDate.format()} ${londonDate.timezone().abbreviation}`);
console.log(`Tokyo:    ${tokyoDate.format()} ${tokyoDate.timezone().abbreviation}`);
```

### ✅ Advanced Timezone Operations

#### `withZoneName(zoneName: string)`
Create ZDT with timezone name.

```typescript
import { withZoneName, dateTime } from 'ream.js';

const dt = dateTime(2023, 7, 15, 14, 30, 0, 0);
const zdtObj = withZoneName('Europe/London')(dt);
```

#### `toZone(zoneName: string)`
Convert ZDT between timezones.

```typescript
import { withZoneName, toZone, dateTime } from 'ream.js';

const nyZdt = withZoneName('America/New_York')(dateTime(2023, 7, 15, 14, 30, 0, 0));
const londonZdt = toZone('Europe/London')(nyZdt);
```

## Migration from Mock Implementation

The previous mock timezone implementation has been replaced with real IANA timezone data. Key changes:

1. **Dynamic Offset Calculation**: Offsets are now calculated based on actual DST rules
2. **Accurate DST Detection**: Real DST transitions are detected automatically
3. **Timezone Abbreviations**: Added support for timezone abbreviations (EST, EDT, etc.)
4. **Validation**: Timezone names are validated against real IANA data
5. **Fallback Behavior**: Invalid timezones fall back to UTC instead of throwing errors

## Browser and Node.js Support

This implementation uses the standard `Intl.DateTimeFormat` API which is supported in:
- All modern browsers (Chrome 24+, Firefox 29+, Safari 10+, Edge 12+)
- Node.js 8.0+ (with full ICU data)
- Deno and Bun

No external dependencies or timezone data files are required.

## Examples

See `examples/timezone-demo.ts` for a comprehensive demonstration of all timezone features.
