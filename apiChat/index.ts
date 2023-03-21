import cors from 'cors';
import express from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import config from "./config";
import usersRouter, {registerUser, sessionUser} from "./routers/users";
import expressWs from "express-ws";
import User from "./modules/User";
import Message from "./modules/Message";
import {ActiveConnections, IncomingMessage, UserMessage} from "./types";

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
                void registerUser(activeConnections[id], decodeMessage);
                break;
            case 'SESSIONS':
                void sessionUser(activeConnections[id], decodeMessage);
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
                            const messagesData = await Message.find().populate({
                                path: 'user',
                                select: 'displayName'
                            }).limit(30);
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
                        payload: [],
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