const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    message: { type: String, required: true },
    name: { type: String, required: true },
    website: { type: String, required: false },
    email: {type: String, required: false},
    blog: { type: String, required: true },
    disable: { type: Boolean, required: true, default: false },
    created: { type: Date, required: true, default: Date.now() }
}, { collection: "Comment" });

module.exports = mongoose.model("Comment", commentSchema)