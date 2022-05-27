export interface IAppResponse<T> {
    success: boolean;
    message: Array<string>;
    data: T;
    statusCode: number;
}

export interface IPaginateResult<T> {
    docs: Array<T>;
    page: number;
    limit: number;
    total: number;
    offset?: number;
    pages?: number;
}
