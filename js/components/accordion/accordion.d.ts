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
    toggleEvent: (event: any) => void;
    expandAllEvent: (event: any) => void;
    collapseAllEvent: (event: any) => void;
    init(): void;
    setUpDom(): void;
    controls(): void;
    getTargetContent(element: any): any;
    setAccordionState(element: any, state: any): void;
    toggle(event: any): void;
    expandAll(): void;
    collapseAll(): void;
}
