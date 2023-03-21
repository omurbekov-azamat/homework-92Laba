import React from "react";
import {AnyAction, ThunkDispatch} from "@reduxjs/toolkit";
import {catchLoginError, catchRegisterError, register} from "./features/users/usersSlice";
import {
    IncomingMessage,
    LoginMutation,
    MessageMutation,
    RegisterMutation,
    User,
    ValidationError
} from "./types";

export const websocketSend = (ws: React.MutableRefObject<WebSocket | null>, type: string, payload: string | RegisterMutation | LoginMutation | MessageMutation) => {
        if (!ws.current) return;

        ws.current?.send(JSON.stringify({
            type,
            payload,
        }));
};

export const checkOnMessage = (ws: React.MutableRefObject<WebSocket | null>, data: IncomingMessage, dispatch: ThunkDispatch<unknown, unknown, AnyAction>) => {
    if (data.type === 'NEW_USER' || data.type === 'USERNAME_PASSWORD_CORRECT') {
        const responseRegister = data.payload as User;
        dispatch(register(responseRegister));
        if (responseRegister) {
            websocketSend(ws, 'LOGIN', responseRegister.token);
        }
    }
    if (data.type === 'VALIDATION_ERROR') {
        const responseError = data.payload as ValidationError;
        dispatch(catchRegisterError(responseError));
    }
    if (data.type === 'USERNAME_NOT_FOUND' || data.type === 'PASSWORD_IS_WRONG') {
        const response = data.payload as string;
        dispatch(catchLoginError(response));
    }
}