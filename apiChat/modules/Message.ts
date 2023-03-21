import {IMessage} from "../types";
import {model, Schema, Types} from "mongoose";
import User from "./User";

const MessageSchema = new Schema<IMessage>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        validate: {
            validator: async (value: Types.ObjectId) => User.findById(value),
            message: 'User does not exist',
        },
    },
    message: {
        type: String,
        required: true,
    },
});

const Message = model('Message', MessageSchema);

export default Message;