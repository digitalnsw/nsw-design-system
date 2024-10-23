export default ColorSwatches;
declare class ColorSwatches {
    constructor(element: any, opts: any);
    element: any;
    options: any;
    target: NodeListOf<any>;
    selectedClass: string;
    select: boolean;
    list: boolean;
    swatches: boolean;
    labels: boolean;
    selectedLabel: boolean;
    focusOutId: boolean;
    color: string;
    dataTable: Element | null;
    customAttrArray: boolean;
    init(): void;
    createColorData(): void;
    initOptions(): void;
    initCustomSelect(): void;
    initEvents(): void;
    handleHoverEvents(index: any): void;
    resetSelectedOption(target: any): void;
    resetSelectedLabel(): void;
    updateSelectedLabel(swatch: any): void;
    updateNativeSelect(value: any): void;
    getSwatchCustomAttr(swatch: any): string;
}
