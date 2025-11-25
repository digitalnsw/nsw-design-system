export function updateStickyBodyPadding(): void;
export default function stickyContainer(): Element | null;
/**
 * Sticky container (singleton)
 * - Prefer a manually-authored container in <body>.
 * - If none exists, create one as the last child of <body>.
 * - Always expose `.js-sticky-container` and `#sticky-container` for other modules.
 * - Keep body padding in sync with the container height.
 */
export const STICKY_CLASS: "js-sticky-container";
export const STICKY_ID: "sticky-container";
