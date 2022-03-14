import { AuthService } from 'src/app/@core/services';
import { Injectable } from '@angular/core';
import { HttpHandler, HttpEvent, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    refreshingAccessToken!: boolean;
    private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
    constructor(public authService: AuthService) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        req = req.clone({
            setHeaders: {
                timeZoneId: this.getTimezoneId()
            },
            withCredentials: true
        });
        if (this.authService.getAccessToken()) {
            req = this.addToken(req, this.authService.getAccessToken());
        }

        return next.handle(req).pipe(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            catchError((error: HttpErrorResponse): Observable<any> => {
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    if (req.url.includes('refresh-access-token')) {
                        this.authService.logoutByTokenExpiry();
                    } else {
                        return this.handle401Error(req, next);
                    }
                }
                return throwError(() => error);
            })
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
        return request.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private handle401Error(request: HttpRequest<any>, next: HttpHandler): any {
        if (!this.refreshingAccessToken) {
            if (!this.authService.getAccessToken()) {
                this.authService.clearAllLocalStorageData();
                this.authService.navigateToLogin({ skipLocationChange: true });
                return of('Logout success');
            }
            this.refreshingAccessToken = true;
            this.refreshTokenSubject.next(null);

            return this.authService.getNewAccessToken().pipe(
                switchMap((token: { accessToken: string }) => {
                    const accessToken = token.accessToken;
                    this.refreshingAccessToken = false;
                    this.authService.setAccessToken(accessToken);
                    this.refreshTokenSubject.next(accessToken);
                    return next.handle(this.addToken(request, accessToken));
                }),
                catchError((err) => {
                    this.refreshingAccessToken = false;
                    return throwError(() => err);
                })
            );
        } else {
            if (!this.authService.getAccessToken()) {
                this.refreshingAccessToken = false;
                this.authService.navigateToLogin({ skipLocationChange: true });
            }
            return this.refreshTokenSubject.pipe(
                filter((token) => token != null),
                take(1),
                switchMap((jwt) => {
                    return next.handle(this.addToken(request, jwt as string));
                }),
                catchError((err) => {
                    this.refreshingAccessToken = false;
                    return throwError(() => err);
                })
            );
        }
    }

    private getTimezoneId(): string {
        return String(Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
}
