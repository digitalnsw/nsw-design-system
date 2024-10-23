export default Dialog;
declare class Dialog {
    constructor(element: any);
    element: any;
    elementWrapper: any;
    openBtn: NodeListOf<Element>;
    closeBtn: any;
    focusableEls: any;
    body: HTMLElement;
    openEvent: () => void;
    closeEvent: () => void;
    clickEvent: (event: any) => void;
    trapEvent: (event: any) => void;
    init(): void;
    controls(): void;
    openDialog(): void;
    closeDialog(): void;
    clickDialog(event: any): void;
    trapFocus(event: any): void;
}
