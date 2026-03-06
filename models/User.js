import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },

    FirstName: {
        type: String,
        required: true,
    },
    LastName: {
        type: String,   
        required: true,
    },

    password: {
        type: String,
        required: true,
    },
    
    isBlocked: {
        type: Boolean,
        default: false,
    },

    Type: {
        type: String,
        enum: ['Admin', 'Customer'],
        default: 'Customer',
    },

    profilePicture: {
        type: String,
        default: 'https://static.vecteezy.com/system/resources/previews/021/548/095/original/default-profile-picture-avatar-user-avatar-icon-person-icon-head-icon-profile-picture-icons-default-anonymous-user-male-and-female-businessman-photo-placeholder-social-network-avatar-portrait-free-vector.jpg',
    },
}

);

const User = mongoose.model('User', userSchema);

export default User;


