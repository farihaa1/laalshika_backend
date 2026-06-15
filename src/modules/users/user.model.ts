import { model, Schema } from "mongoose";
import { IUser } from "./user.interface";

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true,
        trim: true,
        min: 5,
        max: 15
    },
    email: {
        type: String,
        required: true,
        // validate
        validate: {
            validator: function (email) {
                const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
                return regex.test(email);
            },
            message: props => `${props.value} is not a valid email!`,

        },
        immutable: true,
        unique: [true, "email already exist"]
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: { values: ["Admin", "Customer"], message: "{VALUE} is not acceptable" },
        required: true
    },
})

const User = model<IUser>("user", userSchema);
export default User;