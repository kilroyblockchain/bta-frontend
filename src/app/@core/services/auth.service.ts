import { HttpService } from './http.service';
import { NavigationBehaviorOptions, Router } from '@angular/router';
import { LocalStorageService } from './local-storage.service';
import { LocalStorageConstant } from 'src/app/@core/constants/local-storage.constant';
import { URLConstant } from '../constants/url.constant';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom, Subject } from 'rxjs';
import { IUserRegisterFormData, IUserRegisterRes } from 'src/app/pages/before-login/auth/register/user-register.interface';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    logOutSubject: Subject<void> = new Subject<void>();

    constructor(private http: HttpService, private localStorageService: LocalStorageService, private router: Router) {}

    userRegister(user: IUserRegisterFormData): Observable<IUserRegisterRes> {
        return this.http.post(URLConstant.userRegistrationURL, user);
    }

    createUserForOrganization(user: any, defaultSubscriptionType: string): Observable<any> {
        return this.http.post(URLConstant.createUserForOrgURL + `/${defaultSubscriptionType}`, user);
    }

    updatePersonalDetails(user: any): Observable<any> {
        return this.http.put(URLConstant.userUpdateURL, user);
    }

    getUser(): Observable<any> {
        return this.http.get(URLConstant.getUserData);
    }

    getUserById(userId: string): Observable<any> {
        return this.http.get(URLConstant.getUserData + `/${userId}`);
    }

    getAllUserData(query: any): Observable<any> {
        return this.http.get(URLConstant.getAllUserData, query);
    }

    getAllCompanyNames(): Observable<any> {
        return this.http.get(URLConstant.getAllCompanyNamesUrl);
    }

    organizationRegister(organization: any, formData: any): Observable<any> {
        return this.http.post(URLConstant.organizationRegistrationURL, organization, formData);
    }

    getOrganizationById(organizationId: string): Observable<any> {
        return this.http.get(URLConstant.getOrganizationURL + '/' + organizationId);
    }

    getOrganization(): any {
        return this.localStorageService.getLocalStorageData(LocalStorageConstant.comapanyId);
    }

    updateOrganization(organizationId: string, organization: any, hasFormData: any): Observable<any> {
        return this.http.put(URLConstant.updateOrganizationURL + '/' + organizationId, organization, hasFormData);
    }

    userLogin(user: any): Observable<any> {
        return this.http.post(URLConstant.loginURL, user);
    }

    requestPassword(user: any): Observable<any> {
        return this.http.put(URLConstant.requestPasswordURL, user);
    }

    resetPassword(user: any): Observable<any> {
        return this.http.put(URLConstant.resetPasswordURL, user);
    }

    changeDefaultCompany(data: any): Observable<any> {
        return this.http.put(URLConstant.changeDefaultURL, data);
    }

    changePassword(user: any): Observable<any> {
        return this.http.put(URLConstant.changePasswordURL, user);
    }

    verifyUser(user: any): Observable<any> {
        return this.http.put(URLConstant.verifyUser, user);
    }

    deleteUser(data: any): Observable<any> {
        return this.http.put(URLConstant.getUserData, data);
    }

    getVerificationDetails(token: string): Observable<any> {
        return this.http.get(URLConstant.getVerificationDetailsURL + `/${token}`);
    }

    setUserAccept(token: string): Observable<any> {
        return this.http.put(URLConstant.setUserAcceptURL + `/${token}`);
    }

    getNewAccessToken(): Observable<any> {
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

    setUserData(user: any): void {
        this.localStorageService.setLocalStorageData(LocalStorageConstant.user, user);
    }

    setOrganizationId(companyId: string): void {
        this.localStorageService.setLocalStorageData(LocalStorageConstant.comapanyId, { id: companyId });
    }

    async getOrganizationId(): Promise<object> {
        return await this.localStorageService.getLocalStorageData(LocalStorageConstant.comapanyId);
    }

    async getUserData(): Promise<any> {
        const userToken = await this.localStorageService.getLocalStorageData(LocalStorageConstant.user);
        return userToken;
    }

    getUserDataSync(): any {
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

    addCompanyToUser(addCompanyDto: any): Observable<any> {
        return this.http.put(URLConstant.addCompanyToUser, addCompanyDto);
    }

    findUserIdByEmail(query: any): Observable<any> {
        const encodedEmail = encodeURIComponent(query.email);
        return this.http.get(URLConstant.getUserIdByEmail, { email: encodedEmail });
    }

    updateUserLocalStorageData(updateData: any): void {
        const userData = this.getUserDataSync();
        this.setUserData({ ...userData, ...updateData });
    }

    getUserDefaultCompany(subscriptionType?: string): any {
        const userData = this.getUserDataSync();
        if (subscriptionType) {
            return userData.company.find((company: any) => company.subscriptionType === subscriptionType && company.default === true);
        } else {
            return userData.companyId;
        }
    }

    getUserLang(): string {
        return this.localStorageService.getLocalStorageData(LocalStorageConstant.defaultLanguage) || 'en';
    }

    setUserLang(lang: string): void {
        return this.localStorageService.setLocalStorageData(LocalStorageConstant.defaultLanguage, lang);
    }

    getUserSubscriptionCompany(subscriptionType: string): any {
        const userData = this.getUserDataSync();
        if (userData.roles && userData.roles.includes(subscriptionType)) {
            return userData.company.find((company: any) => company.subscriptionType === subscriptionType);
        }
    }

    getUserRoles(): Array<string> {
        const userData = this.getUserDataSync();
        return userData.roles;
    }

    unblockUser(userId: string): Observable<any> {
        return this.http.put(`${URLConstant.unblockUserURL}/${userId}`);
    }
}
