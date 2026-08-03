/**
 * Generates GitHub-style heading slugs. GitHub lowercases the heading,
 * strips punctuation (keeping letters, numbers, spaces, hyphens and
 * underscores), turns spaces into hyphens, and appends "-1", "-2", ...
 * to duplicate slugs within the same file.
 */
export class Slugger {
  private readonly seen = new Map<string, number>();

  slug(text: string): string {
    const base = Slugger.slugify(text);
    const count = this.seen.get(base) ?? 0;
    this.seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  }

  reset(): void {
    this.seen.clear();
  }

  static slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}\s_-]/gu, '')
      .replace(/\s+/g, '-');
  }
}

/** Normalizes an anchor fragment (from a URL/link target) for comparison. */
export function normalizeAnchor(anchor: string): string {
  return decodeURIComponent(anchor.replace(/^#/, '')).toLowerCase();
}
