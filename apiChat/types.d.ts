import {WebSocket} from 'ws';
import {ObjectId} from "mongoose";

export interface IUser {
    username: string;
    password: string;
    token: string;
    role: string;
    displayName: string;
    googleId?: string;
    online: boolean;
}

export interface ActiveConnections {
    [id: string]: WebSocket;
}

export interface UserMessage {
    _id: string;
    message: string;
}

export interface ISession {
    username: string;
    password: string;
}

export interface IncomingMessage {
    type: string;
    payload: IUser | UserMessage | ISession | string;
}

export interface IMessage {
    user: ObjectId;
    message: string;
}