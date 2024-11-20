export default Breadcrumbs;
declare class Breadcrumbs {
    static createElement(tag: any, classes?: any[], attributes?: {}): any;
    constructor(element: any);
    element: any;
    allBreadcrumbs: any;
    secondBreadcrumb: any;
    condition: boolean;
    init(): void;
    createToggle(): void;
}
