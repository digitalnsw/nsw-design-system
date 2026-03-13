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
