import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DateOfBirthPipe } from './date-of-birth.pipe';
import { SafeURLPipe } from './safe-url.pipe';

@NgModule({
    imports: [CommonModule],
    declarations: [SafeURLPipe, DateOfBirthPipe],
    exports: [SafeURLPipe, DateOfBirthPipe]
})
export class CustomPipeModule {}
