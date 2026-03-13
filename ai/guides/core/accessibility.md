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
