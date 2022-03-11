import { Component } from '@angular/core';

@Component({
    selector: 'app-billing',
    templateUrl: './billing.component.html',
    styleUrls: ['./billing.component.scss']
})
export class BillingComponent {
    paymentOptions = [
        { value: '1', label: '$15 per month' },
        { value: '2', label: '$42 per 3 months' },
        { value: '3', label: '$78 per 6 months' },
        { value: '4', label: '$120 per year' }
    ];
    paymentMethodOptions = [
        { value: '1', label: 'Credit / Debit Card', icon: 'credit-cards' },
        { value: '2', label: 'Paypal', icon: 'paypal' },
        { value: '3', label: 'Google Pay', icon: 'google-pay' },
        { value: '4', label: 'Visa Card', icon: 'visa' },
        { value: '5', label: 'Master Card', icon: 'mastercard' }
    ];
    paymentOption!: { label: string; value: string }[];
    paymentMethodOption!: { label: string; value: string; icon: string }[];
}
