# NSW Design System LLM Guide Bundle

Package: nsw-design-system@3.24.5

Use this file when you want a single-file import into an LLM.

## Included Guides
1. NSW DS Core Principles (LLM Guide) (`core/principles.md`)
2. NSW DS Core Colour System and Patterns (LLM Guide) (`core/colour-and-patterns.md`)
3. NSW DS Typography and Layout (LLM Guide) (`core/typography-and-layout.md`)
4. NSW DS Accessibility (LLM Guide) (`core/accessibility.md`)
5. NSW Design System: Charts and Graphs (LLM Guide) (`domains/charts-and-graphs.md`)

---

## 1. NSW DS Core Principles (LLM Guide)

Source: `core/principles.md`

# NSW DS Core Principles (LLM Guide)

This file defines cross-domain principles for generating NSW Design System outputs.

## Goal

- Maximise comprehension speed for end users.
- Preserve accessibility and compliance by default.
- Prefer stable, repeatable patterns over one-off styling.

## Rule Priority

When rules conflict, follow this order:

1. Accessibility and legal compliance.
2. User task clarity and data integrity.
3. NSW visual language consistency.
4. Visual enhancement and stylistic variation.

## Authoring Standards

- Use plain language and explicit units.
- Include timeframe/context for quantitative content.
- Avoid decorative complexity that does not improve comprehension.
- Use deterministic defaults so output is reproducible.

## Output Requirements for LLMs

- State recommendation first.
- Include one concise rationale.
- Include one key risk or anti-pattern to avoid.
- If code is generated, include complete runnable config sections.

## Related Core Guides

- [Colour and patterns](./colour-and-patterns.md)
- [Typography and layout](./typography-and-layout.md)
- [Accessibility](./accessibility.md)

## 2. NSW DS Core Colour System and Patterns (LLM Guide)

Source: `core/colour-and-patterns.md`

# NSW DS Core Colour System and Patterns (LLM Guide)

Use this file as the universal colour/theming source for NSW Design System outputs.

Authoritative sources in this repo:

- `src/global/scss/settings/_theme.scss` (theme variables and semantic/status colours)
- `src/docs/chart-utilities.js` (complete token-to-hex lookup maps used in docs/examples)

## Usage Rules

- Use CSS variables first (`--nsw-*` / `--nsw-palette-*`) and use hex values as fallback/reference.
- Do not invent ad-hoc colours when an NSW token exists.
- Keep colour usage semantically meaningful and consistent across components.

## NSW Palette (Full Set)

| Token key | CSS variable | Hex |
|---|---|---|
| `blue01` | `--nsw-palette-blue-01` | `#002664` |
| `blue02` | `--nsw-palette-blue-02` | `#146cfd` |
| `blue03` | `--nsw-palette-blue-03` | `#8ce0ff` |
| `blue04` | `--nsw-palette-blue-04` | `#cbedfd` |
| `purple01` | `--nsw-palette-purple-01` | `#441170` |
| `purple02` | `--nsw-palette-purple-02` | `#8055f1` |
| `purple03` | `--nsw-palette-purple-03` | `#cebfff` |
| `purple04` | `--nsw-palette-purple-04` | `#e6e1fd` |
| `fuchsia01` | `--nsw-palette-fuchsia-01` | `#65004d` |
| `fuchsia02` | `--nsw-palette-fuchsia-02` | `#d912ae` |
| `fuchsia03` | `--nsw-palette-fuchsia-03` | `#f4b5e6` |
| `fuchsia04` | `--nsw-palette-fuchsia-04` | `#fddef2` |
| `red01` | `--nsw-palette-red-01` | `#630019` |
| `red02` | `--nsw-palette-red-02` | `#d7153a` |
| `red03` | `--nsw-palette-red-03` | `#ffb8c1` |
| `red04` | `--nsw-palette-red-04` | `#ffe6ea` |
| `orange01` | `--nsw-palette-orange-01` | `#941b00` |
| `orange02` | `--nsw-palette-orange-02` | `#f3631b` |
| `orange03` | `--nsw-palette-orange-03` | `#ffce99` |
| `orange04` | `--nsw-palette-orange-04` | `#fdeddf` |
| `brown01` | `--nsw-palette-brown-01` | `#523719` |
| `brown02` | `--nsw-palette-brown-02` | `#b68d5d` |
| `brown03` | `--nsw-palette-brown-03` | `#e8d0b5` |
| `brown04` | `--nsw-palette-brown-04` | `#ede3d7` |
| `yellow01` | `--nsw-palette-yellow-01` | `#694800` |
| `yellow02` | `--nsw-palette-yellow-02` | `#faaf05` |
| `yellow03` | `--nsw-palette-yellow-03` | `#fde79a` |
| `yellow04` | `--nsw-palette-yellow-04` | `#fff4cf` |
| `green01` | `--nsw-palette-green-01` | `#004000` |
| `green02` | `--nsw-palette-green-02` | `#00aa45` |
| `green03` | `--nsw-palette-green-03` | `#a8edb3` |
| `green04` | `--nsw-palette-green-04` | `#dbfadf` |
| `teal01` | `--nsw-palette-teal-01` | `#0b3f47` |
| `teal02` | `--nsw-palette-teal-02` | `#2e808e` |
| `teal03` | `--nsw-palette-teal-03` | `#8cdbe5` |
| `teal04` | `--nsw-palette-teal-04` | `#d1eeea` |
| `black` | `--nsw-palette-black` | `#000000` |
| `grey01` | `--nsw-palette-grey-01` | `#22272b` |
| `grey02` | `--nsw-palette-grey-02` | `#495054` |
| `grey03` | `--nsw-palette-grey-03` | `#cdd3d6` |
| `grey04` | `--nsw-palette-grey-04` | `#ebebeb` |
| `offWhite` | `--nsw-palette-off-white` | `#f2f2f2` |
| `white` | `--nsw-palette-white` | `#ffffff` |

## NSW Aboriginal Palette (Full Set)

| Token key | CSS variable | Hex |
|---|---|---|
| `earthRed` | `--nsw-aboriginal-palette-earth-red` | `#950906` |
| `emberRed` | `--nsw-aboriginal-palette-ember-red` | `#e1261c` |
| `coralPink` | `--nsw-aboriginal-palette-coral-pink` | `#fbb4b3` |
| `galahPink` | `--nsw-aboriginal-palette-galah-pink` | `#fdd9d9` |
| `deepOrange` | `--nsw-aboriginal-palette-deep-orange` | `#882600` |
| `orangeOchre` | `--nsw-aboriginal-palette-orange-ochre` | `#ee6314` |
| `clayOrange` | `--nsw-aboriginal-palette-clay-orange` | `#f4aa7d` |
| `sunsetOrange` | `--nsw-aboriginal-palette-sunset-orange` | `#f9d4be` |
| `bushHoneyYellow` | `--nsw-aboriginal-palette-bush-honey-yellow` | `#895e00` |
| `sandstoneYellow` | `--nsw-aboriginal-palette-sandstone-yellow` | `#fea927` |
| `goldenWattleYellow` | `--nsw-aboriginal-palette-golden-wattle-yellow` | `#fee48c` |
| `sunbeamYellow` | `--nsw-aboriginal-palette-sunbeam-yellow` | `#fff1c5` |
| `riverbedBrown` | `--nsw-aboriginal-palette-riverbed-brown` | `#552105` |
| `firewoodBrown` | `--nsw-aboriginal-palette-firewood-brown` | `#9e5332` |
| `claystoneBrown` | `--nsw-aboriginal-palette-claystone-brown` | `#d39165` |
| `macadamiaBrown` | `--nsw-aboriginal-palette-macadamia-brown` | `#e9c8b2` |
| `charcoalGrey` | `--nsw-aboriginal-palette-charcoal-grey` | `#272727` |
| `emuGrey` | `--nsw-aboriginal-palette-emu-grey` | `#555555` |
| `ashGrey` | `--nsw-aboriginal-palette-ash-grey` | `#ccc6c2` |
| `smokeGrey` | `--nsw-aboriginal-palette-smoke-grey` | `#e5e3e0` |
| `bushlandGreen` | `--nsw-aboriginal-palette-bushland-green` | `#215834` |
| `marshlandLime` | `--nsw-aboriginal-palette-marshland-lime` | `#78a146` |
| `gumleafGreen` | `--nsw-aboriginal-palette-gumleaf-green` | `#b5cda4` |
| `saltbushGreen` | `--nsw-aboriginal-palette-saltbush-green` | `#dae6d1` |
| `billabongBlue` | `--nsw-aboriginal-palette-billabong-blue` | `#00405e` |
| `saltwaterBlue` | `--nsw-aboriginal-palette-saltwater-blue` | `#0d6791` |
| `lightWaterBlue` | `--nsw-aboriginal-palette-light-water-blue` | `#84c5d1` |
| `coastalBlue` | `--nsw-aboriginal-palette-coastal-blue` | `#c1e2e8` |
| `bushPlum` | `--nsw-aboriginal-palette-bush-plum` | `#472642` |
| `spiritLilac` | `--nsw-aboriginal-palette-spirit-lilac` | `#9a5e93` |
| `lilliPilliPurple` | `--nsw-aboriginal-palette-lilli-pilli-purple` | `#c99ac2` |
| `duskPurple` | `--nsw-aboriginal-palette-dusk-purple` | `#e4cce0` |
| `black` | `--nsw-aboriginal-palette-black` | `#000000` |
| `offWhite` | `--nsw-aboriginal-palette-off-white` | `#f2f2f2` |
| `white` | `--nsw-aboriginal-palette-white` | `#ffffff` |

## Semantic Status Colours

| Token | CSS variable | Hex |
|---|---|---|
| `success` | `--nsw-status-success` | `#008a07` |
| `success-bg` | `--nsw-status-success-bg` | `#e5f6e6` |
| `info` | `--nsw-status-info` | `#2e5299` |
| `info-bg` | `--nsw-status-info-bg` | `#eaedf4` |
| `warning` | `--nsw-status-warning` | `#c95000` |
| `warning-bg` | `--nsw-status-warning-bg` | `#fbeee5` |
| `error` | `--nsw-status-error` | `#b81237` |
| `error-bg` | `--nsw-status-error-bg` | `#f7e7eb` |

## Pattern Principles

- Use patterning as a secondary channel where colour alone may fail.
- Ensure pattern stroke/ink has sufficient contrast against base fill.
- Keep pattern selection consistent and limited within one UI context.
- Preserve readability first; remove pattern complexity if it harms legibility.

## Do Not

- Do not rely on colour alone to convey critical meaning.
- Do not use low-contrast combinations for text or key state cues.
- Do not define one-off hex colours that bypass NSW token sets.

## 3. NSW DS Typography and Layout (LLM Guide)

Source: `core/typography-and-layout.md`

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

## 4. NSW DS Accessibility (LLM Guide)

Source: `core/accessibility.md`

# NSW DS Accessibility (LLM Guide)

Use this file for universal accessibility requirements across NSW Design System outputs.

## Core Requirements

- Build to WCAG 2.2 AA as baseline.
- Use semantic HTML first; add ARIA only when native semantics are insufficient.
- Ensure all functionality is keyboard accessible.
- Ensure visible focus indicators are present and not removed.
- Ensure interface and content remain usable at 200% zoom.

## Contrast and Colour

- Normal text must meet `4.5:1` contrast minimum.
- Large text and essential UI graphics must meet `3:1` contrast minimum.
- Do not rely on colour alone to communicate status, category, or required action.
- Provide a secondary cue when needed (icon, text label, pattern, shape, or position).

## Content and Language

- Use clear headings, descriptive link text, and predictable structure.
- Keep labels, helper text, and error messages explicit and actionable.
- Provide text alternatives for non-text content.

## Forms and Validation

- Associate labels with controls programmatically.
- Announce errors clearly and place them near relevant fields.
- Include instructions for required format and constraints before input where possible.

## Motion and Interaction

- Avoid unnecessary motion that can distract or trigger vestibular issues.
- Respect reduced-motion preferences where animation is used.
- Ensure interactive targets are large enough and have clear states.

## LLM Output Requirement

When generating code or guidance:

- Include at least one explicit accessibility consideration.
- State the non-colour fallback for any colour-based meaning.
- Call out any known accessibility tradeoff if exact compliance cannot be guaranteed.

## 5. NSW Design System: Charts and Graphs (LLM Guide)

Source: `domains/charts-and-graphs.md`

# NSW Design System: Charts and Graphs (LLM Guide)

Use this file for chart-specific rules. For shared rules, link to:

- [Core principles](../core/principles.md)
- [Colour and patterns](../core/colour-and-patterns.md)
- [Typography and layout](../core/typography-and-layout.md)
- [Accessibility](../core/accessibility.md)

## About this guidance

This guidance helps teams choose and design charts and graphs that communicate data clearly and consistently across NSW digital products.

It covers common chart types used in services and dashboards, including bar charts, line charts, scatter plots and similar formats. The guidance is tool-agnostic and applies regardless of charting library or platform.

It sets shared principles for clarity, accessibility and consistency rather than prescribing exact implementation. Teams using custom visualisation tools such as D3 should apply the same principles to ensure charts remain understandable and accessible.

## Out of scope

- Expressive infographics designed for campaigns or marketing
- Advanced analytical visualisations such as network graphs or complex relationship mapping
- Interactive GIS mapping
- Highly specialised investigative tools built for internal compliance work

These use cases may require bespoke design and technical decisions beyond the scope of the design system. Future guidance may expand to cover additional visualisation types as needs mature.

## Chart Selection Rules

- Use `bar`/`column` for category comparison.
- Use `line`/`multi-line` for trends over time.
- Use `stacked bar`/`stacked area` only when part-to-whole over time is the task.
- Use `pie`/`doughnut` only for simple proportions with few categories.
- Limit pie/doughnut slices to 2 to 4 where possible.
- If category values are close or numerous, switch to a bar chart.

## Pie and Doughnut Labelling Rules

- Default to direct labels (leader line + category + percent) for production examples.
- Keep labels outside slices and avoid overlap with title area.
- Keep direct label padding moderate so charts are not horizontally compressed.
- Use legend-based labelling only when direct labels are not feasible.
- Exception: the intentionally "wrong example" should keep legend-based labelling to demonstrate the anti-pattern.

## Required Colour Values (Tokens + Hex)

Primary categorical set for common chart series:

| Token | Hex |
|---|---|
| `blue01` | `#002664` |
| `blue02` | `#146cfd` |
| `purple01` | `#441170` |
| `purple02` | `#8055f1` |
| `fuchsia01` | `#65004d` |
| `fuchsia02` | `#d912ae` |
| `red01` | `#630019` |
| `red02` | `#d7153a` |
| `orange01` | `#941b00` |
| `orange02` | `#f3631b` |
| `teal01` | `#0b3f47` |
| `teal02` | `#2e808e` |

Support tokens:

- Text high contrast: `grey01` `#22272b`
- Secondary text/leader lines: `grey02` `#495054`
- Grid/borders: `grey03` `#cdd3d6`
- Canvas background: `white` `#ffffff`
- Optional surface background: `offWhite` `#f2f2f2`

Pattern swatch rule:

- Pattern swatch circles should use `blue01` (`#002664`) as the base fill for all swatches; only the pattern style should vary.

For broader token sets (including Aboriginal palette), refer to [Colour and patterns](../core/colour-and-patterns.md).

## Typography and Layout Rules

- Font family: `'Public Sans', Arial, sans-serif` for all chart text.
- Title should include context (timeframe + unit where relevant).
- All charts should reserve `24px` below title before plot area.
- Keep chart canvas background white unless demonstrating an anti-pattern.

## Accessibility Rules

- Provide meaningful canvas `aria-label` values.
- Do not rely on colour alone; use patterns, line styles, and direct labels where needed.
- Keep labels/legend text readable at 200% zoom.
- Provide a data table or text summary when exact value lookup matters.

## Baseline Chart.js Defaults

Use these baseline defaults unless a chart-specific override is required:

```js
Chart.defaults.font.family = "'Public Sans', Arial, sans-serif"
Chart.defaults.plugins.title.font = { family: "'Public Sans', Arial, sans-serif", size: 16, weight: 700 }
Chart.defaults.plugins.title.padding = { top: 8, bottom: 24 }
Chart.defaults.layout.padding = { top: 12, right: 12, bottom: 12, left: 12 }
```

Pie/doughnut defaults:

- `legend.display = false` when direct labels are enabled.
- Ensure direct-label plugin keeps labels within practical chart bounds.
- If title appears squished, reduce direct-label side reservation before changing title font size.

## Anti-Patterns to Reject

- Too many pie segments.
- Hover-only values with no text alternative.
- Non-zero/truncated bar baselines for magnitude comparison.
- Red-vs-green-only encoding.
- Dense legends that require constant eye travel.

## LLM Output Contract

When generating chart guidance/code:

- Give chart recommendation first, then one-sentence rationale.
- Include one key anti-pattern warning.
- Include explicit tokens/hex values for any proposed palette.
- Include accessibility notes.
- For code, provide complete Chart.js config sections (`type`, `data`, `options.plugins.title`, `options.plugins.legend` or direct labels, and `options.scales` where relevant).

