const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema({
  name: String,
});

module.exports = mongoose.model("Mood", moodSchema);
