const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {type: String, unique: true}, //unique: true --> only one user with a specific username
    password: String,
}, {timestamps: true});


module.exports = mongoose.model('User', UserSchema);

// User --> name of the cluster
//UserSchema --> template used for creating it