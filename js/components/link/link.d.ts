export default ExternalLink;
declare class ExternalLink {
    static setAttributes(el: any, attrs: any): void;
    constructor(element: any);
    element: any;
    uID: string;
    linkIcon: any;
    linkIconTitle: any;
    linkElement: boolean;
    init(): void;
    createElement(title: any): void;
}
