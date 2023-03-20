import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../app/hook";
import {
    catchLoginError, catchRegisterError,
    register, selectToken, selectUser,
    selectUserLoginMutation,
    selectUserRegisterMutation
} from "../features/users/usersSlice";
import AppToolbar from "../components/UI/AppToolbar/AppToolbar";
import ModalCover from "../components/UI/ModalCover/ModalCover";
import Chat from '../container/Chat'
import {IncomingMessage, Online, User, ValidationError} from "../types";

const Home = () => {
    const dispatch = useAppDispatch();
    const registerState = useAppSelector(selectUserRegisterMutation);
    const loginState = useAppSelector(selectUserLoginMutation);
    const token = useAppSelector(selectToken);
    const navigate = useNavigate();
    const user = useAppSelector(selectUser)

    const [state, setState] = useState<Online[]>([]);
    const ws = useRef<null | WebSocket>(null);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8000/chat');

        ws.current.onclose = () => {
            console.log('ws closed')
        };

        ws.current.onmessage = (event) => {
            const decodedMessage = JSON.parse(event.data) as IncomingMessage;
            if (decodedMessage.type === 'NEW_USER' || decodedMessage.type === 'USERNAME_PASSWORD CORRECT') {
                if (decodedMessage.payload.message === 'Successfully!') {
                    const responseRegister = decodedMessage.payload.data as User;
                    dispatch(register(responseRegister));
                    if (responseRegister) {
                        if (!ws.current) return;

                        ws.current.send(JSON.stringify({
                            type: 'LOGIN',
                            payload: {
                                message: 'login',
                                data: responseRegister.token,
                            }
                        }));
                    }
                    navigate('/');
                }
            }
            if (decodedMessage.type === 'VALIDATION_ERROR') {
                if (decodedMessage.payload.data.hasOwnProperty('errors')) {
                    const responseError = decodedMessage.payload.data as ValidationError;
                    dispatch(catchRegisterError(responseError));
                }
            }
            if (decodedMessage.type === 'USERNAME_NOT_FOUND' || decodedMessage.type === 'PASSWORD_IS_WRONG') {
                if (decodedMessage.payload.message === 'Something wrong!') {
                    const response = decodedMessage.payload.data as string;
                    dispatch(catchLoginError(response));
                }
            }
            if (decodedMessage.type === 'ONLINE') {
                if (decodedMessage.payload.message === 'online') {
                    const responseOnlineUser = decodedMessage.payload.data as Online[];
                    setState(responseOnlineUser);
                }
            }
        }

        return () => {
            if (ws.current) {
                ws.current?.close();
            }
        };
    }, []);

    useEffect(() => {
        if (registerState) {
            if (!ws.current) return;

            ws.current.send(JSON.stringify({
                type: 'REGISTER',
                payload: {
                    message: 'sign_up',
                    data: registerState,
                },
            }));
        }
        if (loginState) {
            if (!ws.current) return;
            ws.current?.send(JSON.stringify({
                type: 'SESSIONS',
                payload: {
                    message: 'sign_in',
                    data: loginState,
                },
            }));
        }
        if (token) {
            if (!ws.current) return;

            ws.current.send(JSON.stringify({
                type: 'LOGOUT',
                payload: {
                    message: 'logout',
                    data: token,
                },
            }));
        }
    }, [registerState, loginState, token]);

    return (
        <>
            <AppToolbar/>
            <ModalCover/>
            {user && <Chat userOnline={state}/>}
        </>

    );
};

export default Home;