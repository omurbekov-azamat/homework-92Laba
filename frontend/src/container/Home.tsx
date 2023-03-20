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
import {IncomingMessage, Message, Online, User, ValidationError} from "../types";

const Home = () => {
    const dispatch = useAppDispatch();
    const registerState = useAppSelector(selectUserRegisterMutation);
    const loginState = useAppSelector(selectUserLoginMutation);
    const token = useAppSelector(selectToken);
    const navigate = useNavigate();
    const user = useAppSelector(selectUser);

    const [state, setState] = useState<Online[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const ws = useRef<null | WebSocket>(null);

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8000/chat');

        ws.current.onclose = () => {
            console.log('ws closed')
        };

        ws.current.onmessage = (event) => {
            const decodedMessage = JSON.parse(event.data) as IncomingMessage;
            if (decodedMessage.type === 'NEW_USER' || decodedMessage.type === 'USERNAME_PASSWORD CORRECT') {
                const responseRegister = decodedMessage.payload as User;
                dispatch(register(responseRegister));
                if (responseRegister) {
                    if (!ws.current) return;

                    ws.current.send(JSON.stringify({
                        type: 'LOGIN',
                        payload: responseRegister.token,
                    }));
                }
                navigate('/');
            }
            if (decodedMessage.type === 'VALIDATION_ERROR') {
                const responseError = decodedMessage.payload as ValidationError;
                dispatch(catchRegisterError(responseError));
            }
            if (decodedMessage.type === 'USERNAME_NOT_FOUND' || decodedMessage.type === 'PASSWORD_IS_WRONG') {
                const response = decodedMessage.payload as string;
                dispatch(catchLoginError(response));
            }
            if (decodedMessage.type === 'ONLINE') {
                const users = decodedMessage.payload as Online[];
                setState(users);
            }
            if (decodedMessage.type === 'EXISTING_MESSAGES') {
                const messages = decodedMessage.payload as Message[];
                setMessages(messages);
            }
            if (decodedMessage.type === 'SEND_MESSAGES') {
                const messages = decodedMessage.payload as Message[];
                setMessages(prev => (prev.concat(messages)));
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
                payload: registerState,
            }));
        }
        if (loginState) {
            if (!ws.current) return;
            ws.current?.send(JSON.stringify({
                type: 'SESSIONS',
                payload: loginState,
            }));
        }
        if (token) {
            if (!ws.current) return;

            ws.current.send(JSON.stringify({
                type: 'LOGOUT',
                payload: token
            }));
        }
    }, [registerState, loginState, token]);

    const onSubmit = (message: Message) => {
        if (!ws.current) return;
        ws.current.send(JSON.stringify({
            type: 'SEND_MESSAGE',
            payload: message,
        }));
    };

    return (
        <>
            <AppToolbar/>
            <ModalCover/>
            {user && <Chat userOnline={state} onSubmit={onSubmit} id={user._id} displayName={user.displayName} messages={messages}/>}
        </>

    );
};

export default Home;