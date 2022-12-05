import { NbGlobalLogicalPosition, NbToastrService, NbSortDirection, NbSortRequest, NbToastrConfig, NbToastRef } from '@nebular/theme';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { ALL_API_RES_MSG_EN, ALL_API_RES_MSG_ES } from '../constants/api-response-constants';
import { environment } from 'src/environments/environment';
import { MenuItem } from 'src/app/@core/interfaces/menu-item.interface';
import { Params } from '@angular/router';
import { IFeature, IFeatureAndAccess, IStaffing } from '../interfaces/manage-user.interface';

const BASE_URL = environment.apiURL;

@Injectable({
    providedIn: 'root'
})
export class UtilsService {
    sortColumn!: string;
    sortDirection: NbSortDirection = NbSortDirection.NONE;
    FILE_URL = BASE_URL + '/files/file/';
    MS_PER_DAY = 1000 * 60 * 60 * 24;
    logFileName: string | undefined;
    constructor(protected readonly nbToasterService: NbToastrService, protected readonly authService: AuthService) {}
    showToast(status: string, message: string | Array<string>, data?: string, options?: Partial<NbToastrConfig>): NbToastRef {
        this.logFileName = data;
        const messageData = this.mapApiErrorConstant(message);
        return this.nbToasterService.show(status, messageData, { limit: 3, position: NbGlobalLogicalPosition.BOTTOM_START, status, duration: this.logFileName ? 20000 : 6000, destroyByClick: true, ...(options ? options : {}) });
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

    resetFilter(value: HTMLInputElement): void {
        value.value = '';
        value.dispatchEvent(new Event('input', { bubbles: true }));
    }

    async canAccessFeature(featureIdentifier: string, featureAccessType: string[]): Promise<boolean> {
        const userData = await this.authService.getUserData();
        let returnValue = await this.checkIsUserOrgAdmin();
        if (!returnValue && userData?.staffingId) {
            (userData?.staffingId as IStaffing[]).map((staffing) => {
                staffing.featureAndAccess.map((feature: IFeatureAndAccess) => {
                    if (feature.featureId && (feature.featureId as IFeature).featureIdentifier === featureIdentifier) {
                        feature.accessType.map((access) => {
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

    mapApiErrorConstant(resMessage: string | string[]): string {
        const message = (resMessage && typeof resMessage === 'string' ? resMessage : resMessage.length ? resMessage[0] : undefined) ?? 'Error occurred';
        if (Array.isArray(resMessage) && resMessage.length > 1) {
            const message = resMessage[0];
            const valueForMessage = resMessage[1];
            const messageToInsertValue = this.getMsgStringFromConst(message);
            return messageToInsertValue.replace('{{value}}', valueForMessage);
        }
        return this.getMsgStringFromConst(message);
    }

    getMsgStringFromConst(constant: string): string {
        const defaultLanguage = this.authService.getUserLang();
        let apiResponseConstant: { [key: string]: string };
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
        let subscriptionType = '';
        if (role === 'super-admin') {
            subscriptionType = 'Super Admin';
        } else if (role === 'staff') {
            subscriptionType = 'Staff';
        } else {
            subscriptionType = 'Other';
        }
        return subscriptionType;
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
        const userData = await this.authService.getUserData();
        const isDefaultCompanyAdmin = userData && userData.company && userData.company.some((company) => company.default && company.verified && !company.isDeleted && company.isAdmin);
        return isDefaultCompanyAdmin;
    }

    checkIsUserSuperAdmin(): boolean {
        const userData = this.authService.getUserDataSync();
        if (userData.roles.includes('super-admin')) {
            return true;
        }
        return false;
    }
}
