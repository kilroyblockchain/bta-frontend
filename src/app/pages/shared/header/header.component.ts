import { AuthService, UtilsService, LocalStorageService } from 'src/app/@core/services/';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NbDialogService, NbMenuItem, NbMenuService } from '@nebular/theme';
import { ChangePasswordComponent } from '../../after-login/user/change-passwod/change-password.component';
import { NbSidebarService } from '@nebular/theme';
import { environment } from 'src/environments/environment';
import { FEATURE_IDENTIFIER } from 'src/app/@core/constants/featureIdentifier.enum';
import { ACCESS_TYPE } from 'src/app/@core/constants/accessType.enum';
import { Location } from '@angular/common';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { LocalStorageConstant } from 'src/app/@core/constants';
import { ICompany, IUserCompany, IUserData } from 'src/app/@core/interfaces/user-data.interface';

interface IorgMenu extends NbMenuItem {
    companyId: string;
}
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject<void>();
    userMenu: any[] = [];
    organizationMenu: any[] = [];
    contactsMenu = [];
    organizationList: any[] = [];
    searchMenu = [];
    allRoles: any[] = [];
    manageUserMenuItem: NbMenuItem[] = [];
    organizationName = '';
    isLoggedIn = false;
    userData!: IUserData;
    autoPassword!: boolean;
    searchPlaceHolder = '';
    searchStringChanged: Subject<any> = new Subject<any>();
    routerSubscription!: Subscription;
    BASE_URL = environment.hostURL;
    selectedOrganizationId = '';
    searchString = '';
    selectedOrganization: any;
    menuClickSubscription!: Subscription;
    defaultCompanyRoles!: any[];
    onlyVaccinatedUser!: boolean;
    canReadOrganizationDetail!: boolean;
    appTitle = environment.project;

    constructor(private sidebarService: NbSidebarService, private menuService: NbMenuService, private router: Router, private authService: AuthService, private localStorageService: LocalStorageService, private dialogService: NbDialogService, protected readonly utilsService: UtilsService, private locationService: Location, private translate: TranslateService) {
        this.isLoggedIn = this.authService.isLoggedIn;
        this.buildMenu();
        this.checkAccess();
        this.languageChanged();
    }

    async buildMenu(): Promise<void> {
        await this.authService.getUserData().then((data: IUserData) => {
            this.userData = { ...data };
            this.autoPassword = this.userData.autoPassword;
            this.selectedOrganizationId = this.userData.companyId;
            if (this.userData && this.userData.company && this.userData?.company.length) {
                this.setDefaultSubscriptionTypeOnCompanyChange(this.userData);

                const organization = this.userData.company.filter((defaultCompany: IUserCompany) => (<ICompany>defaultCompany.companyId)._id === this.selectedOrganizationId && defaultCompany.verified && !defaultCompany.isDeleted);
                this.organizationName = (organization.find((company) => company.default)?.companyId as ICompany).companyName;
                this.defaultCompanyRoles = [];
                organization.forEach((element: IUserCompany) => {
                    if (!this.defaultCompanyRoles.some((orgRole) => orgRole === element)) {
                        this.defaultCompanyRoles.push(element.subscriptionType);
                    }
                });
                this.organizationList = [];

                this.userData.company.forEach((element) => {
                    const companyDetail = <ICompany>element.companyId;
                    if (!this.organizationList.some((org) => org.value === companyDetail._id && element.verified && element.userAccept && ((!element.isDeleted && element.isAdmin) || (!element.isAdmin && element.staffingId.length)))) {
                        this.organizationList.push({ companyName: companyDetail.companyName, value: companyDetail._id, elementId: element._id, subscriptionType: element.subscriptionType, companyId: companyDetail._id });
                        this.organizationMenu.push({ isOrganization: true, title: companyDetail.companyName, value: companyDetail._id, elementId: element._id, subscriptionType: element.subscriptionType, companyId: companyDetail._id });
                    }
                    if (element.verified && !element.isDeleted) {
                        this.allRoles.push(element.subscriptionType);
                    }
                });
            }
            if (this.isLoggedIn && this.userData && this.userData?.roles.includes('supervisor')) {
                this.selectedOrganization = this.localStorageService.getLocalStorageData('selectedOrganization');
                if (!this.selectedOrganization) {
                    this.selectedOrganizationId = this.userData.companyId;
                    this.localStorageService.setLocalStorageData('selectedOrganization', { id: this.userData.companyId });
                } else {
                    this.selectedOrganizationId = this.selectedOrganization.id;
                }
            }
        });
        if (this.isLoggedIn) {
            if (this.userData.roles.length === 1 && this.userData.roles.includes('vaccinated-user')) {
                this.getTranslatedValue('HEADER.MENU_ITEM.PROFILE', 'u/user/profile/personal-details');
            } else {
                if (await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.PERSONAL_DETAIL, [ACCESS_TYPE.READ])) {
                    this.getTranslatedValue('HEADER.MENU_ITEM.PROFILE', 'u/user/profile/personal-details');
                }
                if (this.canReadOrganizationDetail) {
                    this.getTranslatedValue('HEADER.MENU_ITEM.YOUR_ORGANIZATION_DETAILS', 'u/user/profile/organization-details');
                }
            }
            this.getTranslatedValue('HEADER.MENU_ITEM.CHANGE_PASSWORD');
            this.getTranslatedValue('HEADER.MENU_ITEM.LOGOUT');

            if (await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_UNIT, [ACCESS_TYPE.READ])) {
                this.manageUserMenuItem.push({
                    title: 'Organization Unit',
                    link: '/u/manage-users/organization-unit',
                    pathMatch: 'full'
                });
            }
            if (await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_USER, [ACCESS_TYPE.READ])) {
                this.manageUserMenuItem.push({
                    title: 'User',
                    link: '/u/manage-users/user',
                    pathMatch: 'full'
                });
            }
        }
    }

    getTranslatedValue(keyword: string, link?: string): void {
        const menuItemLink = link ? { link } : {};
        this.translate.get(keyword).subscribe((data: object) => {
            this.userMenu.push({ title: data, ...menuItemLink });
        });
    }

    ngOnInit(): void {
        this.initMenuSubscription();
        this.listenLogoutStatus();
    }

    languageChanged(): void {
        this.translate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.searchMenu = [];
            this.organizationMenu = [];
            this.userMenu = [];
            this.buildMenu();
        });
    }

    listenLogoutStatus(): void {
        this.authService.logOutStatus.subscribe(() => {
            this.isLoggedIn = false;
        });
    }

    async checkAccess(): Promise<any> {
        this.canReadOrganizationDetail = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_DETAIL, [ACCESS_TYPE.READ]);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.routerSubscription.unsubscribe();
        this.menuClickSubscription.unsubscribe();
    }

    initMenuSubscription(): void {
        this.menuClickSubscription = this.menuService.onItemClick().subscribe((event) => {
            if (event.tag !== 'caseGridMenu' && event.tag !== 'contactGridMenu' && event.tag !== 'allContactsGridMenu') {
                switch (event.item.title) {
                    case this.translate.instant('HEADER.MENU_ITEM.CHANGE_PASSWORD'):
                        this.dialogService.open(ChangePasswordComponent, { closeOnBackdropClick: !this.autoPassword, closeOnEsc: !this.autoPassword });
                        break;
                    default:
                        break;
                }

                if (event.item.title === this.translate.instant('HEADER.MENU_ITEM.LOGOUT')) {
                    this.authService.logout();
                }
                if (event.tag === 'organization-context-menu') {
                    const item = event.item as IorgMenu;
                    this.organizationName = event.item.title;
                    this.localStorageService.setLocalStorageData('selectedOrganization', { id: item.companyId });
                    this.authService.changeDefaultCompany(this.organizationMenu.find((element) => element.value === item.companyId)).subscribe((res) => {
                        this.authService.setUserData(res.data);
                        this.setDefaultSubscriptionTypeOnCompanyChange(res.data);
                        window.location.reload();
                    });
                }
            }
        });
    }

    navigateTo(URL: string): void {
        this.router.navigate([URL]);
    }

    onChangeSearch(text: string): void {
        this.searchString = text;
        this.searchStringChanged.next(text);
    }

    navigateToSearch(text: string): void {
        const searchInfo = this.getSearchDataFromLocalStorage();
        if (text && text.length > 2) {
            if (searchInfo && searchInfo.search === 'child') {
                this.router.navigate(['/u/contact-tracing/child-cases'], { queryParams: { query: text }, state: { programaticRoute: true } });
            } else if (searchInfo && searchInfo.search === 'main') {
                this.router.navigate(['u/contact-tracing'], { queryParams: { query: text }, state: { programaticRoute: true } });
            } else if (searchInfo && searchInfo.search === 'vaccine-outreach') {
                this.router.navigate(['u/vaccine-outreach'], { queryParams: { query: text }, state: { programaticRoute: true } });
            }
            this.searchStringChanged.next(text);
        } else {
            if (searchInfo && searchInfo.search === 'child') {
                this.router.navigate(['/u/contact-tracing/child-cases'], { queryParams: {}, state: { programaticRoute: true } });
            } else if (searchInfo && searchInfo.search === 'main') {
                this.router.navigate(['u/contact-tracing'], { queryParams: {}, state: { programaticRoute: true } });
            } else if (searchInfo && searchInfo.search === 'vaccine-outreach') {
                this.router.navigate(['u/vaccine-outreach'], { queryParams: {}, state: { programaticRoute: true } });
            }
            this.searchStringChanged.next('');
        }
    }

    getSearchDataFromLocalStorage(): any {
        return this.localStorageService.getLocalStorageData('searchBy');
    }

    setSearchInfoIntoLocalStorage(data: any): void {
        this.localStorageService.setLocalStorageData('searchBy', data);
    }

    toggleAdminSidebar(): void {
        this.sidebarService.toggle(false, 'left');
        this.sidebarService.getSidebarState('left').subscribe((state) => {
            this.localStorageService.setLocalStorageData(LocalStorageConstant.sidebarState, state);
        });
    }

    onOrganizationChange(data: any): void {
        this.localStorageService.setLocalStorageData('selectedOrganization', { id: data });
        this.authService.changeDefaultCompany(this.organizationList.find((element) => element.value === data)).subscribe((res) => {
            this.authService.setUserData(res.data);
            window.location.reload();
        });
    }

    checkShowDashboard(role: string): boolean {
        return role === 'vaccinated-user' || role === 'super-admin';
    }

    setDefaultSubscriptionTypeOnCompanyChange(userData: IUserData): void {
        const defaultCompany = <IUserCompany>userData.company.find((defCompany) => defCompany.default);
        this.authService.setDefaultSubscriptionType(defaultCompany.subscriptionType);
    }

    get showOgranizationMenu(): boolean {
        return Boolean(this.organizationMenu && this.organizationMenu.length > 1 && this.userData && this.userData?.roles && this.userData?.roles?.length && this.userData?.roles[0] && this.allRoles.length);
    }
}
