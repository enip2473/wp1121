const cors = require("cors"); // Import the cors middleware
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const postsRoute = require("./routes/posts"); // Import the posts routes
const tagRoute = require("./routes/tags");
const moodRoute = require("./routes/moods");
const Tag = require("./models/tag");
const Mood = require("./models/mood");

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

const defaulttags = async () => {
  let tags = ["學業", "人際", "社團"];
  let moods = ["快樂", "生氣", "難過"];
  for (const tag of tags) {
    const existingTag = await Tag.findOne({ name: tag });
    if (!existingTag) {
      const newTag = new Tag({ name: tag });
      await newTag.save();
    }
  }
  for (const mood of moods) {
    const existingMood = await Mood.findOne({ name: mood });
    if (!existingMood) {
      const newMood = new Mood({ name: mood });
      await newMood.save();
    }
  }
}
defaulttags();

// Middleware
app.use(bodyParser.json({limit: '50mb'}));
app.use("/posts", postsRoute);
app.use("/tags", tagRoute);
app.use("/moods", moodRoute);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
