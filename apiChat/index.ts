import cors from 'cors';
import express from "express";
import mongoose, {Error} from "mongoose";
import crypto from "crypto";
import config from "./config";
import usersRouter from "./routers/users";
import expressWs from "express-ws";
import User from "./modules/User";
import {ActiveConnections, IncomingMessage, ISession, IUser, UserMessage} from "./types";

const app = express();
const port = 8000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use('/users', usersRouter);
expressWs(app);
const router = express.Router();
const activeConnections: ActiveConnections = {};

const messages: UserMessage[] = [];

router.ws('/chat', (ws) => {
    const id = crypto.randomUUID();
    activeConnections[id] = ws;
    console.log('Client connected! id =', id);

    ws.send(JSON.stringify({
        type: 'EXISTING_MESSAGES',
        payload: messages,
    }));

    ws.on('message', async (messages) => {
        const decodeMessage = JSON.parse(messages.toString()) as IncomingMessage;
        const conn = activeConnections[id];
        switch (decodeMessage.type) {
            case 'REGISTER':
                if (decodeMessage.payload.message === 'sign_up') {
                    const register = decodeMessage.payload.data as IUser;
                    try {
                        const user = await User.create({
                            username: register.username,
                            password: register.password,
                            displayName: register.displayName,
                            token: crypto.randomUUID(),
                        });
                        conn.send(JSON.stringify({
                            type: 'NEW_USER',
                            payload: {
                                message: 'Successfully!',
                                data: user,
                            },
                        }));
                    } catch (error) {
                        if (error instanceof Error.ValidationError) {
                            conn.send(JSON.stringify({
                                type: 'VALIDATION_ERROR',
                                payload: {
                                    message: 'Validation error!',
                                    data: error,
                                },
                            }));
                        }
                    }
                }
                break;
            case 'SESSIONS':
                if (decodeMessage.payload.message === 'sign_in') {
                    const session = decodeMessage.payload.data as ISession;
                    const user = await User.findOne({username: session.username});
                    if (!user) {
                        conn.send(JSON.stringify({
                            type: 'USERNAME_NOT_FOUND',
                            payload: {
                                message: 'Something wrong!',
                                data: 'Username is not found',
                            },
                        }));
                    }

                    if (user) {
                        const isMatch = await user.checkPassword(session.password);

                        if (!isMatch) {
                            conn.send(JSON.stringify({
                                type: 'PASSWORD_IS_WRONG',
                                payload: {
                                    message:'Something wrong!',
                                    data: 'Password is wrong',
                                },
                            }));
                        }

                        if (isMatch) {
                            user.generateToken();
                            await user.save();
                            conn.send(JSON.stringify({
                                type: 'USERNAME_PASSWORD CORRECT',
                                payload: {
                                    message: 'Successfully!',
                                    data: user,
                                },
                            }));
                        }
                    }
                }
                break;
            case 'LOGOUT':
                if (decodeMessage.payload.message === 'logout') {
                    const token = decodeMessage.payload.data as string;
                    const success = {message: 'OK'};

                    if (!token) {
                        conn.send(JSON.stringify({
                            type: 'OK',
                            payload: success,
                        }));
                    }

                    const user = await User.findOne({token});

                    if (!user) {
                        conn.send(JSON.stringify({
                            type: 'OK',
                            payload: success,
                        }));
                    }

                    if (user) {
                        user.generateToken();
                        await user.save();
                        conn.send(JSON.stringify({
                            type: 'OK',
                            payload: success,
                        }));
                    }
                }
                break;
            default:
                console.log('Unknown type', decodeMessage.type);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected! id =', id);
        delete activeConnections[id];
    });
});
app.use(router);

const run = async () => {
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.db);

    app.listen(port, () => {
        console.log('We are live on ' + port);
    });

    process.on('exit', () => {
        mongoose.disconnect();
    });
};

run().catch(console.error);