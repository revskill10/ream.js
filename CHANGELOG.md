# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
