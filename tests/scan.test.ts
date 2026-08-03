import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { isIgnored, scanDirectory } from '../src/scan.js';

const FIXTURES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'basic');

describe('isIgnored', () => {
  it('matches a plain folder name at any depth', () => {
    expect(isIgnored('node_modules/pkg/index.md', ['node_modules'])).toBe(true);
    expect(isIgnored('src/node_modules.md', ['node_modules'])).toBe(false);
  });

  it('supports glob patterns', () => {
    expect(isIgnored('docs/draft.tmp.md', ['*.tmp.md'])).toBe(true);
    expect(isIgnored('docs/final.md', ['*.tmp.md'])).toBe(false);
  });
});

describe('scanDirectory', () => {
  it('finds markdown files and skips default-ignored folders', async () => {
    const files = await scanDirectory(FIXTURES_DIR, ['.md']);
    const relative = files.map((f) => path.relative(FIXTURES_DIR, f).split(path.sep).join('/'));

    expect(relative).toContain('index.md');
    expect(relative).toContain('guide.md');
    expect(relative).toContain('docs/setup.md');
    expect(relative).not.toContain('node_modules/ignored.md');
  });

  it('respects extra user-supplied ignore patterns', async () => {
    const files = await scanDirectory(FIXTURES_DIR, ['.md'], ['docs']);
    const relative = files.map((f) => path.relative(FIXTURES_DIR, f).split(path.sep).join('/'));
    expect(relative).not.toContain('docs/setup.md');
  });
});
