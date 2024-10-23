export default SwipeContent;
declare class SwipeContent {
    constructor(element: any);
    element: any;
    delta: boolean[];
    dragging: boolean;
    intervalId: boolean;
    changedTouches: boolean;
    init(): void;
    initDragging(): void;
    cancelDragging(): void;
    handleEvent(event: any): void;
    startDrag(event: any): void;
    endDrag(event: any): void;
    drag(event: any): void;
    unify(event: any): any;
    emitDrag(event: any): void;
    emitSwipeEvents(eventName: any, detail: any, el: any): void;
}
