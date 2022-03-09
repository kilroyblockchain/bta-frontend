export interface IDetailCard {
    caseNo?: string;
    name: string;
    informations: Array<IDetailInformation>;
    blockchainVerified?: boolean;
}

export interface IDetailInformation {
    label: string;
    values: Array<{
        value: string;
        tooltipText?: string;
    }>;
}
