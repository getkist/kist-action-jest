# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.28] - 2026-08-02

### Added

- `nodeOptions` option for setting `NODE_OPTIONS` on the spawned Jest process (e.g. `--experimental-vm-modules`), enabling ESM support

### Changed

- Updated dependencies
- Raised minimum required Node.js version to >=22.0.0

## [1.0.0] - 2025-02-08

### Added

- Initial release
- `JestAction` for running tests with Jest
- Support for all major Jest CLI options
- Coverage reporting with thresholds
- Watch mode support
- ESM support via nodeOptions
- TypeScript support with full type definitions
