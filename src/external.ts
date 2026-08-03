import type { ExternalLinkRef, LinkError } from './types.js';

export interface ExternalCheckOptions {
  timeoutMs: number;
  concurrency: number;
}

/**
 * Checks a list of external (http/https) links by issuing a request to each
 * and treating non-2xx/3xx responses, timeouts, or network errors as broken.
 * Runs up to `concurrency` requests at a time.
 */
export async function checkExternalLinks(
  links: ExternalLinkRef[],
  options: ExternalCheckOptions
): Promise<LinkError[]> {
  const errors: LinkError[] = [];
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < links.length) {
      const link = links[cursor];
      cursor += 1;
      const error = await checkOne(link, options.timeoutMs);
      if (error) {
        errors.push(error);
      }
    }
  }

  const workerCount = Math.max(1, Math.min(options.concurrency, links.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));

  return errors;
}

async function checkOne(link: ExternalLinkRef, timeoutMs: number): Promise<LinkError | null> {
  const attempt = async (method: 'HEAD' | 'GET'): Promise<Response> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(link.url, { method, signal: controller.signal, redirect: 'follow' });
    } finally {
      clearTimeout(timeout);
    }
  };

  try {
    let response = await attempt('HEAD');
    // Some servers don't support HEAD (405/501) — retry with GET before giving up.
    if (response.status === 405 || response.status === 501) {
      response = await attempt('GET');
    }
    if (!response.ok) {
      return makeError(link, `Received HTTP ${response.status} ${response.statusText}`.trim());
    }
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return makeError(link, `Request failed: ${message}`);
  }
}

function makeError(link: ExternalLinkRef, message: string): LinkError {
  return {
    filePath: link.filePath,
    line: link.line,
    column: link.column,
    target: link.url,
    category: 'unreachable-url',
    message,
  };
}
