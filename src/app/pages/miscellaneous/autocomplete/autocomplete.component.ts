import { startWith, map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Input } from '@angular/core';

@Component({
    selector: 'app-autocomplete',
    template: `
        <nb-form-field class="form-holder floating">
            <input autocomplete="off" id="inputFormControl" name="inputFormControl" [placeholder]="'COMMON.LABEL.SEARCH_HERE' | translate" fullWidth [formControl]="inputFormControl" nbInput type="text" [nbAutocomplete]="autoControl" />
            <label for="inputFormControl" [attr.data-content]="'COMMON.LABEL.SEARCH_HERE' | translate"></label>
            <nb-autocomplete #autoControl (selectedChange)="onSelectChange($event)">
                <nb-option *ngFor="let option of filteredControlOptions$ | async" [value]="option._id">
                    {{ (option.firstName + ' ' + option.lastName | titlecase) + ',' + option.email }}
                </nb-option>
            </nb-autocomplete>
        </nb-form-field>
    `
})
export class AutocompleteComponent implements OnInit {
    @Input() options: any;
    @Input()
    selectedList!: Array<string>;
    @Output() selectedItem = new EventEmitter();
    filteredControlOptions$!: Observable<any[]>;
    inputFormControl!: FormControl;

    ngOnInit(): void {
        this.filteredControlOptions$ = of(this.options);
        this.inputFormControl = new FormControl();
        this.filteredControlOptions$ = this.inputFormControl.valueChanges.pipe(
            startWith(''),
            map((filterString) => this.filter(filterString))
        );
    }

    filter(value: string): any {
        const filterValue = value.toLowerCase();
        return this.options.filter((optionValue: any) => (optionValue.firstName + ' ' + optionValue.lastName + ',' + optionValue.email).toLowerCase().includes(filterValue));
    }

    onSelectChange(id: string): void {
        if (id) {
            this.selectedItem.emit(id);
        }
        if (this.inputFormControl.value && this.inputFormControl.value !== '') {
            this.inputFormControl.setValue('');
        }
    }
}
