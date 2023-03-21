import cors from 'cors';
import express from "express";
import mongoose, {Error} from "mongoose";
import crypto from "crypto";
import config from "./config";
import usersRouter from "./routers/users";
import expressWs from "express-ws";
import User from "./modules/User";
import {ActiveConnections, IncomingMessage, ISession, IUser, UserMessage} from "./types";
import Message from "./modules/Message";

const app = express();
const port = 8000;

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use('/users', usersRouter);
expressWs(app);
const router = express.Router();
const activeConnections: ActiveConnections = {};
const db = mongoose.connection;

router.ws('/chat', (ws) => {
    const id = crypto.randomUUID();
    activeConnections[id] = ws;
    console.log('Client connected! id =', id);

    ws.on('message', async (messages) => {
        const decodeMessage = JSON.parse(messages.toString()) as IncomingMessage;
        const conn = activeConnections[id];
        switch (decodeMessage.type) {
            case 'REGISTER':
                const register = decodeMessage.payload as IUser;
                try {
                    const user = await User.create({
                        username: register.username,
                        password: register.password,
                        displayName: register.displayName,
                        token: crypto.randomUUID(),
                    });
                    conn.send(JSON.stringify({
                        type: 'NEW_USER',
                        payload: user,
                    }));
                } catch (error) {
                    if (error instanceof Error.ValidationError) {
                        conn.send(JSON.stringify({
                            type: 'VALIDATION_ERROR',
                            payload: error,
                        }));
                    }
                }
                break;
            case 'SESSIONS':
                const session = decodeMessage.payload as ISession;
                const user = await User.findOne({username: session.username});
                if (!user) {
                    conn.send(JSON.stringify({
                        type: 'USERNAME_NOT_FOUND',
                        payload: 'Username is not found',
                    }));
                }

                if (user) {
                    const isMatch = await user.checkPassword(session.password);

                    if (!isMatch) {
                        conn.send(JSON.stringify({
                            type: 'PASSWORD_IS_WRONG',
                            payload: {
                                message: 'Something wrong!',
                                data: 'Password is wrong',
                            },
                        }));
                    }

                    if (isMatch) {
                        user.generateToken();
                        await user.save();
                        conn.send(JSON.stringify({
                            type: 'USERNAME_PASSWORD_CORRECT',
                            payload: user,
                        }));
                    }
                }
                break;
            case 'LOGOUT':
                const token = decodeMessage.payload as string;
                const success = {message: 'OK'};

                if (!token) {
                    conn.send(JSON.stringify({
                        type: 'OK',
                        payload: success,
                    }));
                }

                if (token) {
                    const user = await User.findOne({token});

                    if (!user) {
                        conn.send(JSON.stringify({
                            type: 'OK',
                            payload: success,
                        }));
                    }

                    if (user) {
                        user.generateToken();
                        user.online = false;
                        await user.save();
                        conn.send(JSON.stringify({
                            type: 'OK',
                            payload: success,
                        }));

                        const users = await User.find({online: true}).select('displayName');

                        if (users) {
                            Object.keys(activeConnections).forEach(id => {
                                const conn = activeConnections[id];
                                conn.send(JSON.stringify({
                                    type: 'ONLINE',
                                    payload: users,
                                }));
                            });
                        }
                    }
                }
                break;
            case 'LOGIN':
                const loginToken = decodeMessage.payload as string;
                if (!loginToken) {
                    conn.send(JSON.stringify({
                        type: 'TOKEN',
                        payload: 'No token!'
                    }));
                }

                if (loginToken) {
                    const user = await User.findOne({token: loginToken});

                    if (!user) {
                        conn.send(JSON.stringify({
                            type: 'TOKEN',
                            payload: 'Wrong token!'
                        }));
                    }

                    if (user) {
                        user.online = true;
                        await user.save();

                        const users = await User.find({online: true}).select('displayName');

                        if (!users) {
                            conn.send(JSON.stringify({
                                type: 'ONLINE',
                                payload: 'There is on online users'
                            }));
                        }

                        if (users) {
                            const messagesData = await Message.find().populate({path: 'user', select: 'displayName'}).limit(30);
                            Object.keys(activeConnections).forEach(id => {
                                const conn = activeConnections[id];
                                conn.send(JSON.stringify({
                                    type: 'ONLINE',
                                    payload: users,
                                }));
                                conn.send(JSON.stringify({
                                    type: 'EXISTING_MESSAGES',
                                    payload: messagesData,
                                }));
                            });
                        }
                    }
                }
                break;
            case 'SEND_MESSAGE':
                const responseMessage = decodeMessage.payload as UserMessage;

                const message = new Message({
                    user: responseMessage._id,
                    message: responseMessage.message,
                });
                await message.save();
                const result = await Message.findById(message._id).populate({path: 'user', select: 'displayName'});
                Object.keys(activeConnections).forEach(id => {
                    const conn = activeConnections[id];
                    conn.send(JSON.stringify({
                        type: 'SEND_MESSAGES',
                        payload: [result]
                    }));
                });
                break;
            case 'MODERATOR_CLEAR':
                await db.dropCollection('messages');
                Object.keys(activeConnections).forEach(id => {
                    const conn = activeConnections[id];
                    conn.send(JSON.stringify({
                        type: 'CLEAR_MESSAGES',
                        payload: []
                    }));
                });
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