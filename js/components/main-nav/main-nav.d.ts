export default Navigation;
declare class Navigation {
    constructor(element: any);
    nav: any;
    navID: any;
    openNavButton: Element | null;
    closeNavButtons: any;
    closeSubNavButtons: any;
    isMegaMenuElement: any;
    mainNavIsOpen: boolean;
    transitionEvent: any;
    mobileShowMainTransitionEndEvent: (e: any) => void;
    mobileHideMainTransitionEndEvent: (e: any) => void;
    showSubNavTransitionEndEvent: (e: any) => void;
    mobileTrapTabKeyEvent: (e: any) => void;
    mobileSubNavTrapTabKeyEvent: (e: any) => void;
    desktopButtonClickEvent: (e: any) => void;
    desktopButtonKeydownEvent: (e: any) => void;
    checkFocusEvent: (e: any) => void;
    openSubNavElements: any[];
    breakpoint: MediaQueryList;
    init(): void;
    initEvents(): void;
    responsiveCheck(event: any): void;
    handleOutsideClick(event: any): void;
    tearDownNavControls(): void;
    setUpNavControls(listItems: any): void;
    mobileMainNavTrapTabs(e: any): void;
    mobileShowMainNav({ propertyName }: {
        propertyName: any;
    }): void;
    mobileHideMainNav({ propertyName }: {
        propertyName: any;
    }): void;
    mobileToggleMainNav(e: any): void;
    buttonClickDesktop(event: any): void;
    buttonKeydownDesktop(event: any): void;
    escapeClose(e: any): void;
    saveElements(e: any): void;
    showSubNav({ propertyName }: {
        propertyName: any;
    }): void;
    closeSubNav(): void;
    openSubNav(): void;
    toggleSubNavDesktop(): void;
    checkIfContainsFocus(e: any): void;
    whichSubNavLatest(): any;
    trapkeyEventStuff(e: any): void;
}
