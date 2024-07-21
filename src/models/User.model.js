import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    DOB: {
        type: Date,
        required: true
    },
    date_of_registration: {
        type: Date,
        default: Date.now
    },
    monthly_salary: {
        type: Number,
        required: true
    },
    purchase_power: {
        type: Number,
        default: 0,
    },

    status: {
        type: String,
        default: "pending",
        enum: ["pending", "approved", "rejected"]
    },

},
    {
        timestamps: true
    }
);

const User = mongoose.model('User', userSchema);
export default User;