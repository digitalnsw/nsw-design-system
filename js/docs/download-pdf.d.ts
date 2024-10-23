export default DownloadPDF;
declare class DownloadPDF {
    constructor(element: any);
    element: any;
    contentClass: any;
    content: Element | null;
    name: any;
    buttonText: any;
    init(): void;
    downloadEvent(): void;
}
