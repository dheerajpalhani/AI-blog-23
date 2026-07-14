const express = require('express');
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  generateAiContent,
  uploadImage,
  incrementViews,
  toggleLike,
  toggleBookmark,
  addComment,
  getComments,
  deleteComment,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public / Private listings and detail retrieval
router.get('/', getPosts);
router.get('/:id', getPostById);

// Authentication protected CRUD routes
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// Post details actions (views, likes, bookmarks)
router.put('/:id/view', incrementViews);
router.post('/:id/like', protect, toggleLike);
router.post('/:id/bookmark', protect, toggleBookmark);

// Image uploading route (Multer Memory + Cloudinary/DataURI)
router.post('/upload', protect, upload.single('image'), uploadImage);

// Comments routing endpoints
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', getComments);
router.delete('/comments/:commentId', protect, deleteComment);

// Legacy AI assistance route
router.post('/generate', protect, generateAiContent);

module.exports = router;
