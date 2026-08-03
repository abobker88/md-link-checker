import { scanDirectory } from './scan.js';
import { parseMarkdownFile } from './parse.js';
import { validateFiles } from './validate.js';
import { checkExternalLinks } from './external.js';
import type { CheckSummary, ScanOptions } from './types.js';

/** Runs a full scan + parse + validate (+ optional external check) pass. */
export async function runCheck(options: ScanOptions): Promise<CheckSummary> {
  const startedAt = Date.now();

  const filePaths = await scanDirectory(options.rootDir, options.extensions, options.ignorePatterns);
  const files = await Promise.all(filePaths.map((filePath) => parseMarkdownFile(filePath)));

  const { errors, externalLinks, linksChecked } = await validateFiles(files, options.extensions);

  let externalLinksChecked = 0;
  if (options.checkExternal && externalLinks.length > 0) {
    const externalErrors = await checkExternalLinks(externalLinks, {
      timeoutMs: options.externalTimeoutMs,
      concurrency: options.externalConcurrency,
    });
    errors.push(...externalErrors);
    externalLinksChecked = externalLinks.length;
  }

  return {
    filesScanned: files.length,
    linksChecked,
    externalLinksChecked,
    errors,
    durationMs: Date.now() - startedAt,
  };
}
