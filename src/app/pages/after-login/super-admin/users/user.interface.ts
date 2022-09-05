export interface IUserActionRow {
    userId: string;
    companyRowId: string;
    subscriptionType: string;
    isRegisteredUser: boolean;
    companyId: string;
    channelId: string;
    staffingId?: string[];
    bcNodeInfo?: string;
    channels?: string[];
    organizationName: string;
}
