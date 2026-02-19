export default Accordion;
declare class Accordion {
    constructor(element: any);
    element: any;
    accordionHeadingClass: string;
    headings: any;
    expandAllBtn: any;
    collapseAllBtn: any;
    isExpandedOnLoad: any;
    buttons: any[];
    content: any[];
    statusElement: any;
    toggleEvent: (event: any) => void;
    expandAllEvent: (event: any) => void;
    collapseAllEvent: (event: any) => void;
    init(): void;
    setUpDom(): void;
    controls(): void;
    updateToggleButtons(): void;
    getTargetContent(element: any): any;
    setAccordionState(element: any, state: any): void;
    toggle(event: any): void;
    expandAll(event: any): void;
    collapseAll(event: any): void;
    ensureStatusElement(): any;
    announceStatus(message: any): void;
}
