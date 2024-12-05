<!--
SPDX-FileCopyrightText: 2024 Shota FUJI <pockawoooh@gmail.com>
SPDX-License-Identifier: Apache-2.0
-->

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.2] - 2024-12-05

### Changed

- Reduced the number of indirect dependencies by changing TOML parser library.

## [0.1.1] - 2024-11-27

### Fixed

- Gleam compile error crashing Vite server.
- Gleam compilation running twice for some files.
- Node.js error thrown during importing this plugin due to its module path not starting with a dot.
- TypeScript error about missing type definition.

## [0.1.0] - 2024-11-25

### Added

- Initial plugin code.

[unreleased]: https://github.com/pocka/rollup-plugin-gleam/compare/v0.1.2...HEAD
[0.1.2]: https://github.com/pocka/rollup-plugin-gleam/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/pocka/rollup-plugin-gleam/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/pocka/rollup-plugin-gleam/releases/tag/v0.1.0
