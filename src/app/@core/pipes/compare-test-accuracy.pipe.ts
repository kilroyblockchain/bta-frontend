import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ITestMetrics } from '../interfaces/manage-project.interface';

@Pipe({
    name: 'compareTestAccuracy'
})
export class CompareTestAccuracyPipe implements PipeTransform {
    constructor(private translate: TranslateService) {}
    public transform(aiTestMetricsData: ITestMetrics, mlopsTestMetricsData: ITestMetrics): string {
        if (aiTestMetricsData?.test_accuracy > mlopsTestMetricsData?.test_accuracy) {
            const greaterValue = Number(aiTestMetricsData?.test_accuracy) - Number(mlopsTestMetricsData?.test_accuracy);
            return this.translate.instant('MANAGE_PROJECTS.MODEL_REVIEW.MESSAGE.AI_IS_GREATER_VALUE', { greaterValue });
        } else if (aiTestMetricsData?.test_accuracy < mlopsTestMetricsData?.test_accuracy) {
            const greaterValue = Number(mlopsTestMetricsData?.test_accuracy) - Number(aiTestMetricsData?.test_accuracy);
            return this.translate.instant('MANAGE_PROJECTS.MODEL_REVIEW.MESSAGE.MLOPS_IS_GREATER_VALUE', { greaterValue });
        } else if (aiTestMetricsData?.test_accuracy === mlopsTestMetricsData?.test_accuracy && aiTestMetricsData?.test_accuracy !== undefined && mlopsTestMetricsData?.test_accuracy != undefined) {
            return this.translate.instant('MANAGE_PROJECTS.MODEL_REVIEW.MESSAGE.BOTH_ARE_EQUAL');
        } else {
            return '';
        }
    }
}
