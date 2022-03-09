import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/@core/services';

@Component({
    selector: 'app-user-accept',
    templateUrl: './user-accept.component.html',
    styleUrls: ['./user-accept.component.scss']
})
export class UserAcceptComponent implements OnInit {
    token: string;
    userData!: any;
    userAccept!: boolean;
    error!: boolean;
    verified!: boolean;
    errorMessage!: string;
    loading!: boolean;
    constructor(private authService: AuthService, private route: ActivatedRoute) {
        this.token = <string>this.route.snapshot.paramMap.get('token');
    }
    ngOnInit(): void {
        this.getDetailsFromToken();
    }
    getDetailsFromToken(): void {
        this.loading = true;
        this.authService.getVerificationDetails(this.token).subscribe({
            next: (res) => {
                this.loading = false;
                this.userData = res.data;
            },
            error: (err) => {
                this.loading = false;
                this.error = true;
                this.errorMessage = err?.message;
            }
        });
    }

    verify(): void {
        this.loading = true;
        this.authService.setUserAccept(this.token).subscribe({
            next: () => {
                this.loading = false;
                this.verified = true;
            },
            error: (err) => {
                this.loading = false;
                this.error = true;
                this.errorMessage = err?.message;
            }
        });
    }
}
