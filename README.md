# ream.js

A comprehensive, functional datetime library for JavaScript/TypeScript with immutable data structures, timezone support, and a plugin system.

## Features

- 🚀 **Functional Programming**: Pure functions and immutable data structures
- 🌍 **Timezone Support**: IANA timezone handling with DST calculations
- 📅 **Calendar Arithmetic**: Safe date/time arithmetic with overflow handling
- 🎨 **Formatting System**: Comprehensive token-based formatting with locale support
- ⏱️ **Duration Operations**: Monoid operations and humanization
- 🔄 **Recurrence Generators**: Flexible recurring date/time patterns
- 🔌 **Plugin System**: Extensible architecture for custom functionality
- 📦 **TypeScript**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install ream.js
```

## Quick Start

```typescript
import ream from 'ream.js';

// Create dates
const date = ream('2023-07-15T14:30:45.123Z');
const now = ream();

// Chain operations
const result = date
  .add(1, 'days')
  .subtract(2, 'hours')
  .tz('America/New_York')
  .format('YYYY-MM-DD HH:mm:ss');

// Use generators
const monthly = everyMonth()(date);
const firstMonth = monthly.next().value;
const secondMonth = monthly.next().value;

// Use plugins
const extended = extend(relativePlugin)(date);
console.log(extended.fromNow()); // "2 hours ago"
```

## Core Types

- **Instant**: Point in time (epoch milliseconds)
- **Duration**: Time span with monoid operations
- **PlainDate**: Calendar date without timezone
- **PlainTime**: Time of day without timezone
- **PlainDateTime**: Combined date and time
- **ZDT**: Zoned DateTime with functor operations

## API Documentation

For complete API documentation, see the [REAM.md specification](./REAM.md).

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the library
npm run build

# Watch mode for development
npm run watch:test
```

## Publishing

This library uses automated npm publishing via GitHub Actions. To publish a new version:

1. Update the version in `package.json`
2. Create a new GitHub release with a tag matching the version (e.g., `v1.0.1`)
3. The GitHub Action will automatically run tests and publish to npm

### Setup NPM Publishing (for maintainers)

1. Create an npm account and generate an access token
2. Add the token as a GitHub secret named `NPM_TOKEN`
3. Ensure the package name in `package.json` is available on npm

## License

MIT
