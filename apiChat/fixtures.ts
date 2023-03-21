import mongoose from "mongoose";
import config from "./config";
import crypto from "crypto";
import User from "./modules/User";
import Message from "./modules/Message";

const run = async () => {
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.db);
    const db = mongoose.connection;

    try {
        await db.dropCollection('users');
        await db.dropCollection('messages');
    } catch (e) {
        console.log('Collections were not present, skipping drop...');
    }

    const [moderator, user] = await User.create({
        username: 'moderator',
        password: '123',
        displayName: 'Moderator',
        role: 'moderator',
        token: crypto.randomUUID(),
    }, {
        username: 'user',
        password: '123',
        displayName: 'user',
        token: crypto.randomUUID(),
    });

    await Message.create({
        user: moderator._id,
        message: 'Hi, im Moderator',
    }, {
        user: user._id,
        message: 'Hi Moderator, im User',
    });

    await db.close();
};

void run();