import path from 'node:path';
import chalk from 'chalk';
import type { CheckSummary, ErrorCategory, LinkError } from './types.js';

const CATEGORY_LABELS: Record<ErrorCategory, string> = {
  'missing-file': 'missing file',
  'invalid-anchor': 'invalid anchor',
  'unreachable-url': 'unreachable URL',
};

/** Renders a colored, human-readable report grouped by file. */
export function formatText(summary: CheckSummary, rootDir: string): string {
  const lines: string[] = [];

  if (summary.errors.length === 0) {
    lines.push(chalk.green(`✔ No broken links found in ${summary.filesScanned} file(s).`));
  } else {
    const byFile = groupByFile(summary.errors);
    for (const [filePath, errors] of byFile) {
      lines.push(chalk.underline(path.relative(rootDir, filePath) || filePath));
      for (const error of errors) {
        lines.push(formatErrorLine(error));
      }
      lines.push('');
    }
  }

  lines.push(formatSummaryLine(summary));
  return lines.join('\n');
}

function formatErrorLine(error: LinkError): string {
  const location = chalk.dim(`${error.line}:${error.column}`);
  const category = chalk.red(`[${CATEGORY_LABELS[error.category]}]`);
  return `  ${location}  ${category}  ${error.message}`;
}

function formatSummaryLine(summary: CheckSummary): string {
  const parts = [
    `${summary.filesScanned} file(s) scanned`,
    `${summary.linksChecked} link(s) checked`,
  ];
  if (summary.externalLinksChecked > 0) {
    parts.push(`${summary.externalLinksChecked} external link(s) checked`);
  }
  parts.push(`${summary.durationMs}ms`);

  const status =
    summary.errors.length === 0
      ? chalk.green('PASS')
      : chalk.red(`FAIL — ${summary.errors.length} error(s)`);

  return `${status}  (${parts.join(', ')})`;
}

function groupByFile(errors: LinkError[]): [string, LinkError[]][] {
  const map = new Map<string, LinkError[]>();
  for (const error of errors) {
    const list = map.get(error.filePath) ?? [];
    list.push(error);
    map.set(error.filePath, list);
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.line - b.line || a.column - b.column);
  }
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
}

/** Renders the report as JSON, suitable for machine consumption (e.g. CI tooling). */
export function formatJson(summary: CheckSummary, rootDir: string): string {
  const payload = {
    ok: summary.errors.length === 0,
    filesScanned: summary.filesScanned,
    linksChecked: summary.linksChecked,
    externalLinksChecked: summary.externalLinksChecked,
    durationMs: summary.durationMs,
    errors: summary.errors.map((error) => ({
      ...error,
      filePath: path.relative(rootDir, error.filePath) || error.filePath,
    })),
  };
  return JSON.stringify(payload, null, 2);
}
