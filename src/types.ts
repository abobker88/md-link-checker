/** A single Markdown link or image reference found in a file. */
export interface MarkdownLink {
  /** The raw target as written, e.g. "./guide.md#setup" */
  target: string;
  /** The link/alt text between [ and ] */
  text: string;
  /** 1-based line number where the link appears */
  line: number;
  /** 1-based column number where the link starts */
  column: number;
  /** True for image references (![alt](target)) */
  isImage: boolean;
}

/** A Markdown heading, used to build the set of valid anchors for a file. */
export interface Heading {
  text: string;
  slug: string;
  line: number;
  depth: number;
}

/** The result of parsing a single Markdown file. */
export interface ParsedMarkdownFile {
  filePath: string;
  links: MarkdownLink[];
  headings: Heading[];
}

export type ErrorCategory = 'missing-file' | 'invalid-anchor' | 'unreachable-url';

export interface LinkError {
  filePath: string;
  line: number;
  column: number;
  target: string;
  category: ErrorCategory;
  message: string;
}

/** A reference to an external (http/https) link, queued for optional checking. */
export interface ExternalLinkRef {
  url: string;
  filePath: string;
  line: number;
  column: number;
}

export interface ScanOptions {
  /** Directory to scan, absolute or relative. */
  rootDir: string;
  /** Glob-style patterns (matched against path segments) to skip. */
  ignorePatterns: string[];
  /** File extensions to treat as Markdown, e.g. ['.md', '.mdx'] */
  extensions: string[];
  /** Whether to validate http(s) links by making a network request. */
  checkExternal: boolean;
  /** Timeout in milliseconds for each external link request. */
  externalTimeoutMs: number;
  /** Maximum number of concurrent external link requests. */
  externalConcurrency: number;
}

export interface CheckSummary {
  filesScanned: number;
  linksChecked: number;
  externalLinksChecked: number;
  errors: LinkError[];
  durationMs: number;
}
