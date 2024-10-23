export default DatePicker;
declare class DatePicker {
    static daysInMonth(year: any, month: any): number;
    static getDayOfWeek(year: any, month: any, day: any): number;
    static getReadableDate(date: any): any;
    constructor(element: any);
    element: any;
    prefix: string;
    class: string;
    uID: string;
    dateClass: string;
    todayClass: string;
    selectedClass: string;
    keyboardFocusClass: string;
    visibleClass: string;
    months: any;
    dateFormat: any;
    dateSeparator: any;
    datesDisabled: any;
    minDate: any;
    maxDate: any;
    input: any;
    trigger: any;
    triggerLabel: any;
    datePicker: any;
    body: any;
    navigation: any;
    heading: any;
    close: any;
    accept: any;
    multipleInput: any;
    dateInput: any;
    monthInput: any;
    yearInput: any;
    multiDateArray: any[];
    dateIndexes: any[];
    pickerVisible: boolean;
    dateSelected: boolean;
    selectedDay: boolean;
    selectedMonth: boolean;
    selectedYear: boolean;
    firstFocusable: boolean;
    lastFocusable: boolean;
    disabledArray: boolean;
    init(): void;
    initCreateCalendar(): void;
    initCalendarAria(): void;
    srLiveReagion: any;
    initCalendarEvents(): void;
    getCurrentDay(date: any): any;
    getCurrentMonth(date: any): any;
    getCurrentYear(date: any): any;
    getDayFromDate(date: any): any;
    getMonthFromDate(date: any): any;
    getYearFromDate(date: any): any;
    showNextMonth(bool: any): void;
    currentYear: any;
    currentMonth: any;
    currentDay: any;
    showPrevMonth(bool: any): void;
    showNextYear(bool: any): void;
    showPrevYear(bool: any): void;
    checkDayInMonth(): any;
    resetCalendar(): void;
    disabledDates(): void;
    convertDateToParse(date: any): string;
    isDisabledDate(day: any, month: any, year: any): boolean;
    showCalendar(bool: any): void;
    hideCalendar(): void;
    toggleCalendar(bool: any): void;
    getDateIndexes(): any[];
    setInputValue(): void;
    getDateForInput(day: any, month: any, year: any): any;
    getDateFromInput(): string;
    resetDayValue(day: any): void;
    resetLabelCalendarTrigger(): void;
    getFocusableElements(): void;
    getFirstFocusable(elements: any): boolean;
    getLastFocusable(elements: any): boolean;
    trapFocus(event: any): void;
    placeCalendar(): void;
}
