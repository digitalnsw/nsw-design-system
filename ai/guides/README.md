# NSW DS AI Guides

This folder contains public, package-distributed markdown guides for LLM workflows.

## Core Guides

- [Core principles](./core/principles.md)
- [Colour and patterns](./core/colour-and-patterns.md)
- [Typography and layout](./core/typography-and-layout.md)
- [Accessibility](./core/accessibility.md)

## Domain Guides

- [Charts and graphs](./domains/charts-and-graphs.md)

## Distribution

Run `npm run guides:bundle` to generate a single-file and archive package for customers.

Generated outputs:

- `ai/NSW-LLM-GUIDE.md` (single-file import for LLMs)
- `ai/manifest.json` (guide inventory and load order)
- `ai/nsw-llm-guides.zip` (all guides bundled)

## Authoring Convention

- Put reusable, cross-domain rules in `ai/guides/core/`.
- Put domain-specific guidance in `ai/guides/domains/` and reference the core files.
- Keep files concise, machine-friendly, and explicit with tokens/values where relevant.
