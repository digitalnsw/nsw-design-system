export default Toggletip;
declare class Toggletip {
    static isVisible(element: any): any;
    static moveFocus(element: any): void;
    static setAttributes(el: any, attrs: any): void;
    constructor(element: any);
    toggletip: any;
    toggletipId: any;
    toggletipElement: any;
    toggletipContentId: string;
    toggletipContent: boolean;
    toggletipAnchor: any;
    toggletipText: any;
    toggletipHeading: any;
    arrowElement: boolean;
    closeButton: boolean;
    toggletipIsOpen: boolean;
    toggletipVisibleClass: string;
    firstFocusable: boolean;
    lastFocusable: boolean;
    handleDocumentFocusIn: (event: any) => void;
    init(): void;
    initEvents(): void;
    toggleToggletip(): void;
    createToggletipElement(): void;
    showToggletip(): void;
    hideToggletip({ returnFocus }?: {
        returnFocus?: boolean | undefined;
    }): void;
    onDocumentFocusIn(event: any): void;
    updateToggletip(toggletip: any, arrowElement: any, anchor?: any): void;
    checkToggletipClick(target: any): void;
    checkToggletipFocus(): void;
    getFocusableElements(): void;
    getFirstVisible(elements: any): void;
    getLastVisible(elements: any): void;
    trapFocus(event: any): void;
}
