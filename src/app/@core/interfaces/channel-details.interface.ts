export interface IChannelDetails {
    _id: string;
    channelName: string;
    connectionProfileName: string;
    status: boolean;
    isDefault: boolean;
    createdBy: string;
    isCompanyChannel: boolean;
    updatedAt: Date;
    createdAt: Date;
}
