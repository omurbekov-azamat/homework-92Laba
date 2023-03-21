import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useAppDispatch, useAppSelector} from "../app/hook";
import {selectGoogleUser, selectToken, selectUser, selectUserLoginMutation, selectUserRegisterMutation} from "../features/users/usersSlice";
import AppToolbar from "../components/UI/AppToolbar/AppToolbar";
import ModalCover from "../components/UI/ModalCover/ModalCover";
import Chat from '../container/Chat'
import {checkOnMessage, websocketSend} from "../helpers";
import {IncomingMessage, Message, Online} from "../types";

const Home = () => {
    const dispatch = useAppDispatch();
    const registerState = useAppSelector(selectUserRegisterMutation);
    const loginState = useAppSelector(selectUserLoginMutation);
    const token = useAppSelector(selectToken);
    const user = useAppSelector(selectUser);
    const googleUser = useAppSelector(selectGoogleUser);

    const [state, setState] = useState<Online[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const ws = useRef<null | WebSocket>(null);

    const connect = useCallback(() => {
        ws.current = new WebSocket('ws://localhost:8000/chat');

        ws.current.onclose = (event) => {
            if (event.type === 'close'){
                setTimeout(function () {
                    connect();
                },1000)
            }
            console.log('ws closed');
        };

        ws.current.onmessage = (event) => {
            const decodedMessage = JSON.parse(event.data) as IncomingMessage;
            checkOnMessage(ws, decodedMessage, dispatch);
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
            if (decodedMessage.type === 'CLEAR_MESSAGES') {
                const messages = decodedMessage.payload as Message[];
                setMessages(messages);
            }
        }

        return () => {
            if (ws.current) {
                ws.current?.close();
            }
        };
    },[ws, checkOnMessage]);

    useEffect(() => {
        connect();
    }, [connect]);

    useEffect(() => {
        if (registerState) {
            websocketSend(ws, 'REGISTER', registerState);
        }
        if (loginState) {
            websocketSend(ws, 'SESSIONS', loginState);
        }
        if (token) {
            websocketSend(ws, 'LOGOUT', token);
        }
        if (googleUser) {
            websocketSend(ws, 'LOGIN', googleUser);
        }
    }, [registerState, loginState, token, googleUser]);

    return (
        <>
            <AppToolbar/>
            <ModalCover/>
            {user && <Chat ws={ws} userOnline={state} messages={messages}/>}
        </>
    );
};

export default Home;