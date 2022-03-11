import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter } from 'rxjs/operators';
import { LocalStorageConstant } from './@core/constants';
import { AuthService, LocalStorageService } from './@core/services';
import { NbSidebarState } from '@nebular/theme';
import { environment } from 'src/environments/environment';
import { TitleCasePipe } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [TitleCasePipe]
})
export class AppComponent {
    title = environment.project + '-web';
    isLoggedIn = false;
    userData: any;
    pageType = '';
    sidebarState: NbSidebarState;
    constructor(protected authService: AuthService, private router: Router, private activatedRoute: ActivatedRoute, private titleService: Title, private translate: TranslateService, private localStorageService: LocalStorageService, private titleCasePipe: TitleCasePipe) {
        this.isLoggedIn = this.authService.isLoggedIn;
        this.listenLogoutStatus();
        this.authService.getUserData().then((data) => {
            this.userData = { ...data };
        });
        this.setPageTitle();
        this.sidebarState = this.localStorageService.getLocalStorageData(LocalStorageConstant.sidebarState) ?? 'expanded';
    }

    listenLogoutStatus(): void {
        this.authService.logOutStatus.subscribe(() => {
            this.isLoggedIn = false;
        });
    }

    setPageTitle(): void {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            const rt = this.getChild(this.activatedRoute);
            const titledProject = this.titleCasePipe.transform(environment.project);
            rt.data.subscribe((data) => {
                if (data['pageTitle']) {
                    this.translate.stream(data['pageTitle']).subscribe((translation: string) => {
                        this.titleService.setTitle(data['pageTitle'] ? `${translation} - ${titledProject}` : titledProject);
                    });
                }
            });
        });
    }

    getChild(activatedRoute: ActivatedRoute): ActivatedRoute {
        if (activatedRoute.firstChild) {
            return this.getChild(activatedRoute.firstChild);
        } else {
            return activatedRoute;
        }
    }
}
