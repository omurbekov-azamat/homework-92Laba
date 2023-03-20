export interface RegisterMutation {
    username: string;
    password: string;
    displayName: string;
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

export interface RegisterResponse {
    message: string;
    user: User;
}

export interface User {
    _id: string;
    username: string;
    displayName: string;
    token: string;
    role: string;
}

export interface LoginMutation {
    username: string;
    password: string;
}

export interface IncomingMessage {
    type: string;
    payload: {
        message: string;
        data: User | ValidationError | string | Online[];
    }
}

export interface Online {
    _id: string;
    displayName: string
}