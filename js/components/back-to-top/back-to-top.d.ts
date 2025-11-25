export default BackTop;
declare class BackTop {
    static createElement(tag: any, classes?: any[], attributes?: {}): any;
    constructor(element: any);
    element: any;
    dataElement: any;
    scrollOffset: any;
    text: boolean;
    icon: boolean;
    scrollElement: any;
    scrollPosition: number;
    width: number;
    height: number;
    condition: boolean;
    stickyObserver: ResizeObserver | null;
    bottomGap: number;
    init(): void;
    createButton(): void;
    createButtonContent(): void;
    updateBottomOffset(): void;
    checkBackToTop(): void;
    resizeHandler(): void;
    debounce(fn: any, wait?: number): (...args: any[]) => void;
}
