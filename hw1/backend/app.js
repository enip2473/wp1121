const cors = require("cors"); // Import the cors middleware
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const postsRoute = require("./routes/posts"); // Import the posts routes
const tagRoute = require("./routes/tags");
const moodRoute = require("./routes/moods");

// Require the file upload router
dotenv.config();
const app = express();
app.use(cors());

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/posts", postsRoute);
app.use("/tags", tagRoute);
app.use("/moods", moodRoute);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
