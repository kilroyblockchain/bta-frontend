import { HttpService } from './http.service';
import { NavigationBehaviorOptions, Router } from '@angular/router';
import { LocalStorageService } from './local-storage.service';
import { LocalStorageConstant } from 'src/app/@core/constants/local-storage.constant';
import { URLConstant } from '../constants/url.constant';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, Subject } from 'rxjs';
import { IUserRegisterFormData, IUserRegisterRes } from 'src/app/pages/before-login/auth/register/user-register.interface';
import { ICompany, IUserRes, IUserData } from '../interfaces/user-data.interface';
import { IAddCompanyToUser, IStaffUserFormData } from 'src/app/pages/after-login/manage-users/user/manage-user.interface';
import { IAppResponse, IPaginateResult } from '../interfaces/app-response.interface';
import { IOrganizationFormData } from 'src/app/pages/after-login/user/edit-organization/organization-form.interface';
import { IChangeDefaultCompany, IUserAcceptDetail } from '../interfaces/manage-user.interface';
import { IUserActionRow } from 'src/app/pages/after-login/super-admin/users/user.interface';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    logOutSubject: Subject<void> = new Subject<void>();

    constructor(private http: HttpService, private localStorageService: LocalStorageService, private router: Router) {}

    userRegister(user: IUserRegisterFormData): Observable<IAppResponse<IUserRegisterRes>> {
        return this.http.post(URLConstant.userRegistrationURL, user);
    }

    createUserForOrganization(user: IStaffUserFormData, defaultSubscriptionType: string): Observable<IAppResponse<IUserRes>> {
        return this.http.post(URLConstant.createUserForOrgURL + `/${defaultSubscriptionType}`, user);
    }

    updatePersonalDetails(user: IUserRegisterFormData): Observable<IAppResponse<IUserData>> {
        return this.http.put(URLConstant.userUpdateURL, user);
    }

    getUser(): Observable<IAppResponse<IUserData>> {
        return this.http.get(URLConstant.getUserData);
    }

    getAllUserData(query: { [key: string]: unknown }): Observable<IAppResponse<IPaginateResult<IUserRes>>> {
        return this.http.get(URLConstant.getAllUserData, query);
    }

    getAllCompanyNames(): Observable<IAppResponse<string[]>> {
        return this.http.get(URLConstant.getAllCompanyNamesUrl);
    }

    getOrganizationById(organizationId: string): Observable<IAppResponse<ICompany>> {
        return this.http.get(URLConstant.getOrganizationURL + '/' + organizationId);
    }

    getOrganization(): { id: string } {
        return this.localStorageService.getLocalStorageData(LocalStorageConstant.companyId);
    }

    updateOrganization(organizationId: string, organization: IOrganizationFormData, hasFormData: boolean): Observable<IAppResponse<ICompany>> {
        return this.http.put(URLConstant.updateOrganizationURL + '/' + organizationId, organization, hasFormData);
    }

    userLogin(user: { email: string; password: string }): Observable<IAppResponse<IUserRes>> {
        return this.http.post(URLConstant.loginURL, user);
    }

    requestPassword(user: { email: string }): Observable<IAppResponse<void>> {
        return this.http.put(URLConstant.requestPasswordURL, user);
    }

    resetPassword(user: { password: string; resetToken: string }): Observable<IAppResponse<void>> {
        return this.http.put(URLConstant.resetPasswordURL, user);
    }

    changeDefaultCompany(data: IChangeDefaultCompany): Observable<IAppResponse<IUserRes>> {
        return this.http.put(URLConstant.changeDefaultURL, data);
    }

    changePassword(user: { currentPassword: string; password: string }): Observable<IAppResponse<Partial<IUserRes>>> {
        return this.http.put(URLConstant.changePasswordURL, user);
    }

    changeUserPassword(userId: string, changePasswordData: { currentPassword: string; password: string }): Observable<IAppResponse<void>> {
        return this.http.put(URLConstant.changePasswordURL + `/${userId}`, changePasswordData);
    }

    verifyUser(user: IUserActionRow): Observable<IAppResponse<void>> {
        return this.http.put(URLConstant.verifyUser, user);
    }

    deleteUser(data: Partial<IUserActionRow>): Observable<IAppResponse<{ user: IUserRes }>> {
        return this.http.put(URLConstant.getUserData, data);
    }

    getVerificationDetails(token: string): Observable<IAppResponse<IUserAcceptDetail>> {
        return this.http.get(URLConstant.getVerificationDetailsURL + `/${token}`);
    }

    setUserAccept(token: string): Observable<IAppResponse<void>> {
        return this.http.put(URLConstant.setUserAcceptURL + `/${token}`);
    }

    getNewAccessToken(): Observable<IAppResponse<{ accessToken: string }>> {
        const data = {
            accessToken: this.getAccessToken()
        };
        return this.http.post(URLConstant.refreshToken, data);
    }

    get isLoggedIn(): boolean {
        const authToken = this.getAccessToken();
        if (!authToken) {
            this.localStorageService.clearAllLocalStorageData();
        }
        return authToken ? true : false;
    }

    setUserData(user: Partial<IUserRes>): void {
        this.localStorageService.setLocalStorageData(LocalStorageConstant.user, user);
    }

    setOrganizationId(companyId: string): void {
        this.localStorageService.setLocalStorageData(LocalStorageConstant.companyId, { id: companyId });
    }

    async getOrganizationId(): Promise<object> {
        return await this.localStorageService.getLocalStorageData(LocalStorageConstant.companyId);
    }

    async getUserData(): Promise<IUserRes> {
        const userToken = await this.localStorageService.getLocalStorageData(LocalStorageConstant.user);
        return userToken;
    }

    getUserDataSync(): IUserRes {
        const userToken = this.localStorageService.getLocalStorageData(LocalStorageConstant.user);
        return userToken;
    }

    setAccessToken(token: string): void {
        this.localStorageService.setLocalStorageData(LocalStorageConstant.token, token);
    }

    getAccessToken(): string {
        return this.localStorageService.getLocalStorageData(LocalStorageConstant.token);
    }

    async logout(): Promise<void> {
        this.clearAllLocalStorageData();
        await firstValueFrom(this.http.post(URLConstant.logoutURL));
        this.logOutSubject.next();
        this.navigateToLogin();
    }

    logoutByTokenExpiry(): void {
        this.clearAllLocalStorageData();
        this.logOutSubject.next();
        this.navigateToLogin();
    }

    clearAllLocalStorageData(): void {
        this.localStorageService.clearAllLocalStorageData();
    }

    get logOutStatus(): Observable<void> {
        return this.logOutSubject.asObservable();
    }

    navigateToLogin(options: NavigationBehaviorOptions = {}): void {
        this.router.navigateByUrl('auth/login', options).then(() => {
            window.location.reload();
        });
    }

    setDefaultSubscriptionType(subscriptionType: string): void {
        this.localStorageService.setLocalStorageData(LocalStorageConstant.defaultSubscriptionType, subscriptionType);
    }

    getDefaultSubscriptionType(): string {
        return this.localStorageService.getLocalStorageData(LocalStorageConstant.defaultSubscriptionType);
    }

    addCompanyToUser(addCompanyDto: IAddCompanyToUser): Observable<IAppResponse<IUserRes>> {
        return this.http.put(URLConstant.addCompanyToUser, addCompanyDto);
    }

    findUserIdByEmail(query: { [key: string]: unknown }): Observable<IAppResponse<Partial<IUserData>>> {
        const encodedEmail = encodeURIComponent(query['email'] as string);
        return this.http.get(URLConstant.getUserIdByEmail, { email: encodedEmail });
    }

    updateUserLocalStorageData(updateData: IUserRes): void {
        const userData = this.getUserDataSync();
        this.setUserData({ ...userData, ...updateData });
    }

    getUserLang(): string {
        return this.localStorageService.getLocalStorageData(LocalStorageConstant.defaultLanguage) || 'en';
    }

    setUserLang(lang: string): void {
        return this.localStorageService.setLocalStorageData(LocalStorageConstant.defaultLanguage, lang);
    }

    getUserRoles(): Array<string> {
        const userData = this.getUserDataSync();
        return userData.roles;
    }

    unblockUser(userId: string): Observable<IAppResponse<void>> {
        return this.http.put(`${URLConstant.unblockUserURL}/${userId}`);
    }

    addSubscriptionType(data: { companyId: string; subscriptionType: string[]; userId: string }): Observable<IAppResponse<IUserRes>> {
        return this.http.put(URLConstant.addSubscriptionTypeUrl, data);
    }
}
