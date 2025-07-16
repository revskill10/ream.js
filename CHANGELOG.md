# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-07-16

### Added
- **Real IANA Timezone Database Support**: Complete integration with real timezone data using built-in `Intl` API
- **Enhanced TimeZone Type**: Added `abbreviation` field for timezone abbreviations (EST, EDT, GMT, etc.)
- **New Timezone Functions**:
  - `getTimezoneInfo(tzName, instant)`: Get comprehensive timezone information
  - `isValidTimezone(tzName)`: Validate IANA timezone identifiers
  - `isDST(tzName, instant)`: Check if Daylight Saving Time is active
  - `getTimezoneOffset(tzName, instant)`: Get timezone offset in minutes
  - `getAvailableTimezones()`: Get list of supported timezone identifiers
  - `withZoneName(zoneName)`: Create ZDT with timezone name
  - `toZone(zoneName)`: Convert ZDT between timezones
- **Enhanced ReamDate API**:
  - `timezone()`: Get current timezone information
  - `isDST()`: Check if DST is active for current timezone
  - `offset()`: Get timezone offset in minutes
- **Automatic DST Detection**: Real DST transitions based on actual timezone rules
- **Zero Dependencies**: Uses built-in browser/Node.js `Intl` API for timezone data

### Changed
- **Breaking**: Timezone offset calculations now use real IANA data instead of mock values
- **Breaking**: Invalid timezone names now return UTC fallback instead of throwing errors (functional programming compliance)
- Timezone-related functions now provide accurate DST detection and offset calculations
- Enhanced test suite with 76 tests including comprehensive timezone coverage

### Technical Details
- Real timezone data powered by JavaScript's built-in `Intl.DateTimeFormat` API
- Support for all IANA timezone identifiers available in the runtime environment
- Accurate DST transition detection using seasonal offset comparison
- Maintains functional programming principles with safe fallback behavior
- Compatible with all modern browsers and Node.js environments

## [1.0.0] - 2025-01-16

### Added
- Complete implementation of REAM.js datetime library
- Core types: Instant, Duration, PlainDate, PlainTime, PlainDateTime
- Timezone support with IANA timezone handling
- Calendar arithmetic with overflow handling
- Token-based formatting system with locale support
- Duration operations with monoid support and humanization
- Recurrence generators: every, everyDay, everyMonth
- Plugin system with relativePlugin and businessPlugin
- Chainable ReamDate interface with all standard operations
- Comprehensive test suite with 61 tests
- Full TypeScript support with type definitions
- Automated npm publishing via GitHub Actions
- CI/CD pipeline with multi-Node.js version testing

### Technical Details
- Functional programming approach with pure functions
- Immutable data structures throughout
- UTC-first design for consistent timezone handling
- Extensible plugin architecture
- Complete REAM.md specification compliance

[Unreleased]: https://github.com/revskill10/ream.js/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/revskill10/ream.js/releases/tag/v1.0.0
