const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    categories: [ {type: String, require: true} ],
    description: { type: String, required: true },
    paragraph: { type: String, required: true },
    author: { type: String, required: true },
    reaction: {
        good: { type: Number, default: 0 },
        notGood: { type: Number, default: 0 }
    },
    thumbnail: { type: String, required: true },
    disable: { type: Boolean, required: true, default: false },
    created: { type: Date, required: true, default: Date.now() }
}, {collection: "Blog"});

module.exports = mongoose.model("Blog", blogSchema);