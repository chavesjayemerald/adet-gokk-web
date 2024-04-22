const mongoose = require("mongoose");
const mangaSchema = new mongoose.Schema({
    coverImg: {
        type: String,
        require: true,
    },
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    uploaded: {
        type: Date,
        default: Date.now,
        require: true,
    },
    chapters: {
        type: Array,
    },
});

module.exports = mongoose.model("Manga", mangaSchema);