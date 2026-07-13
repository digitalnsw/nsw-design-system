export default class QuickExit {
    /**
     * Enhance or create a Quick Exit inside the sticky container
     */
    static init({ safeUrl, enableEsc, enableCloak, focusFirst, }?: {
        safeUrl?: string | undefined;
        enableEsc?: boolean | undefined;
        enableCloak?: boolean | undefined;
        focusFirst?: boolean | undefined;
    }): void;
    /**
     * Build minimal, no-JS friendly markup
     */
    static buildMarkup({ enableEsc, safeUrl, }: {
        enableEsc: any;
        safeUrl: any;
    }): HTMLAnchorElement;
    static buildKeyboardHint(id?: string): HTMLSpanElement;
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
    static ensureSrOnlyMessage(enableEsc?: boolean): void;
    static updatePageTitle(): void;
    static applyCloak(): void;
    static focusFirst(node: any): void;
    static getOptionsFromElement(root: any): {
        safeUrl: any;
        enableEsc: any;
        enableCloak: any;
    };
    /**
     * Enhance any existing server-rendered Quick Exit elements.
     */
    static autoInit(): void;
}
