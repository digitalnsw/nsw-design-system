export default UtilityList;
declare class UtilityList extends Toggletip {
    constructor(element: any, toggletip?: any);
    element: any;
    share: any;
    print: any;
    download: any;
    copy: any;
    shareItems: any;
    urlLocation: string;
    copyElement: boolean;
    getSocialUrl(button: any, social: any): string;
    getSocialParams(social: any): string[] | undefined;
    socialParams: string[] | undefined;
    getTwitterText(button: any): void;
    copyToClipboard(element: any): void;
    copiedMessage(element: any): void;
}
import Toggletip from '../tooltip/toggletip';
