import { Component, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';
import { IProject } from 'src/app/@core/interfaces/manage-project.interface';
import { FileService } from 'src/app/@core/services';

@Component({
    selector: 'app-project-detail',
    templateUrl: './view-project.component.html',
    styleUrls: ['./view-project.component.scss']
})
export class ViewProjectComponent implements OnInit {
    projectDetails!: Partial<IProject>;
    projectData!: IProject;

    constructor(private ref: NbDialogRef<ViewProjectComponent>, private readonly fileService: FileService) {}
    ngOnInit(): void {
        this.buildProjectDetails(this.projectData);
    }

    buildProjectDetails(project: IProject): void {
        this.projectDetails = {
            name: project.name,
            details: project.details,
            domain: project.domain,
            purpose: project.purpose,
            status: project.status,
            members: project.members,
            updatedAt: project.updatedAt,
            createdAt: project.createdAt,
            projectVersions: project.projectVersions
        };
    }

    closeModel(): void {
        this.ref.close();
    }

    openDocs(filename: string): void {
        this.fileService.getFileFromFolder(filename).subscribe((file: Blob) => {
            const urlCreator = window.URL || window.webkitURL;
            const url = urlCreator.createObjectURL(file);
            window.open(url);
            urlCreator.revokeObjectURL(url);
        });
    }
}
