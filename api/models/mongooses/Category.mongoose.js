const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, required: false },
    thumbnail: { type: String, required: true },
    created: { type: Date, required: true, default: Date.now() },
    disable: { type: Boolean, required: true, default: false }
}, {collection: "Category"});

module.exports = mongoose.model("Category", categorySchema);