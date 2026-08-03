import { promises as fs } from 'node:fs';
import { Slugger } from './anchors.js';
import type { Heading, MarkdownLink, ParsedMarkdownFile } from './types.js';

const LINK_PATTERN =
  /(!?)\[([^\]]*)\]\(\s*<?([^)\s>]+)>?(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g;
const HEADING_PATTERN = /^ {0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;
const FENCE_PATTERN = /^ {0,3}(```+|~~~+)/;
const INLINE_CODE_PATTERN = /`+[^`]*`+/g;

/** Reads and parses a single Markdown/MDX file, extracting links and headings. */
export async function parseMarkdownFile(filePath: string): Promise<ParsedMarkdownFile> {
  const content = await fs.readFile(filePath, 'utf8');
  return parseMarkdownContent(filePath, content);
}

/** Parses Markdown source text (exposed separately so it's easy to unit test). */
export function parseMarkdownContent(filePath: string, content: string): ParsedMarkdownFile {
  const lines = content.split(/\r\n|\r|\n/);
  const links: MarkdownLink[] = [];
  const headings: Heading[] = [];
  const slugger = new Slugger();

  let inFence = false;
  let fenceMarker = '';

  lines.forEach((rawLine, index) => {
    const fenceMatch = rawLine.match(FENCE_PATTERN);
    if (fenceMatch) {
      if (!inFence) {
        inFence = true;
        fenceMarker = fenceMatch[1][0];
      } else if (fenceMatch[1][0] === fenceMarker) {
        inFence = false;
      }
      return;
    }
    if (inFence) {
      return;
    }

    const headingMatch = rawLine.match(HEADING_PATTERN);
    if (headingMatch) {
      const text = headingMatch[2];
      headings.push({
        text,
        slug: slugger.slug(text),
        line: index + 1,
        depth: headingMatch[1].length,
      });
      return;
    }

    // Strip inline code spans so links inside `code` aren't matched.
    const line = rawLine.replace(INLINE_CODE_PATTERN, (match) => ' '.repeat(match.length));

    for (const match of line.matchAll(LINK_PATTERN)) {
      const [, bang, text, target] = match;
      links.push({
        target,
        text,
        isImage: bang === '!',
        line: index + 1,
        column: (match.index ?? 0) + 1,
      });
    }
  });

  return { filePath, links, headings };
}
