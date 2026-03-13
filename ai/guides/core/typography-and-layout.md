# NSW DS Typography and Layout (LLM Guide)

Use this file for universal type, spacing, and layout rules across all NSW Design System outputs.

Authoritative sources in this repo:

- `src/global/scss/settings/_theme.scss`
- `src/core/typography/index.hbs`
- `src/core/layout/index.hbs`
- `src/docs/content/utilities/spacing.hbs`

## Typography Defaults

- Primary font family: `'Public Sans', Arial, sans-serif`.
- Base font size: `16px` (`--nsw-font-size`).
- Base line-height: `1.5` (`--nsw-line-height`).
- Primary weights: `400` (`--nsw-font-normal`) and `700` (`--nsw-font-bold`).

## Type Scale Tokens

| Size token | Mobile | Desktop |
|---|---|---|
| `xxs` | `12px` | `12px` |
| `xs` | `14px` | `14px` |
| `sm` | `16px` | `16px` |
| `md` | `18px` | `20px` |
| `lg` | `22px` | `24px` |
| `xl` | `28px` | `32px` |
| `xxl` | `36px` | `48px` |

## Typography Rules

- Use Public Sans for headings and body copy.
- Prefer tokenised sizes over hard-coded pixel values.
- Keep heading/body hierarchy consistent and predictable.
- Include Arial fallback wherever font family is declared.

## Layout and Spacing Rules

- Use an `8px` spacing grid for consistent rhythm.
- Use spacing tokens (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`) instead of arbitrary spacing.
- Keep container width aligned to `1200px` (`--nsw-container-width`) unless a component spec says otherwise.
- Maintain consistent vertical spacing between headings, content blocks, and actions.

## LLM Output Requirement

When generating examples:

- Reference NSW tokens first (font, size, spacing, container).
- Avoid hard-coded one-off sizing unless the task explicitly requires it.
- State any intentional deviation from the core type/spacing system.
