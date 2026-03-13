# NSW Design System: Charts and Graphs Guide (LLM Offshoot)

Use this file as a compact, machine-friendly source of truth for generating chart guidance and Chart.js examples aligned to NSW Design System patterns.

## Scope

- Applies to the NSW Design System charts and graphs method.
- Focuses on chart selection, styling, accessibility, and implementation defaults.
- Uses Chart.js conventions already implemented in this repo.

## Priority Rules

- Prefer clarity over decoration.
- Prefer direct labels where practical.
- Keep chart text in Public Sans with Arial fallback.
- Use legends only when direct labels are not practical.
- Keep the chart canvas on white background unless a specific anti-pattern example is being shown.

## Chart Selection Rules

- Use bar/column for category comparison.
- Use line/multi-line for trends over time.
- Use stacked bar/area only when composition is the core task.
- Use pie/doughnut only for simple proportion views.
- Limit pie/doughnut slices to 2 to 4 where possible.
- If values are close, switch from pie/doughnut to bar.

## Pie and Doughnut Rules

- Use direct labels for category + percentage.
- Keep slices limited and visually distinct.
- Use pattern overlays as a redundant channel where needed.
- Keep title concise and explicit about period/unit.
- Avoid large cross-reference legends.

## Typography Rules

- Font family: `'Public Sans', Arial, sans-serif`.
- Use consistent title spacing and readable axis labels.
- Prefer loaded font weights (avoid synthetic rendering where possible).

## Colour and Pattern Rules

- Use approved NSW palette tokens.
- For patterned fills, ensure sufficient contrast.
- Keep pattern count low (typically 4 to 5 max in one chart).
- Do not rely on colour alone for categorical distinction.

## Accessibility Rules

- Provide a meaningful `aria-label` for each chart canvas.
- Ensure non-colour differentiation (patterns, labels, line styles).
- Keep labels and legend text readable at 200% zoom.
- Provide data table or textual summary where exact value reading is required.

## Title and Layout Rules

- Include a clear chart title with timeframe and unit where relevant.
- Keep consistent space below title before plot content.
- Prevent labels from overlapping the title zone.
- Do not let custom label plugins consume excessive plot width.

## Anti-Patterns to Reject

- Too many pie segments.
- Hover-only values with no text alternative.
- Truncated/non-zero bar baselines for magnitude comparison.
- Red-vs-green only encoding.
- Dense legends forcing constant eye travel.

## Implementation Defaults (Chart.js-Oriented)

- Use Chart.js default config as baseline and override per chart type only when needed.
- Keep a shared create-chart helper for consistency.
- For pie/doughnut direct-label extensions:
- Constrain labels to chart area, not full canvas.
- Keep reserved side padding moderate and configurable.
- Keep title options explicit (`fullSize`, `align`, `font`, `padding`).

## LLM Output Contract

When generating chart guidance or code:

- Output recommendation first (chart type + reason).
- Include accessibility notes explicitly.
- Include one "why not" warning for a plausible wrong chart type.
- For code, output complete Chart.js config snippets with:
- `type`
- `data.labels`
- `data.datasets`
- `options.plugins.title`
- `options.plugins.legend` or direct labels strategy
- `options.scales` where relevant

## Maintenance Note

- Keep this file scoped to charts only.
- If additional method offshoots are created, store them under `ai/guides/` with one file per method domain.
