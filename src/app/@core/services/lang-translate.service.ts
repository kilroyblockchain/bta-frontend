import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MenuItem } from '../interfaces/menu-item.interface';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class LangTranslateService {
    constructor(private authService: AuthService, private translate: TranslateService) {}
    private langChangeSubject = new BehaviorSubject<string>(this.authService.getUserLang());

    sendChangeRequest(lang: string): void {
        this.langChangeSubject.next(lang);
    }

    getCurrentLangRequest(): Observable<string> {
        return this.langChangeSubject.asObservable();
    }

    translateMenu(menu: Array<MenuItem>): void {
        menu.forEach((menuItem: MenuItem) => {
            this.translateMenuTitle(menuItem);
        });
    }

    translateMenuTitle(menuItem: MenuItem): void {
        this.translate.get(<string>menuItem.key, menuItem.context ? menuItem.context : {}).subscribe((translated) => {
            menuItem.title = translated;
        });
        if (menuItem.children?.length) {
            this.translateMenu(menuItem.children);
        }
    }

    translateKey(key: string, context = {}): string {
        return this.translate.instant(key, context);
    }
}
