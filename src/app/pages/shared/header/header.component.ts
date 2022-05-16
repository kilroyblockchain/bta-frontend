import { AuthService, UtilsService, LocalStorageService } from 'src/app/@core/services/';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NbDialogService, NbMenuBag, NbMenuItem, NbMenuService, NbSidebarState } from '@nebular/theme';
import { ChangePasswordComponent } from '../../after-login/user/change-password/password';
import { NbSidebarService } from '@nebular/theme';
import { environment } from 'src/environments/environment';
import { FEATURE_IDENTIFIER } from 'src/app/@core/constants/featureIdentifier.enum';
import { ACCESS_TYPE } from 'src/app/@core/constants/accessType.enum';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageConstant } from 'src/app/@core/constants';
import { ICompany, IUserRes, IUserCompany } from 'src/app/@core/interfaces/user-data.interface';

interface IorgMenu extends NbMenuItem {
    companyId: string;
}

interface IOrgDetail {
    companyName: string;
    value: string;
    elementId: string;
    subscriptionType: string;
    companyId: string;
    isOrganization?: boolean;
}

interface IOrgMenu extends NbMenuItem {
    value: string;
    elementId: string;
    subscriptionType: string;
    companyId: string;
    isOrganization?: boolean;
}
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
    private destroy$: Subject<void> = new Subject<void>();
    userMenu: NbMenuItem[] = [];
    organizationMenu: IOrgMenu[] = [];
    organizationList: IOrgDetail[] = [];
    searchMenu = [];
    allRoles: string[] = [];
    manageUserMenuItem: NbMenuItem[] = [];
    organizationName = '';
    isLoggedIn = false;
    userData!: IUserRes;
    autoPassword!: boolean;
    searchPlaceHolder = '';
    searchStringChanged: Subject<string> = new Subject<string>();
    routerSubscription!: Subscription;
    BASE_URL = environment.hostURL;
    selectedOrganizationId = '';
    searchString = '';
    selectedOrganization!: { id: string };
    menuClickSubscription!: Subscription;
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
        await this.authService.getUserData().then((data: IUserRes) => {
            this.userData = { ...data };
            this.autoPassword = this.userData.autoPassword;
            this.selectedOrganizationId = this.userData.companyId;
            if (this.userData && this.userData.company && this.userData?.company.length) {
                this.setDefaultSubscriptionTypeOnCompanyChange(this.userData);

                const organization = this.userData.company.filter((defaultCompany: IUserCompany) => (<ICompany>defaultCompany.companyId)._id === this.selectedOrganizationId && defaultCompany.verified && !defaultCompany.isDeleted);
                this.organizationName = (organization.find((company) => company.default)?.companyId as ICompany).companyName;

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
        this.translate.get(keyword).subscribe((data: string) => {
            this.userMenu.push({ title: data, ...menuItemLink });
        });
    }

    ngOnInit(): void {
        this.initMenuSubscription();
        this.listenLogoutStatus();
    }

    languageChanged(): void {
        this.translate.onLangChange.subscribe(() => {
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

    async checkAccess(): Promise<void> {
        this.canReadOrganizationDetail = await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_DETAIL, [ACCESS_TYPE.READ]);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
        this.routerSubscription.unsubscribe();
        this.menuClickSubscription.unsubscribe();
    }

    initMenuSubscription(): void {
        this.menuClickSubscription = this.menuService.onItemClick().subscribe((event: NbMenuBag) => {
            switch (event.item.title) {
                case this.translate.instant('HEADER.MENU_ITEM.CHANGE_PASSWORD'):
                    this.dialogService.open(ChangePasswordComponent, { context: { type: 'own' }, closeOnBackdropClick: !this.autoPassword, closeOnEsc: !this.autoPassword });
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
                const selectedOrg = this.organizationMenu.find((element) => element.value === item.companyId);
                this.authService.changeDefaultCompany({ companyId: selectedOrg?.companyId as string, subscriptionType: selectedOrg?.subscriptionType as string }).subscribe((res) => {
                    this.authService.setUserData(res.data);
                    this.setDefaultSubscriptionTypeOnCompanyChange(res.data);
                    window.location.reload();
                });
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

    toggleAdminSidebar(): void {
        this.sidebarService.toggle(false, 'left');
        this.sidebarService.getSidebarState('left').subscribe((state: NbSidebarState) => {
            this.localStorageService.setLocalStorageData(LocalStorageConstant.sidebarState, state);
        });
    }

    checkShowDashboard(role: string): boolean {
        return role === 'vaccinated-user' || role === 'super-admin';
    }

    setDefaultSubscriptionTypeOnCompanyChange(userData: IUserRes): void {
        const defaultCompany = <IUserCompany>userData.company.find((defCompany) => defCompany.default);
        this.authService.setDefaultSubscriptionType(defaultCompany.subscriptionType);
    }

    get showOrganizationMenu(): boolean {
        return Boolean(this.organizationMenu && this.organizationMenu.length > 1 && this.userData && this.userData?.roles && this.userData?.roles?.length && this.userData?.roles[0] && this.allRoles.length);
    }
}
