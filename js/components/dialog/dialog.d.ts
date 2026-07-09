export default Dialog;
declare class Dialog {
    constructor(element: any);
    element: any;
    elementWrapper: any;
    openBtn: NodeListOf<Element>;
    closeBtn: any;
    focusableEls: any;
    body: HTMLElement;
    previouslyFocusedElement: Element | null;
    openEvent: () => void;
    closeEvent: () => void;
    clickEvent: (event: any) => void;
    keydownEvent: (event: any) => void;
    init(): void;
    controls(): void;
    openDialog(): void;
    closeDialog(): void;
    clickDialog(event: any): void;
    keydownDialog(event: any): void;
    saveFocus(): void;
    restoreFocus(): void;
    trapFocus(event: any): void;
}
