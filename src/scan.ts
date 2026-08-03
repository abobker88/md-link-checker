import { promises as fs } from 'node:fs';
import path from 'node:path';
import { minimatch } from 'minimatch';

/** Folders/files that are always skipped, on top of any user-supplied patterns. */
export const DEFAULT_IGNORE_PATTERNS = ['node_modules', '.git', 'dist', 'build', 'coverage'];

/**
 * Returns true if `relativePath` (posix-style, relative to the scan root)
 * matches any of the given glob-style ignore patterns.
 */
export function isIgnored(relativePath: string, patterns: string[]): boolean {
  const segments = relativePath.split('/');
  const basename = segments[segments.length - 1];

  return patterns.some((pattern) => {
    if (pattern.includes('/')) {
      return minimatch(relativePath, pattern, { dot: true });
    }
    // A pattern with no slash can match any path segment (e.g. "node_modules"
    // ignores "a/node_modules/b.md") or the file's basename (e.g. "*.tmp.md").
    return segments.includes(pattern) || minimatch(basename, pattern, { dot: true });
  });
}

/**
 * Recursively walks `rootDir` and returns absolute paths to every file whose
 * extension is in `extensions`, skipping anything matched by `ignorePatterns`.
 */
export async function scanDirectory(
  rootDir: string,
  extensions: string[],
  ignorePatterns: string[] = []
): Promise<string[]> {
  const allPatterns = [...DEFAULT_IGNORE_PATTERNS, ...ignorePatterns];
  const absoluteRoot = path.resolve(rootDir);
  const results: string[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(absoluteRoot, fullPath).split(path.sep).join('/');

      if (isIgnored(relativePath, allPatterns)) {
        continue;
      }

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
        results.push(fullPath);
      }
    }
  }

  await walk(absoluteRoot);
  return results.sort();
}
