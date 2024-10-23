export default Tabs;
declare class Tabs {
    constructor(element: any, showTab: any);
    element: any;
    tablistClass: string;
    tablistItemClass: string;
    tablistLinkClass: string;
    showTab: any;
    tabList: any;
    tabItems: any;
    allowedKeys: number[];
    tabLinks: any[];
    tabPanel: any[];
    selectedTab: any;
    clickTabEvent: (event: any) => void;
    arrowKeysEvent: (event: any) => void;
    owns: any[];
    init(): void;
    setUpDom(): void;
    enhanceTabLink(link: any, id: any): void;
    enhanceTabPanel(panel: any, id: any): void;
    setInitalTab(): void;
    clickTab(e: any): void;
    switchTabs(elem: any): void;
    arrowKeys({ which }: {
        which: any;
    }): void;
    controls(): void;
}
