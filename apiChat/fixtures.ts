import mongoose from "mongoose";
import config from "./config";
import crypto from "crypto";
import User from "./modules/User";

const run = async () => {
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.db);
    const db = mongoose.connection;

    try {
        await db.dropCollection('users');
    } catch (e) {
        console.log('Collections were not present, skipping drop...');
    }

    await User.create({
        username: 'moderator',
        password: '123',
        displayName: 'Moderator',
        role: 'moderator',
        token: crypto.randomUUID(),
    });

    await db.close();
};

void run();