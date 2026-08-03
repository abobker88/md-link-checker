# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-08-02

### Added

- Recursive scanning of `.md` and `.mdx` files
- Extraction of Markdown links and image references
- Validation of local relative file links
- Validation of same-file anchors (`#installation`)
- Validation of anchors in linked Markdown files (`./guide.md#setup`)
- Optional external `http`/`https` link checking (`--external`)
- Configurable ignore patterns (`--ignore`), with `node_modules`, `.git`,
  `dist`, `build`, and `coverage` ignored by default
- JSON output mode (`--json`)
- Categorized errors: `missing-file`, `invalid-anchor`, `unreachable-url`
- Formatted terminal output with per-file grouping and a summary line
- Non-zero exit code when broken links are found
- Unit and integration tests covering parsing, validation, scanning, and
  anchor slugging
