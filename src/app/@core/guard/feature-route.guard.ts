import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { ACCESS_TYPE } from '../constants';
import { UtilsService } from '../services/utils.service';

@Injectable({
    providedIn: 'root'
})
export class FeatureRouteGuard implements CanActivate {
    constructor(private readonly utilsService: UtilsService) {}

    async canActivate(route: ActivatedRouteSnapshot): Promise<boolean> {
        const activated = await this.utilsService.canAccessFeature(route.data['featureIdentifier'], [...(route.data['accessType'] && route.data['accessType'].length ? route.data['accessType'] : [ACCESS_TYPE.READ])]);
        return activated;
    }
}
