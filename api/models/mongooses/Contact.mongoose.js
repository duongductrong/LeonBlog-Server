const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: false },
    disable: { type: Boolean, required: true, default: false },
    created: { type: Date, required: true, default: Date.now() }
}, {collection: "Contact"});

module.exports = mongoose.model("Contact", contactSchema);