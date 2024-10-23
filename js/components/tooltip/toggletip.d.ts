export default Toggletip;
declare class Toggletip {
    static isVisible(element: any): any;
    static moveFocus(element: any): void;
    static setAttributes(el: any, attrs: any): void;
    constructor(element: any);
    toggletip: any;
    toggletipId: any;
    toggletipElement: any;
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
    init(): void;
    initEvents(): void;
    toggleToggletip(): void;
    createToggletipElement(): void;
    showToggletip(): void;
    hideToggletip(): void;
    updateToggletip(toggletip: any, arrowElement: any, anchor?: any): void;
    checkToggletipClick(target: any): void;
    checkToggletipFocus(): void;
    focusToggletip(): void;
    getFocusableElements(): void;
    getFirstVisible(elements: any): void;
    getLastVisible(elements: any): void;
    trapFocus(event: any): void;
}
