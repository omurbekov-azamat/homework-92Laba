import express from "express";
import crypto from "crypto";
import {OAuth2Client} from "google-auth-library";
import config from "../config";
import User from "../modules/User";

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

export default usersRouter;