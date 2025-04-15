export interface UserInterface {
    id: string,
    email: string,
    username: string,
    password?: string,
    avatar?: {
        url: string;
        localPath: string;
        id: string;
    };
}