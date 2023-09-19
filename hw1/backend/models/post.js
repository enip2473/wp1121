const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: Date,
  tags: [String],
  moods: [String],
  photo: String, // Store the file path
  lastModified: Date,
});


module.exports = mongoose.model('Post', postSchema);
