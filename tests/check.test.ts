import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { runCheck } from '../src/check.js';

const FIXTURES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'basic');

describe('runCheck (integration)', () => {
  it('finds exactly the expected broken links in the fixture project', async () => {
    const summary = await runCheck({
      rootDir: FIXTURES_DIR,
      ignorePatterns: [],
      extensions: ['.md', '.mdx'],
      checkExternal: false,
      externalTimeoutMs: 5000,
      externalConcurrency: 4,
    });

    expect(summary.filesScanned).toBe(3);
    expect(summary.linksChecked).toBe(9);
    expect(summary.externalLinksChecked).toBe(0);

    const categories = summary.errors.map((e) => e.category).sort();
    expect(categories).toEqual(['invalid-anchor', 'invalid-anchor', 'missing-file', 'missing-file']);

    const targets = summary.errors.map((e) => e.target).sort();
    expect(targets).toEqual(['#nowhere', './guide.md#does-not-exist', './img/missing.png', './missing.md']);
  });
});
