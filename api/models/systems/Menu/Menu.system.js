const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const menuSchema = new Schema({
    label: { type: String, required: true },
    url: { type: String, required: true },
    disable: { type: Boolean, required: true, default: false },
    created: { type: Date, required: true, default: Date.now() }
}, {collection: "MenuSystem"});

module.exports = mongoose.model("MenuSystem", menuSchema);