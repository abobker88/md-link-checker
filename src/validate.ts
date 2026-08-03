import { promises as fs } from 'node:fs';
import path from 'node:path';
import { normalizeAnchor } from './anchors.js';
import type {
  ExternalLinkRef,
  LinkError,
  MarkdownLink,
  ParsedMarkdownFile,
} from './types.js';

const EXTERNAL_PROTOCOL_PATTERN = /^[a-z][a-z0-9+.-]*:/i;
const SKIPPED_PROTOCOLS = new Set(['mailto:', 'tel:']);

export interface ValidationResult {
  errors: LinkError[];
  externalLinks: ExternalLinkRef[];
  linksChecked: number;
}

/**
 * Validates every link in `files` against the filesystem and, for Markdown
 * targets, against known headings. External http(s) links are not resolved
 * here — they're returned in `externalLinks` for the caller to check.
 */
export async function validateFiles(
  files: ParsedMarkdownFile[],
  markdownExtensions: string[]
): Promise<ValidationResult> {
  const byPath = new Map(files.map((file) => [path.resolve(file.filePath), file]));
  const errors: LinkError[] = [];
  const externalLinks: ExternalLinkRef[] = [];
  let linksChecked = 0;

  for (const file of files) {
    for (const link of file.links) {
      linksChecked += 1;
      const result = await validateLink(link, file, byPath, markdownExtensions);
      if (result.error) {
        errors.push(result.error);
      }
      if (result.external) {
        externalLinks.push(result.external);
      }
    }
  }

  return { errors, externalLinks, linksChecked };
}

async function validateLink(
  link: MarkdownLink,
  file: ParsedMarkdownFile,
  byPath: Map<string, ParsedMarkdownFile>,
  markdownExtensions: string[]
): Promise<{ error?: LinkError; external?: ExternalLinkRef }> {
  const target = link.target.trim();

  if (!target) {
    return {};
  }

  const protocolMatch = target.match(EXTERNAL_PROTOCOL_PATTERN);
  if (protocolMatch) {
    const protocol = protocolMatch[0].toLowerCase();
    if (protocol === 'http:' || protocol === 'https:') {
      return { external: { url: target, filePath: file.filePath, line: link.line, column: link.column } };
    }
    if (SKIPPED_PROTOCOLS.has(protocol)) {
      return {};
    }
    // Unknown protocol (e.g. ftp:, data:) — not something we can validate locally.
    return {};
  }

  // Same-file anchor, e.g. "#installation".
  if (target.startsWith('#')) {
    const anchor = normalizeAnchor(target);
    const found = file.headings.some((heading) => heading.slug === anchor);
    if (!found) {
      return {
        error: makeError(link, file.filePath, 'invalid-anchor', `Anchor "${target}" not found in this file`),
      };
    }
    return {};
  }

  // Local file link, optionally with an anchor: "./guide.md#setup".
  const hashIndex = target.indexOf('#');
  const rawPath = hashIndex === -1 ? target : target.slice(0, hashIndex);
  const anchor = hashIndex === -1 ? null : target.slice(hashIndex + 1);
  const decodedPath = safeDecode(rawPath);
  const resolvedPath = path.resolve(path.dirname(file.filePath), decodedPath);

  const exists = await fileExists(resolvedPath);
  if (!exists) {
    return {
      error: makeError(link, file.filePath, 'missing-file', `File not found: ${rawPath}`),
    };
  }

  if (anchor === null) {
    return {};
  }

  const isMarkdown = markdownExtensions.includes(path.extname(resolvedPath));
  if (!isMarkdown) {
    return {};
  }

  const targetFile = byPath.get(resolvedPath);
  const headings = targetFile ? targetFile.headings : (await parseHeadingsFallback(resolvedPath));
  const normalizedAnchor = normalizeAnchor(anchor);
  const found = headings.some((heading) => heading.slug === normalizedAnchor);
  if (!found) {
    return {
      error: makeError(
        link,
        file.filePath,
        'invalid-anchor',
        `Anchor "#${anchor}" not found in ${path.relative(path.dirname(file.filePath), resolvedPath) || rawPath}`
      ),
    };
  }

  return {};
}

/** Parses headings for a linked file that fell outside the scanned set (e.g. via --ignore). */
async function parseHeadingsFallback(resolvedPath: string) {
  const { parseMarkdownFile } = await import('./parse.js');
  try {
    const parsed = await parseMarkdownFile(resolvedPath);
    return parsed.headings;
  } catch {
    return [];
  }
}

function makeError(
  link: MarkdownLink,
  filePath: string,
  category: LinkError['category'],
  message: string
): LinkError {
  return {
    filePath,
    line: link.line,
    column: link.column,
    target: link.target,
    category,
    message,
  };
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
