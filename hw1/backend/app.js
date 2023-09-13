const cors = require('cors'); // Import the cors middleware
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const postsRoute = require('./routes/posts'); // Import the posts routes
const photoRoute = require('./routes/photos');
const tagRoute = require('./routes/tags');

// Require the file upload router
const app = express();
app.use(cors());
app.use('/uploads', express.static('uploads'));
// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myblog', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/posts', postsRoute); // Use the posts routes
app.use('/photos', photoRoute); // Use the posts routes
app.use('/tags', tagRoute); // Use the posts routes

// Start the server
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});  