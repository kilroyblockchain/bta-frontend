import { ACCESS_TYPE } from 'src/app/@core/constants/accessType.enum';
import { Component } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { FEATURE_IDENTIFIER } from 'src/app/@core/constants/featureIdentifier.enum';
import { AuthService, LangTranslateService, UtilsService } from 'src/app/@core/services';
import { MenuItem } from 'src/app/@core/interfaces/menu-item.interface';
import { environment } from 'src/environments/environment';
import { TitleCasePipe } from '@angular/common';
import { IUserRes } from 'src/app/@core/interfaces/user-data.interface';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    providers: [TitleCasePipe]
})
export class SidebarComponent {
    isLoggedIn = false;
    menuItems: MenuItem[] = [];
    superAdminMenuItems: MenuItem[] = [];
    companyUsersMenuItems: MenuItem[] = [];
    defaultMenuItems: MenuItem[] = [];
    userData!: IUserRes;
    appTitle = environment.project;

    constructor(private utilsService: UtilsService, private authService: AuthService, private sidebarService: NbSidebarService, private langTranslateService: LangTranslateService, private titleCasePipe: TitleCasePipe) {
        this.isLoggedIn = this.authService.isLoggedIn;
        this.buildMenu();
    }

    listenLanguageChange(): void {
        this.langTranslateService.getCurrentLangRequest().subscribe(() => {
            if (this.superAdminMenuItems.length) {
                this.langTranslateService.translateMenu(this.superAdminMenuItems);
            }
            if (this.companyUsersMenuItems.length) {
                this.langTranslateService.translateMenu(this.companyUsersMenuItems);
            }
            if (this.defaultMenuItems.length) {
                this.langTranslateService.translateMenu(this.defaultMenuItems);
            }
            if (this.menuItems.length) {
                this.langTranslateService.translateMenu(this.menuItems);
            }
        });
    }

    async buildMenu(): Promise<void> {
        this.userData = await this.authService.getUserData().then((data) => {
            return { ...data };
        });
        if (this.userData && this.userData.roles && this.userData.roles.length) {
            if (this.userData.roles.includes('super-admin')) {
                await this.buildSuperAdminMenu();
            }

            await this.buildDefaultMenu();

            if (this.superAdminMenuItems.length) {
                this.menuItems.push({
                    title: 'Super Admin',
                    key: 'HEADER.MENU_ITEM.SUPER_ADMIN',
                    group: true
                });
                this.menuItems.push(...this.superAdminMenuItems);
            }
            if (this.companyUsersMenuItems.length || this.defaultMenuItems.length) {
                this.menuItems.unshift({
                    title: 'Dashboard',
                    key: 'HEADER.MENU_ITEM.DASHBOARD',
                    link: '/u/dashboard',
                    pathMatch: 'full'
                });
                if (this.userData.roles.includes('super-admin')) {
                    this.menuItems.push({
                        title: 'Organizational',
                        key: 'HEADER.MENU_ITEM.ORGANIZATIONAL',
                        group: true
                    });
                }

                if (this.defaultMenuItems.length) {
                    this.menuItems.push(...this.defaultMenuItems);
                }

                if (this.companyUsersMenuItems.length) {
                    this.menuItems.push(...this.companyUsersMenuItems);
                }
            }
        }
        this.listenLanguageChange();
    }

    async buildDefaultMenu(): Promise<void> {
        const manageUserMenuItem = [];
        if (await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_UNIT, [ACCESS_TYPE.READ])) {
            manageUserMenuItem.push({
                title: 'Organization Unit',
                link: '/u/manage-users/organization-unit',
                pathMatch: 'full',
                key: 'HEADER.MENU_ITEM.ORGANIZATION_UNIT'
            });
        }

        if (await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.ORGANIZATION_USER, [ACCESS_TYPE.READ])) {
            manageUserMenuItem.push({
                title: 'User',
                link: '/u/manage-users/user',
                pathMatch: 'full',
                key: 'HEADER.MENU_ITEM.USER'
            });
        }

        if (this.utilsService.checkIsUserSuperAdmin() || (await this.utilsService.checkIsUserOrgAdmin()) || (await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.USER_ACTIVITY, [ACCESS_TYPE.READ]))) {
            manageUserMenuItem.push({
                title: 'User Activity',
                link: '/u/manage-users/user-activity',
                pathMatch: 'full',
                key: 'HEADER.MENU_ITEM.USER_ACTIVITY'
            });
        }

        if (manageUserMenuItem.length) {
            this.defaultMenuItems.push({
                title: 'Users',
                children: <MenuItem[]>manageUserMenuItem,
                key: 'HEADER.MENU_ITEM.MANAGE_USERS'
            });
        }
    }

    // super admin related menu
    async buildSuperAdminMenu(): Promise<void> {
        await this.buildAppUserMenu();
        this.langTranslateService.translateMenu(this.superAdminMenuItems);
        if (!this.superAdminMenuItems.length) {
            this.sidebarService.collapse();
        }
    }

    async buildAppUserMenu(): Promise<void> {
        const usersMenuItems = [];
        if (await this.utilsService.canAccessFeature(FEATURE_IDENTIFIER.MANAGE_ALL_USER, [ACCESS_TYPE.READ])) {
            usersMenuItems.push({
                title: 'Organization Admin',
                link: '/u/admin/users',
                pathMatch: 'full',
                key: 'SUPER_ADMIN.SIDEBAR_MENU.ORGANIZATION_ADMIN'
            });

            usersMenuItems.push({
                title: 'Unverified Organization',
                link: '/u/admin/unverified-users',
                pathMatch: 'full',
                key: 'SUPER_ADMIN.SIDEBAR_MENU.UNVERIFIED_ORGANIZATION'
            });

            usersMenuItems.push({
                title: 'Rejected Organization',
                link: '/u/admin/rejected-companies',
                pathMatch: 'full',
                key: 'SUPER_ADMIN.SIDEBAR_MENU.REJECTED_ORGANIZATION'
            });

            usersMenuItems.push({
                title: 'Non Admin Users',
                link: '/u/admin/company-users',
                pathMatch: 'full',
                key: 'SUPER_ADMIN.SIDEBAR_MENU.NON_ADMIN_USERS'
            });

            usersMenuItems.push({
                title: 'Blocked Users',
                link: '/u/admin/blocked-users',
                pathMatch: 'full',
                key: 'SUPER_ADMIN.SIDEBAR_MENU.BLOCKED_USERS'
            });

            usersMenuItems.push({
                title: 'Channel SetUp',
                link: '/u/manage-project/channel-setup',
                pathMatch: 'full',
                key: 'Channel Setup'
            });
        }
        if (usersMenuItems.length) {
            this.superAdminMenuItems.push({
                title: 'App Users',
                children: <MenuItem[]>usersMenuItems,
                key: 'SUPER_ADMIN.SIDEBAR_MENU.APP_USERS',
                context: {
                    appTitle: this.titleCasePipe.transform(this.appTitle)
                }
            });
        }
    }
}
