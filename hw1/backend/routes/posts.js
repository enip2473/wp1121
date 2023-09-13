const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Tag = require('../models/tag');

// Create a new post
router.post('/', async (req, res) => {
  try {
    const post = new Post(req.body);
    
    for (const tag of post.tags) {
      const existingTag = await Tag.findOne({ name: tag });
      if (!existingTag) {
        const newTag = new Tag({ name: tag });
        await newTag.save();
      }
    }

    post.lastModified = new Date();
    const savedPost = await post.save();
    res.json(savedPost);
  } catch (error) {
    console.log("Error!\n")
    res.status(400).json({ error: error.message });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
  
    res.status(500).json({ error: error.message });
  }
});

// Update a post by ID
router.put('/:id', async (req, res) => {
  try {
    const post = req.body;

    for (const tag of post.tags) {
      const existingTag = await Tag.findOne({ name: tag });
      if (!existingTag) {
        const newTag = new Tag({ name: tag });
        await newTag.save();
      }
    }

    post.lastModified = new Date();
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, post, {
      new: true,
    });
    if (!updatedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(updatedPost);
  } catch (error) {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete a post by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndRemove(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(deletedPost);
  } catch (error) {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
