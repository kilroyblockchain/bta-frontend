import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { finalize } from 'rxjs';
import { IProjectVersion } from 'src/app/@core/interfaces/manage-project.interface';
import { ManageProjectService, UtilsService } from 'src/app/@core/services';

@Component({
    selector: 'app-project-version-detail',
    templateUrl: './view-project-version.component.html'
})
export class ViewProjectVersionComponent implements OnInit {
    versionDetails!: IProjectVersion;
    versionData!: IProjectVersion;
    loading!: boolean;

    constructor(private ref: NbDialogRef<ViewProjectVersionComponent>, private readonly manageProjectService: ManageProjectService, public utilsService: UtilsService) {}

    ngOnInit(): void {
        this.getVersionInfo(this.versionData._id);
    }

    getVersionInfo(versionId: string): void {
        this.loading = true;
        this.manageProjectService
            .getVersionInfo(versionId)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    const { data } = res;
                    this.versionDetails = data;
                },
                error: (err) => {
                    this.utilsService.showToast('warning', err?.message);
                }
            });
    }

    closeModel(): void {
        this.ref.close();
    }
}
