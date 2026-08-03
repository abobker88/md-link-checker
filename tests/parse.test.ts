import { describe, expect, it } from 'vitest';
import { parseMarkdownContent } from '../src/parse.js';

describe('parseMarkdownContent', () => {
  it('extracts links and images with line/column info', () => {
    const content = ['# Title', '', 'See [docs](./docs.md) and ![alt](./img.png).'].join('\n');
    const { links } = parseMarkdownContent('test.md', content);

    expect(links).toHaveLength(2);
    expect(links[0]).toMatchObject({ target: './docs.md', text: 'docs', isImage: false, line: 3 });
    expect(links[1]).toMatchObject({ target: './img.png', text: 'alt', isImage: true, line: 3 });
  });

  it('extracts headings with GitHub-style slugs', () => {
    const content = ['# Getting Started', '', '## Installation Steps'].join('\n');
    const { headings } = parseMarkdownContent('test.md', content);

    expect(headings).toEqual([
      { text: 'Getting Started', slug: 'getting-started', line: 1, depth: 1 },
      { text: 'Installation Steps', slug: 'installation-steps', line: 3, depth: 2 },
    ]);
  });

  it('ignores links inside fenced code blocks', () => {
    const content = ['# Title', '', '```md', '[not a link](./nope.md)', '```', ''].join('\n');
    const { links } = parseMarkdownContent('test.md', content);
    expect(links).toHaveLength(0);
  });

  it('ignores links inside inline code spans', () => {
    const content = 'Use `[fake](./nope.md)` in your code.';
    const { links } = parseMarkdownContent('test.md', content);
    expect(links).toHaveLength(0);
  });

  it('supports links with titles and angle-bracket targets', () => {
    const content = '[Docs](<./docs.md> "the docs")';
    const { links } = parseMarkdownContent('test.md', content);
    expect(links[0]?.target).toBe('./docs.md');
  });

  it('handles ~~~ fences the same as backtick fences', () => {
    const content = ['~~~', '[not a link](./nope.md)', '~~~'].join('\n');
    const { links } = parseMarkdownContent('test.md', content);
    expect(links).toHaveLength(0);
  });
});
