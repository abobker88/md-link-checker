import { describe, expect, it } from 'vitest';
import { parseMarkdownContent } from '../src/parse.js';
import { validateFiles } from '../src/validate.js';

describe('validateFiles', () => {
  it('flags a same-file anchor that has no matching heading', async () => {
    const file = parseMarkdownContent(
      '/project/index.md',
      ['# Title', '[bad](#nowhere)'].join('\n')
    );
    const { errors } = await validateFiles([file], ['.md']);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ category: 'invalid-anchor', line: 2 });
  });

  it('does not flag a same-file anchor that matches a heading', async () => {
    const file = parseMarkdownContent(
      '/project/index.md',
      ['# Getting Started', '[ok](#getting-started)'].join('\n')
    );
    const { errors } = await validateFiles([file], ['.md']);
    expect(errors).toHaveLength(0);
  });

  it('queues http(s) links as external references instead of validating them locally', async () => {
    const file = parseMarkdownContent('/project/index.md', '[site](https://example.com)');
    const { errors, externalLinks } = await validateFiles([file], ['.md']);
    expect(errors).toHaveLength(0);
    expect(externalLinks).toEqual([
      { url: 'https://example.com', filePath: '/project/index.md', line: 1, column: 1 },
    ]);
  });

  it('ignores mailto and tel links', async () => {
    const file = parseMarkdownContent(
      '/project/index.md',
      ['[email](mailto:hi@example.com)', '[call](tel:+15551234567)'].join('\n')
    );
    const { errors, externalLinks } = await validateFiles([file], ['.md']);
    expect(errors).toHaveLength(0);
    expect(externalLinks).toHaveLength(0);
  });
});
