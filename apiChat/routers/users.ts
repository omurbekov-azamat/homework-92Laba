import express from "express";
import crypto from "crypto";
import {OAuth2Client} from "google-auth-library";
import config from "../config";
import User from "../modules/User";
import {Error} from "mongoose";
import {WebSocket} from "ws";
import {IncomingMessage, ISession, IUser} from "../types";

const usersRouter = express.Router();

const client = new OAuth2Client(config.google.clientId);

usersRouter.post('/google', async (req, res, next) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: req.body.credential,
            audience: config.google.clientId,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            return res.status(400).send({error: 'Wrong Google token!'});
        }

        const email = payload['email'];
        const googleId = payload['sub'];
        const displayName = payload['name'];

        if (!email) {
            return res.status(400).send({error: 'Not enough user data'});
        }

        let user = await User.findOne({googleId});

        if (!user) {
            user = new User({
                username: email,
                password: crypto.randomUUID(),
                displayName,
                googleId,
            });
        }

        user.generateToken();
        await user.save();
        return res.send({message: 'Login with Google successful!', user});
    } catch (e) {
        return next(e);
    }
});

export const registerUser = async (act:WebSocket, data: IncomingMessage) => {
    const conn = act;
    const register = data.payload as IUser;
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
        }))
    } catch (error) {
        if (error instanceof Error.ValidationError) {
            conn.send(JSON.stringify({
                type: 'VALIDATION_ERROR',
                payload: error,
            }));
        }
    }
};

export const sessionUser = async (act:WebSocket, data: IncomingMessage) => {
    const conn = act;
    const session = data.payload as ISession;
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
                payload: 'Password is wrong'
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
};

export default usersRouter;