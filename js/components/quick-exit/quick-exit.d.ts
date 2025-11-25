export default class QuickExit {
    /**
     * Enhance or create a Quick Exit inside the sticky container
     */
    static init({ safeUrl, description, enableEsc, enableCloak, focusFirst, }?: {
        safeUrl?: string | undefined;
        description?: string | undefined;
        enableEsc?: boolean | undefined;
        enableCloak?: boolean | undefined;
        focusFirst?: boolean | undefined;
    }): void;
    /**
     * Build minimal, no-JS friendly markup
     */
    static buildMarkup({ description, safeUrl, }: {
        description: any;
        safeUrl: any;
    }): HTMLAnchorElement;
    /**
     * Progressive enhancement (click logic, keyboard, cloak, focus)
     */
    static enhance(root: any, { safeUrl, enableEsc, enableCloak, focusFirst, }: {
        safeUrl: any;
        enableEsc: any;
        enableCloak: any;
        focusFirst: any;
    }): void;
    static bindDoubleEsc(callback: any): void;
    static ensureSrOnlyMessage(): void;
    static applyCloak(): void;
    static focusFirst(node: any): void;
    /**
     * Enhance any existing QE in the container (no declarative parsing).
     */
    static autoInit(): void;
}
