import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CompareTestAccuracyDetailPipe } from './compare-test-accuracy-details.pipe';
import { CompareTestAccuracyPipe } from './compare-test-accuracy.pipe';
import { DateOfBirthPipe } from './date-of-birth.pipe';
import { SafeURLPipe } from './safe-url.pipe';

@NgModule({
    imports: [CommonModule],
    declarations: [SafeURLPipe, DateOfBirthPipe, CompareTestAccuracyPipe, CompareTestAccuracyDetailPipe],
    exports: [SafeURLPipe, DateOfBirthPipe, CompareTestAccuracyPipe, CompareTestAccuracyDetailPipe]
})
export class CustomPipeModule {}
