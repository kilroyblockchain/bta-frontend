import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ITestMetrics } from '../interfaces/manage-project.interface';

@Pipe({
    name: 'compareTestAccuracyDetail'
})
export class CompareTestAccuracyDetailPipe implements PipeTransform {
    constructor(private translate: TranslateService) {}

    public transform(testMetricsData: ITestMetrics, lastExperimentTestMetricsData: ITestMetrics, isAIEngineer: string): string {
        if (testMetricsData?.test_accuracy > lastExperimentTestMetricsData?.test_accuracy) {
            const greaterValue = Number(testMetricsData?.test_accuracy) - Number(lastExperimentTestMetricsData?.test_accuracy);
            return isAIEngineer === 'true' ? this.translate.instant('MANAGE_PROJECTS.MODEL_REVIEW.MESSAGE.AI_IS_GREATER_VALUE', { greaterValue }) : this.translate.instant('MANAGE_PROJECTS.MODEL_REVIEW.MESSAGE.MLOPS_IS_GREATER_VALUE', { greaterValue });
        } else if (testMetricsData?.test_accuracy < lastExperimentTestMetricsData?.test_accuracy) {
            const greaterValue = Number(lastExperimentTestMetricsData?.test_accuracy) - Number(testMetricsData?.test_accuracy);
            return isAIEngineer === 'true' ? this.translate.instant('MANAGE_PROJECTS.MODEL_REVIEW.MESSAGE.MLOPS_IS_GREATER_VALUE', { greaterValue }) : this.translate.instant('MANAGE_PROJECTS.MODEL_REVIEW.MESSAGE.AI_IS_GREATER_VALUE', { greaterValue });
        } else if (testMetricsData?.test_accuracy === lastExperimentTestMetricsData?.test_accuracy && testMetricsData?.test_accuracy !== undefined && lastExperimentTestMetricsData?.test_accuracy != undefined) {
            return this.translate.instant('MANAGE_PROJECTS.MODEL_REVIEW.MESSAGE.BOTH_ARE_EQUAL');
        } else {
            return '';
        }
    }
}
