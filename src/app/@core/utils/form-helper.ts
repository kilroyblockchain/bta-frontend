import { AbstractControl, FormGroup, Validators } from '@angular/forms';

/**
 * A function to extract child formgroup from a fromgroup
 * @param group - FormGroup which has a propery which is also a formGroup
 * @param groupName - Name of a property which is a form group
 * @returns Return a formgroup from a Parent form group
 */
export const getFormGroup = (group: FormGroup, groupName: string): FormGroup => {
    return group.get(groupName) as FormGroup;
};

/**
 * A function to extract form control from a fromgroup
 * @param group - FormGroup which has a formcontrols
 * @param controlName - Name of a property which is a form control
 * @returns Return a formControl from a formgroup
 */
export const getFormControl = (group: FormGroup, controlName: string): AbstractControl => {
    return <AbstractControl>group.get(controlName);
};

/**
 * A function to check if formcontrol has a require validator
 * @param control - Form Control
 * @returns Return true if formcontrol has require validator else return false
 */
export const hasRequireValidator = (control: AbstractControl): boolean => {
    return control.hasValidator(Validators.required);
};

/**
 * Function to convert date to localDate string
 * @param  dob
 * @returns Return locale date string
 */
export const dateOfBirthParser = (dob: Date): string => {
    if (dob) {
        const dobWithZeroTime = new Date(new Date(dob).setHours(0, 0, 0, 0));
        return dobWithZeroTime.toLocaleDateString();
    }
    return dob;
};

/**
 * Function to copy utc date same in client
 * @param dob
 * @returns
 */
export const clientDateOfBirth = (dob: Date): Date => {
    if (dob) {
        return new Date(new Date(dob).getTime() + new Date().getTimezoneOffset() * 60 * 1000);
    }
    return dob;
};
