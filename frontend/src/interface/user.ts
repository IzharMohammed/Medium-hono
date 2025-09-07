export interface UserInterface {
    id: string,
    email: string,
    username?: string,
    name: string,
    password?: string,
    avatar?: {
        url: string;
        localPath: string;
        id: string;
    };
}