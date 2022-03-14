import { NbGlobalLogicalPosition, NbToastrService, NbSortDirection, NbSortRequest, NbToastrConfig } from '@nebular/theme';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { ALL_API_RES_MSG_EN, ALL_API_RES_MSG_ES } from '../constants/api-response-constants';
import { environment } from 'src/environments/environment';
import { MenuItem } from 'src/app/@core/interfaces/menu-item.interface';
import { Params } from '@angular/router';

const BASE_URL = environment.apiURL;

@Injectable({
    providedIn: 'root'
})
export class UtilsService {
    sortColumn!: string;
    sortDirection: NbSortDirection = NbSortDirection.NONE;
    userData: any;
    FILE_URL = BASE_URL + '/files/file/';
    MS_PER_DAY = 1000 * 60 * 60 * 24;
    logFileName: string | undefined;
    constructor(protected readonly nbToasterService: NbToastrService, protected readonly authService: AuthService) {}
    showToast(status: any, message: string | Array<string>, data?: string, options?: Partial<NbToastrConfig>): void {
        this.logFileName = data;
        const messageData = this.mapApiErrorConstant(message);
        this.nbToasterService.show(status, messageData, { limit: 3, position: NbGlobalLogicalPosition.BOTTOM_START, status, duration: this.logFileName ? 20000 : 6000, destroyByClick: true, ...(options ? options : {}) });
    }

    updateSort(sortRequest: NbSortRequest): void {
        this.sortColumn = sortRequest.column;
        this.sortDirection = sortRequest.direction;
    }

    getSortDirection(column: string): NbSortDirection {
        if (this.sortColumn === column) {
            return this.sortDirection;
        }
        return NbSortDirection.NONE;
    }

    getShowOn(index: number): number {
        const minWithForMultipleColumns = 400;
        const nextColumnStep = 100;
        return minWithForMultipleColumns + nextColumnStep * index;
    }

    resetFilter(value: any): void {
        value.value = '';
        value.dispatchEvent(new Event('input', { bubbles: true }));
    }

    getControls(data: any): any {
        return data.controls;
    }

    async canAccessFeature(featureIdentifier: any, featureAccessType: any): Promise<boolean> {
        const userData: any = await this.authService.getUserData();
        let returnValue = await this.checkIsUserOrgAdmin();
        if (!returnValue && userData?.staffingId) {
            userData?.staffingId.map((staffing: any) => {
                staffing.featureAndAccess.map((feature: any) => {
                    if (feature.featureId.featureIdentifier === featureIdentifier) {
                        feature.accessType.map((access: any) => {
                            if (featureAccessType.includes(access)) {
                                returnValue = true;
                            }
                        });
                    }
                });
            });
        }
        return returnValue ?? false;
    }

    mapApiErrorConstant(resMessage: any): string {
        const message = resMessage && resMessage.message ? resMessage.message : resMessage || 'Error occured';
        let constant;
        let finalMessage = '';
        if (Array.isArray(message)) {
            constant = message[0];
            if (message.length > 1) {
                const valueForMessage = message[1];
                const messageToInsertValue = this.getMsgStringFromConst(constant);
                finalMessage = messageToInsertValue.replace('{{value}}', valueForMessage);
                return finalMessage;
            }
        } else {
            constant = message;
        }
        finalMessage = this.getMsgStringFromConst(constant);
        return finalMessage;
    }

    getMsgStringFromConst(constant: string): string {
        const defaultLanguage = this.authService.getUserLang();

        let apiResponseConstant: { [key: string]: any };

        switch (defaultLanguage) {
            case 'en':
                apiResponseConstant = ALL_API_RES_MSG_EN;
                break;
            case 'es':
                apiResponseConstant = ALL_API_RES_MSG_ES;
                break;
            default:
                apiResponseConstant = ALL_API_RES_MSG_EN;
                break;
        }

        if (apiResponseConstant[constant]) {
            return apiResponseConstant[constant];
        }
        return constant;
    }

    getFullSubscriptionType(role: string): string {
        let subcriptionType = '';
        if (role === 'super-admin') {
            subcriptionType = 'Super Admin';
        } else if (role === 'staff') {
            subcriptionType = 'Staff';
        } else {
            subcriptionType = 'Other';
        }
        return subcriptionType;
    }

    generateArrayOfYears(): Array<number> {
        const max = new Date().getFullYear();
        const min = max - 50;
        const years = [];
        for (let i = max; i >= min; i--) {
            years.push(i);
        }
        return years;
    }

    groupByKey(list: Array<any>, key: string): Array<any> {
        return list.reduce((hash, obj) => ({ ...hash, [obj[key]]: (hash[obj[key]] || []).concat(obj) }), {});
    }

    setMenuItemLink(menuItems: Array<MenuItem>, menuKey: string, link: string, queryParams?: Params): void {
        const menu = menuItems.find((menuItem) => menuItem.key === menuKey);
        if (menu) {
            menu.link = link;
            menu.queryParams = queryParams;
        }
    }

    getResultsPerPage(): number {
        if (environment.resultsPerPage) {
            return environment.resultsPerPage;
        } else {
            return 15;
        }
    }

    async checkIsUserOrgAdmin(): Promise<boolean> {
        const userData: any = await this.authService.getUserData();
        const isDefaultCompanyAdmin = userData && userData.company && userData.company.some((company: any) => company.default && company.verified && !company.isDeleted && company.isAdmin);
        return isDefaultCompanyAdmin;
    }

    checkIsUserSuperAdmin(): boolean {
        const userData: any = this.authService.getUserDataSync();
        if (userData.roles.includes('super-admin')) {
            return true;
        }
        return false;
    }
}
