import {Model, model, Schema} from "mongoose";
import bcrypt from 'bcrypt';
import {randomUUID} from "crypto";
import {IUser} from "../types";

const SALT_WORK_FACTOR = 10;

interface IUserMethods {
    generateToken(): void;
    checkPassword(password: string): Promise<boolean>;
}

type UserModel = Model<IUser, {}, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel, IUserMethods>({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
        default: 'user',
        enum: ['user', 'moderator'],
    },
    displayName: {
        type: String,
        required: true,
    },
    googleId: String,
    avatar: String,
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);

    next();
});

UserSchema.set('toJSON', {
    transform: (_, ret) => {
        delete ret.password;
        return ret;
    }
});

UserSchema.methods.generateToken = function () {
    this.token = randomUUID();
};
UserSchema.methods.checkPassword = function (password) {
    return bcrypt.compare(password, this.password);
};

const User = model<IUser, UserModel>('User', UserSchema);
export default User;