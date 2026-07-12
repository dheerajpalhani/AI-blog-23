const express = require('express');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  generateAiContent,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public / Private listings and detail retrieval
router.get('/', getPosts);
router.get('/:id', getPostById);

// Authentication protected CRUD routes
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// AI assistance route
router.post('/generate', protect, generateAiContent);

module.exports = router;
