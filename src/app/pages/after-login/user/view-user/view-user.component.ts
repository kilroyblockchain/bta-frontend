import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NbDialogRef } from '@nebular/theme';

const BASE_URL = environment.apiURL + '/files/';
@Component({
    selector: 'app-view-user-detail',
    templateUrl: './view-user.component.html',
    styleUrls: ['./view-user.component.scss']
})
export class ViewUserComponent {
    user: any;
    imageBaseUrl = BASE_URL;
    componentTitle!: string;

    constructor(private ref: NbDialogRef<ViewUserComponent>) {}

    closeModel(): void {
        this.ref.close();
    }
}
