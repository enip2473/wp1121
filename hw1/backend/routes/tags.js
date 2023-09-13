const express = require('express');
const router = express.Router();
const Tag = require('../models/tag');

router.get('/', async (req, res) => {
    try {
        const tags = await Tag.find();
        res.json(tags);
    } catch (error) {
    res.status(500).json({ error: error.message });
    }
});

module.exports = router;
