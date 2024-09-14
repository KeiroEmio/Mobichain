import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true,
        index: true
    },
    name: String,
    avatar: String
});

const usersMapSchema = new mongoose.Schema({
    owner: {
        type: String,
        required: true
    },
    users: [userSchema]
});

const UsersMap = mongoose.model('UsersMap', usersMapSchema);

export default UsersMap;
