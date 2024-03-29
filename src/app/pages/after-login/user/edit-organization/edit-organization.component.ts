import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { NbDialogRef } from '@nebular/theme';
import { AuthService, UtilsService } from 'src/app/@core/services';
import { CountryService } from 'src/app/@core/services/country.service';
import { MSG_KEY_CONSTANT_ORGANIZATION } from 'src/app/@core/constants/message-key-constants';
import { finalize } from 'rxjs/operators';
import { IFormControls } from 'src/app/@core/interfaces/common.interface';
import { ICountry, IState } from 'src/app/@core/interfaces/country.interface';

const BASE_URL = environment.apiURL + '/files/';
@Component({
    templateUrl: './edit-organization.component.html',
    styleUrls: ['./edit-organization.component.scss']
})
export class EditOrganizationComponent implements OnInit {
    appTitle = environment.project;
    public editOrganizationForm!: FormGroup;
    organizationId!: string;
    countries!: Array<ICountry>;
    states!: Array<IState>;
    loading!: boolean;
    submitted!: boolean;
    stateRequiredErr!: boolean;
    logoURL!: string;
    imageBaseUrl = BASE_URL;
    constructor(protected ref: NbDialogRef<EditOrganizationComponent>, private readonly fb: FormBuilder, private countryService: CountryService, private readonly authService: AuthService, private readonly utilsService: UtilsService) {}

    ngOnInit(): void {
        this.generateOrganizationForm();
        this.populateCountries();
        this.getOrganizationDetailById(this.organizationId);
    }

    generateOrganizationForm(): void {
        this.editOrganizationForm = this.fb.group({
            companyName: ['', [Validators.required]],
            country: [null],
            state: [null],
            city: [''],
            address: [''],
            zipCode: [''],
            companyLogo: [''],
            image: ['']
        });
    }

    get UF(): IFormControls {
        return this.editOrganizationForm.controls;
    }

    populateCountries(): void {
        this.countryService.getAllCountries().subscribe((res) => {
            if (res && res.success) {
                this.countries = res.data;
            }
        });
    }

    populateStates(countryId: string): void {
        if (countryId) {
            this.states = [];
            this.countryService.getStatesByCountryId(countryId).subscribe((res) => {
                if (res && res.success) {
                    this.states = res.data;
                }
            });
        }
    }

    onSelectChange(countryId: string): void {
        this.editOrganizationForm.patchValue({
            state: null
        });
        this.populateStates(countryId);
    }

    getOrganizationDetailById(organizationId: string): void {
        this.loading = true;
        this.authService
            .getOrganizationById(organizationId)
            .pipe(
                finalize(() => {
                    this.loading = false;
                })
            )
            .subscribe({
                next: (res) => {
                    const { data } = res;
                    if (data) {
                        if (data) {
                            this.populateStates(data.country as string);
                        }
                        this.editOrganizationForm.patchValue({
                            companyName: data.companyName,
                            country: data.country,
                            state: data.state,
                            city: data.city,
                            address: data.address,
                            zipCode: data.zipCode
                        });
                        if (data.companyLogo) {
                            this.logoURL = this.imageBaseUrl + data.companyLogo;
                        }
                    } else {
                        this.utilsService.showToast('warning', MSG_KEY_CONSTANT_ORGANIZATION.ORGANIZATION_NOT_FOUND);
                    }
                },
                error: () => {
                    this.utilsService.showToast('warning', MSG_KEY_CONSTANT_ORGANIZATION.ORGANIZATION_NOT_FOUND);
                }
            });
    }

    onFileChange(event: Event): void {
        if (event && event.target && (event.target as HTMLInputElement).files) {
            const files = (event.target as HTMLInputElement).files as FileList;
            if (files.length > 0) {
                const file = files[0];
                this.editOrganizationForm.patchValue({
                    image: file
                });

                const reader = new FileReader();

                reader.readAsDataURL(files[0]);

                reader.onload = (e: ProgressEvent<FileReader>) => {
                    this.logoURL = (e.target as FileReader).result as string;
                };
            }
        }
    }

    closeModal(): void {
        this.ref.close('close');
    }

    updateOrganizationFormSubmit({ value, valid }: FormGroup): void {
        this.submitted = true;
        if (value.country && !value.state) {
            this.stateRequiredErr = true;
            return;
        } else {
            this.stateRequiredErr = false;
        }
        if (!valid) {
            return;
        }
        let formData;
        let hasFormData: boolean;
        if (this.UF['image'].value) {
            hasFormData = true;
            formData = new FormData();
            for (const property of Object.keys(this.UF)) {
                formData.append(property, this.UF[property].value);
            }
        } else {
            hasFormData = false;
            formData = { ...value };
        }
        formData.state = formData.state ? String(formData.state) : '';
        this.loading = true;
        this.authService.updateOrganization(this.organizationId, formData, hasFormData).subscribe({
            next: (res) => {
                const { data } = res;
                this.loading = false;
                value._id = this.organizationId;
                this.ref.close({ saveSuccess: true, data: data });
                this.utilsService.showToast('success', MSG_KEY_CONSTANT_ORGANIZATION.SUCCESSFULLY_UPDATED_ORGANIZATION);
            },
            error: (err) => {
                this.loading = false;
                this.utilsService.showToast('warning', err?.message);
            }
        });
    }
}
