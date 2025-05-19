export default SideNav;
declare class SideNav {
    constructor(element: any, index: any);
    element: any;
    index: any;
    toggleButton: any;
    sideNavContent: any;
    isOpen: boolean;
    init(): void;
    toggle(): void;
}
