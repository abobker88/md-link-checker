import { describe, expect, it } from 'vitest';
import { Slugger, normalizeAnchor } from '../src/anchors.js';

describe('Slugger', () => {
  it('lowercases and hyphenates heading text', () => {
    const slugger = new Slugger();
    expect(slugger.slug('Getting Started')).toBe('getting-started');
  });

  it('strips punctuation but keeps underscores', () => {
    const slugger = new Slugger();
    expect(slugger.slug('FAQ: What & Why?')).toBe('faq-what-why');
    expect(slugger.slug('snake_case_heading')).toBe('snake_case_heading');
  });

  it('appends -1, -2, ... for duplicate headings', () => {
    const slugger = new Slugger();
    expect(slugger.slug('Setup')).toBe('setup');
    expect(slugger.slug('Setup')).toBe('setup-1');
    expect(slugger.slug('Setup')).toBe('setup-2');
  });

  it('tracks duplicates independently per instance', () => {
    const first = new Slugger();
    const second = new Slugger();
    expect(first.slug('Intro')).toBe('intro');
    expect(second.slug('Intro')).toBe('intro');
  });
});

describe('normalizeAnchor', () => {
  it('strips a leading # and lowercases', () => {
    expect(normalizeAnchor('#Installation')).toBe('installation');
  });

  it('decodes percent-encoded characters', () => {
    expect(normalizeAnchor('#hello%20world')).toBe('hello world');
  });
});
