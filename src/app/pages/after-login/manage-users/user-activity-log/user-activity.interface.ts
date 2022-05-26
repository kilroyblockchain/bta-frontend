export interface IUserActivity {
    _id: string;
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    userId: string;
    organization: { id: string; name: string };
    loggedInDate: Date;
    loggedOutDate: Date | null;
    blockchainVerified: boolean;
}
