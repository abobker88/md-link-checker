# Home

Welcome to the docs. See the [Guide](./guide.md#usage-notes) for details.

This link is broken: [missing page](./missing.md).

This anchor doesn't exist: [bad anchor](./guide.md#does-not-exist).

Same-file anchor that works: [back to top](#home).

Same-file anchor that's broken: [nowhere](#nowhere).

An image that exists: ![Logo](./img/logo.png)

An image that's missing: ![Broken image](./img/missing.png)

A code span should be ignored: `[not a link](./nope.md)`.

An external link (only checked with --external): [Example](https://example.com)

```md
This fenced [link](./ignored-in-fence.md) must not be checked.
```
