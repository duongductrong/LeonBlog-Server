const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: false },
    social: [{ name: String, url: String }],
    permission: { type: String, required: true },
    created: { type: Date, required: true, default: Date.now() },
    disable: { type: Boolean, required: false, default: false }
}, {collection:"User"});

module.exports = mongoose.model("User", userSchema);