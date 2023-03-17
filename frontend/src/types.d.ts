export interface RegisterMutation {
    username: string;
    password: string;
    displayName: string;
    image: File | null;
}

export interface ValidationError {
    errors: {
        [key: string]: {
            name: string;
            message: string;
        }
    },
    message: string;
    name: string;
    _name: string;
}

export type GlobalError = {
    error: string;
}

export interface RegisterResponse {
    message: string;
    user: User;
}

export interface User {
    _id: string;
    username: string;
    displayName: string;
    avatar: string | null;
    token: string;
    role: string;
}