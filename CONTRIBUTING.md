# Contributing to md-link-checker

Thanks for taking the time to contribute! This project aims to stay small,
readable, and beginner-friendly, so contributions of all sizes are welcome —
from fixing a typo in the README to adding a new validation rule.

## Getting started

1. Fork the repository and clone your fork.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the CLI against the test fixtures without building:
   ```bash
   npm run dev -- tests/fixtures/basic
   ```
4. Make your changes.
5. Run the checks before opening a PR:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```

## Project layout

See the "Project structure" section of the [README](./README.md) for what each
file in `src/` is responsible for. Each module has a single, narrow job:

- `scan.ts` only finds files
- `parse.ts` only extracts links/headings from text
- `validate.ts` only checks links against the filesystem/anchors
- `external.ts` only checks http(s) URLs
- `format.ts` only renders output
- `cli.ts` wires the above together and handles argv/exit codes

If you're adding a feature, try to keep that separation — it makes the
codebase easier to test and to read.

## Making changes

- Add or update tests in `tests/` for any behavior change. Unit tests live
  next to the module they cover (e.g. `parse.test.ts`); `check.test.ts` is
  the end-to-end test against `tests/fixtures/basic`.
- Keep pull requests focused on one change. Smaller PRs are easier to review
  and merge.
- Write commit messages and PR descriptions that explain *why*, not just
  *what*.
- Update the README if you change user-facing behavior (new flags, new
  output format, etc).

## Ideas for contributions

If you're looking for something to work on:

- Support for reference-style Markdown links (`[text][ref]`)
- A `--config` file so options don't need to be repeated on the command line
- A `--fix` mode that can auto-correct simple cases (e.g. a renamed anchor)
- Support for checking links in non-Markdown files (HTML, reStructuredText)
- Caching external link results between runs
- A GitHub Action wrapper published alongside the npm package

Feel free to open an issue to discuss an idea before writing code, especially
for larger changes.

## Reporting bugs

Please include:

- The command you ran
- What you expected to happen
- What actually happened (full output, if possible)
- Your Node.js version (`node --version`)

## Code of Conduct

This project follows the [Code of Conduct](./CODE_OF_CONDUCT.md). Please read
it before participating.
