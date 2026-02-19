export default Tooltip;
declare class Tooltip {
    static setAttributes(el: any, attrs: any): void;
    constructor(element: any);
    tooltip: any;
    uID: string;
    tooltipElement: boolean;
    arrowElement: boolean;
    tooltipContent: boolean;
    tooltipDelay: number;
    screenSize: boolean;
    tooltipTheme: any;
    showTimeout: number | null;
    hideTimeout: number | null;
    initialDescribedBy: any;
    describedByAdded: boolean;
    init(): void;
    handleEvent(event: any): void;
    handleKeydown(event: any): void;
    createTooltipElement(): void;
    showTooltip(): void;
    hideTooltip({ immediate }?: {
        immediate?: boolean | undefined;
    }): void;
    matchMedia(): void;
    updateTooltip(tooltip: any, arrowElement: any, anchor?: any): void;
}
