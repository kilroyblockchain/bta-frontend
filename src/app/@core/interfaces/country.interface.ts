export interface ICountry {
    _id: number;
    states: Array<number>;
    countryCode: string;
    name: string;
}

export interface IState {
    _id: string;
    name: string;
    abbreviation: string;
    countryObjectId: string;
}
