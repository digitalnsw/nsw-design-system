export default CookieConsent;
declare class CookieConsent {
    static cleanupDefaultCookieUI(): void;
    static mapToVanillaCookieConsentConfig(config: any): any;
    constructor(config?: null);
    isInit: boolean;
    config: any;
    consentBannerElement: Element | null;
    preferencesDialogElement: Element | null;
    consentBannerConfirmationMessage: string | undefined;
    consentSelectionMade: boolean | undefined;
    createPreferencesDialog(): void;
    dialogInstance: any;
    createConsentBanner(): void;
    init(): void;
    initElements(): void;
    cookieInputContainer: Element | null | undefined;
    allCookieInputs: never[] | NodeListOf<Element> | undefined;
    acceptSelectionButton: Element | null | undefined;
    acceptAllButton: Element | null | undefined;
    rejectAllButton: Element | null | undefined;
    initAPI(): void;
    attachEventListeners(): void;
    loadUserPreferences(): void;
    handleConsentAction(action: any): void;
    showConfirmationMessage(): void;
    showConsentBanner(): void;
    hideConsentBanner(): void;
}
