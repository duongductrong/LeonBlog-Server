const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subMenuSchema = new Schema({
    menu: { type: String, required: true },
    label: { type: String, required: true },
    url: { type: String, required: true },
    disable: { type: Boolean, required: true, default: false },
    created: { type: Date, required: true, default: Date.now() }
}, {collection: "SubmenuSystem"});

module.exports = mongoose.model("SubmenuSystem", subMenuSchema);