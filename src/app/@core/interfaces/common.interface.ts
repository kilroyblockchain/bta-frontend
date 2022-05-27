import { AbstractControl } from '@angular/forms';

export interface IUsersLoginCount {
    realtimeOnlineUserCount: number;
    todayLoginCount: number;
    lastWeekLoginCount: number;
    lastMonthLoginCount: number;
    last3MonthLoginCount: number;
    last6MonthLoginCount: number;
    lastYearLoginCount: number;
    totalLoginUserCount: number;
}

export interface IFormControls {
    [key: string]: AbstractControl;
}
