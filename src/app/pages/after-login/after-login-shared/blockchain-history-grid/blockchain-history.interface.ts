export interface IBlockchainHistory {
    TxId: string;
    IsDelete: string;
    Timestamp: string;
    Value: {
        hash: string;
        payload: string;
        [key: string]: any;
    };
}
