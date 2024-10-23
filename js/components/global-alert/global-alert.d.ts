export default GlobalAlert;
declare class GlobalAlert {
    static setCookie(name: any, value: any, days: any): void;
    static getCookie(name: any): string | null;
    constructor(element: any);
    element: any;
    closeButton: any;
    cookieName: any;
    init(): void;
    controls(): void;
    closeMessage(): void;
}
