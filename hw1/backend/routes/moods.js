const express = require("express");
const router = express.Router();
const Mood = require("../models/mood");

router.get("/", async (req, res) => {
  try {
    const moods = await Mood.find();
    res.json(moods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
