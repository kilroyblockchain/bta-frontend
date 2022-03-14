import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { IUserCompany, IUserRes } from 'src/app/@core/interfaces/user-data.interface';
import { AuthService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-select-subscription-type',
    template: `
        <ng-container *ngIf="user.roles && user.roles.length > 1">
            <nb-select size="small" [placeholder]="'MANAGE_USERS.USERS.PLACEHOLDER.SELECT_SUBSCRIPTION' | translate" size="small" [title]="'MANAGE_USERS.USERS.PLACEHOLDER.SELECT_SUBSCRIPTION' | translate" [(selected)]="defaultSubscriptionType" (selectedChange)="onSubscriptionChange($event)">
                <nb-option *ngFor="let role of user.roles" [value]="role">{{ utilsService.getFullSubscriptionType(role) }}</nb-option>
            </nb-select>
        </ng-container>
    `
})
export class SelectSubscriptionTypeComponent implements OnInit {
    user!: IUserRes;
    defaultSubscriptionType!: string;
    defaultCompany!: IUserCompany;
    @Output() changedSubscription = new EventEmitter();
    @Output() initChange = new EventEmitter();
    constructor(private authService: AuthService, public utilsService: UtilsService) {}

    ngOnInit(): void {
        this.user = this.authService.getUserDataSync();
        this.defaultSubscriptionType = this.authService.getDefaultSubscriptionType();
        if (!this.defaultSubscriptionType) {
            this.defaultCompany = this.user.company.find((defCompany) => defCompany.default) as IUserCompany;
            this.authService.setDefaultSubscriptionType(this.defaultCompany.subscriptionType);
            this.defaultSubscriptionType = this.defaultCompany.subscriptionType;
            this.authService.setDefaultSubscriptionType(this.defaultSubscriptionType);
        }
        this.initChange.emit();
    }

    onSubscriptionChange(event: string): void {
        this.authService.setDefaultSubscriptionType(event);
        this.changedSubscription.emit(event);
    }
}
