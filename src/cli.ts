#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { ArgError, HELP_TEXT, parseArgs } from './args.js';
import { runCheck } from './check.js';
import { formatJson, formatText } from './format.js';

const MARKDOWN_EXTENSIONS = ['.md', '.mdx'];

async function main(): Promise<number> {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    if (error instanceof ArgError) {
      console.error(chalk.red(`Error: ${error.message}`));
      console.error(`Run "md-link-checker --help" for usage.`);
      return 2;
    }
    throw error;
  }

  if (args.help) {
    console.log(HELP_TEXT);
    return 0;
  }

  if (args.version) {
    console.log(getVersion());
    return 0;
  }

  const rootDir = path.resolve(args.targetDir);

  const summary = await runCheck({
    rootDir,
    ignorePatterns: args.ignorePatterns,
    extensions: MARKDOWN_EXTENSIONS,
    checkExternal: args.external,
    externalTimeoutMs: args.timeoutMs,
    externalConcurrency: args.concurrency,
  });

  const output = args.json ? formatJson(summary, rootDir) : formatText(summary, rootDir);
  console.log(output);

  return summary.errors.length === 0 ? 0 : 1;
}

function getVersion(): string {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const pkgPath = path.join(dirname, '..', 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as { version: string };
  return pkg.version;
}

main()
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch((error) => {
    console.error(chalk.red('Unexpected error:'), error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
