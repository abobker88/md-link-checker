# md-link-checker

[![CI](https://github.com/abobker88/md-link-checker/actions/workflows/ci.yml/badge.svg)](https://github.com/abobker88/md-link-checker/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![npm version](https://img.shields.io/npm/v/md-link-checker.svg)](https://www.npmjs.com/package/md-link-checker)

A small, fast CLI that scans your Markdown files and reports:

- **Broken relative links** — links pointing at files that don't exist
- **Missing files** — images and other local files that are referenced but not found
- **Invalid anchors** — links to headings (`#some-heading`) that don't exist, in the
  same file or in another Markdown file
- **Unreachable URLs** — optional, opt-in checking of `http`/`https` links

Built with TypeScript, zero configuration required, and designed to be easy to read and
extend — a good project to learn from or contribute to.

## Why

Markdown docs rot. Files get renamed, headings get reworded, pages get deleted — and
links quietly break. `md-link-checker` catches that in CI before it reaches your
readers.

## Install

```bash
npm install --save-dev md-link-checker
```

Or run it without installing:

```bash
npx md-link-checker .
```

## Usage

```bash
md-link-checker [directory] [options]
```

```bash
# Scan the current directory
md-link-checker .

# Scan a docs folder
md-link-checker docs/

# Also validate http(s) links (makes real network requests)
md-link-checker . --external

# Machine-readable output, e.g. for CI tooling
md-link-checker . --json

# Skip extra folders on top of the built-in defaults
# (node_modules, .git, dist, build, coverage are always skipped)
md-link-checker . --ignore vendor --ignore "*.generated.md"
```

The process exits with status code `1` if any broken links were found, and `0`
otherwise — so it plugs straight into CI.

### Options

| Flag                  | Description                                                          |
| ---------------------- | --------------------------------------------------------------------- |
| `--external`           | Validate `http`/`https` links by requesting them                     |
| `--json`               | Print a JSON report instead of formatted text                        |
| `--ignore <pattern>`   | Ignore files/folders matching a pattern (repeatable)                  |
| `--timeout <ms>`       | Timeout per external link request (default: `5000`)                  |
| `--concurrency <n>`    | Max concurrent external link requests (default: `8`)                 |
| `-h, --help`           | Show usage                                                             |
| `-v, --version`        | Show the installed version                                            |

### Example output

```
docs/guide.md
  12:3  [missing file]     File not found: ./setup.md
  27:9  [invalid anchor]   Anchor "#instalation" not found in this file

FAIL — 2 error(s)  (4 file(s) scanned, 11 link(s) checked, 8ms)
```

## What gets checked

- `.md` and `.mdx` files, scanned recursively from the target directory
- Markdown links `[text](target)` and images `![alt](target)`
- Relative file paths are resolved relative to the file that contains the link
- Anchors are matched using GitHub's heading-slug rules (lowercase, spaces →
  hyphens, punctuation stripped, duplicates get a `-1`, `-2`, ... suffix)
- Links inside fenced code blocks and inline code spans are ignored, since they're
  usually examples, not real links
- `mailto:` and `tel:` links are ignored
- `http`/`https` links are only requested when `--external` is passed

## Programmatic API

The core logic is also exported as a library, in case you want to build your own
tooling on top of it:

```ts
import { runCheck } from 'md-link-checker';

const summary = await runCheck({
  rootDir: './docs',
  ignorePatterns: [],
  extensions: ['.md', '.mdx'],
  checkExternal: false,
  externalTimeoutMs: 5000,
  externalConcurrency: 8,
});

console.log(summary.errors);
```

## Project structure

```
src/
  cli.ts       Entry point: parses argv, runs the check, prints results, sets exit code
  args.ts      Argument parsing and --help text
  check.ts     Orchestrates scan → parse → validate → (optional) external check
  scan.ts      Recursively walks a directory, applying ignore patterns
  parse.ts     Extracts links, images, and headings from Markdown source
  anchors.ts   GitHub-style heading-slug generation and anchor normalization
  validate.ts  Validates links against the filesystem and known anchors
  external.ts  Optional http(s) link checking with concurrency and timeouts
  format.ts    Text and JSON report rendering
  types.ts     Shared TypeScript types
tests/         Vitest unit and integration tests, with fixture Markdown files
```

## Development

```bash
npm install
npm run dev -- .        # run the CLI against a directory via tsx (no build step)
npm test                 # run the test suite
npm run lint              # lint
npm run build              # compile TypeScript to dist/
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to propose changes.

## Roadmap

This project was built in phases; ideas for what's next live in
[CONTRIBUTING.md](./CONTRIBUTING.md#ideas-for-contributions) and the issue tracker.
Config files, custom rules, and a `--fix` mode for simple cases are all reasonable
future directions — contributions welcome.

## License

[MIT](./LICENSE)
