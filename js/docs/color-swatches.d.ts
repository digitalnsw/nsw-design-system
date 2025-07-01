export default ColorSwatches;
declare class ColorSwatches {
    static formatLabel(text: any): any;
    constructor(element: any, config: any);
    element: any;
    variables: any;
    palettes: any;
    dataTable: Element | null;
    targetSelector: any;
    targetElement: any;
    currentPalette: string;
    currentColor: string;
    legend: any;
    swatchList: HTMLUListElement | null;
    init(): void;
    paletteSelect: any;
    createPaletteSelector(): any;
    createColorSwatches(): HTMLUListElement;
    addEventListeners(): void;
    updateSelectedSwatch(selectedSwatch: any): void;
    updateCSSVariables(): void;
    updateColorData(): void;
    updateLegend(): void;
    setPaletteFromURL(): void;
    updateURL(): void;
}
