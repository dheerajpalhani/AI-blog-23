const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// Helper to upload image buffers to Cloudinary using streams
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'blogforge_covers' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

// Helper to calculate reading time (~200 words per minute)
const calculateReadTime = (content) => {
  const cleanText = content.replace(/<[^>]*>/g, ''); // Strip HTML tags
  const wordCount = cleanText.split(/\s+/).filter((word) => word.length > 0).length;
  const minutes = Math.max(1, Math.round(wordCount / 200));
  return `${minutes} min read`;
};

// @desc    Create a new blog post (draft or published)
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  const { title, description, content, coverImage, category, tags, status } = req.body;

  try {
    if (!title || !content) {
      res.status(400);
      throw new Error('Please add a title and content');
    }

    const readTime = calculateReadTime(content);

    const post = await Post.create({
      title,
      description: description || '',
      content,
      coverImage: coverImage || '',
      category: category || 'Technology',
      tags: tags || [],
      readTime,
      status: status || 'draft',
      author: req.user._id,
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all blog posts (supports filtering by author, search, category, sorting, pagination)
// @route   GET /api/posts
// @access  Public / Private
const getPosts = async (req, res, next) => {
  const { author, status, search, category, sortBy, page, limit } = req.query;

  try {
    const filter = {};

    // Filter by specific author
    if (author) {
      if (author === 'me') {
        if (!req.user) {
          res.status(401);
          throw new Error('Not authorized to view personal feed without session');
        }
        filter.author = req.user._id;
      } else {
        filter.author = author;
      }
    }

    // Filter by publication status
    if (status) {
      filter.status = status;
    } else {
      if (!author || author !== 'me') {
        filter.status = 'published';
      }
    }

    // Search query matches title, description, content, category, tags, or author name
    if (search) {
      const User = require('../models/User');
      const matchingUsers = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id');
      const userIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { author: { $in: userIds } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      filter.category = category;
    }

    // Pagination numbers
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    // Sorting rule
    let sortObj = { createdAt: -1 };
    if (sortBy === 'views') {
      sortObj = { views: -1, createdAt: -1 };
    }

    let posts;
    let total;

    if (sortBy === 'likes') {
      // Custom aggregation to sort by likes array size
      const pipeline = [
        { $match: filter },
        { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
        { $sort: { likesCount: -1, createdAt: -1 } },
        { $facet: {
            metadata: [{ $count: 'total' }],
            data: [{ $skip: skipNum }, { $limit: limitNum }]
          }
        }
      ];
      
      const aggregationResult = await Post.aggregate(pipeline);
      posts = aggregationResult[0].data || [];
      total = aggregationResult[0].metadata[0]?.total || 0;
      
      // Populate author details on aggregation objects
      await Post.populate(posts, { path: 'author', select: 'name email' });
    } else {
      total = await Post.countDocuments(filter);
      posts = await Post.find(filter)
        .populate('author', 'name email')
        .sort(sortObj)
        .skip(skipNum)
        .limit(limitNum);
    }

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      count: posts.length,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog post by ID
// @route   GET /api/posts/:id
// @access  Public / Private
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    // Security check: If post is draft, only allow the author to view it
    if (post.status === 'draft') {
      if (!req.user || post.author._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to access this draft article');
      }
    }

    res.status(200).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blog post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = async (req, res, next) => {
  const { title, description, content, coverImage, category, tags, status } = req.body;

  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    // Ownership validation: Enforce only post owner can edit
    if (post.author.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to modify this post');
    }

    const readTime = content ? calculateReadTime(content) : post.readTime;

    post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title: title || post.title,
        description: description !== undefined ? description : post.description,
        content: content || post.content,
        coverImage: coverImage !== undefined ? coverImage : post.coverImage,
        category: category || post.category,
        tags: tags || post.tags,
        readTime,
        status: status || post.status,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete blog post
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    // Ownership validation: Enforce only post owner can delete
    if (post.author.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this post');
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Post removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate article content using Gemini AI
// @route   POST /api/posts/generate
// @access  Private
const generateAiContent = async (req, res, next) => {
  const { prompt } = req.body;

  try {
    if (!prompt) {
      res.status(400);
      throw new Error('Please provide a prompt/topic');
    }

    let generatedContent = '';
    let summary = '';

    // If Gemini API key is configured, execute request
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Write a high-quality blog post about: "${prompt}". Return it in beautiful HTML format suitable for rendering inside a rich-text editor (using tags like <h2>, <p>, <ul>, <li>, and <strong>). Do not include any wrapper HTML or markdown formatting like \`\`\`html. Keep it around 400 words. Also, write a 1-sentence summary of the article at the very end marked with [SUMMARY] tag.`,
        });
        
        const fullText = response.text || '';
        
        if (fullText.includes('[SUMMARY]')) {
          const parts = fullText.split('[SUMMARY]');
          generatedContent = parts[0].trim();
          summary = parts[1].trim();
        } else {
          generatedContent = fullText;
          summary = `An insightful exploration of ${prompt}.`;
        }
      } catch (aiError) {
        console.error('Gemini API call failed, using default developer fallback mockup:', aiError);
      }
    }

    // Fallback template if Gemini is unavailable
    if (!generatedContent) {
      generatedContent = `<h2>Insights on ${prompt}</h2><p>This is a structured article generated by Gemini AI regarding <strong>${prompt}</strong>. It outlines key methodologies, future outlooks, and implementation strategies for developers and designers alike.</p><p>Here are three core areas of impact:</p><ul><li><strong>Speed & Automation:</strong> Accelerating deployment cycles with modern full-stack workflows.</li><li><strong>Premium Presentation:</strong> Utilizing rich dark modes, glassmorphism, and smooth micro-interactions.</li><li><strong>Secure APIs:</strong> Enforcing stateful protections with HTTP-only cookies and modular controllers.</li></ul>`;
      summary = `An insightful exploration of ${prompt} and its long-term industry impact.`;
    }

    res.status(200).json({ generatedContent, summary });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload cover image to Cloudinary (falls back to Base64 in developer mode)
// @route   POST /api/posts/upload
// @access  Private
const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please select an image file to upload');
    }

    if (process.env.CLOUDINARY_API_KEY) {
      const imageUrl = await uploadToCloudinary(req.file.buffer);
      res.status(200).json({ success: true, imageUrl });
    } else {
      // Offline fallback: convert to base64 Data URI
      const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      res.status(200).json({ success: true, imageUrl: base64Image });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Increment post view count
// @route   PUT /api/posts/:id/view
// @access  Public
const incrementViews = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }
    res.status(200).json({ success: true, views: post.views });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user like status on post
// @route   POST /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.status(200).json({ success: true, likesCount: post.likes.length, isLiked: !isLiked });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user bookmark status on post
// @route   POST /api/posts/:id/bookmark
// @access  Private
const toggleBookmark = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404);
      throw new Error('Post not found');
    }

    const userId = req.user._id;
    const isBookmarked = post.bookmarks.includes(userId);

    if (isBookmarked) {
      post.bookmarks = post.bookmarks.filter((id) => id.toString() !== userId.toString());
    } else {
      post.bookmarks.push(userId);
    }

    await post.save();
    res.status(200).json({ success: true, isBookmarked: !isBookmarked });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to blog post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  const { content, parentId } = req.body;
  try {
    if (!content) {
      res.status(400);
      throw new Error('Comment content is required');
    }

    const comment = await Comment.create({
      post: req.params.id,
      author: req.user._id,
      content,
      parentId: parentId || null,
    });

    const populated = await comment.populate('author', 'name email');
    res.status(201).json({ success: true, comment: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get comments for a blog post
// @route   GET /api/posts/:id/comments
// @access  Public
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });
    res.status(200).json({ success: true, comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment (and its replies)
// @route   DELETE /api/posts/comments/:commentId
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      res.status(404);
      throw new Error('Comment not found');
    }

    if (comment.author.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this comment');
    }

    // Delete nested replies recursively
    await Comment.deleteMany({ parentId: comment._id });
    await comment.deleteOne();

    res.status(200).json({ success: true, message: 'Comment removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all comments platform-wide (Admin only)
// @route   GET /api/posts/comments/admin/all
// @access  Private/Admin
const getAllComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({})
      .populate('author', 'name email')
      .populate('post', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, comments });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user analytics statistics
// @route   GET /api/posts/analytics/my-stats
// @access  Private
const getMyStats = async (req, res, next) => {
  try {
    const posts = await Post.find({ author: req.user._id });
    
    const totalPosts = posts.length;
    const publishedCount = posts.filter(p => p.status === 'published').length;
    const draftCount = posts.filter(p => p.status === 'draft').length;
    
    let totalViews = 0;
    let totalLikes = 0;
    let totalBookmarks = 0;
    let totalReadMinutes = 0;
    
    posts.forEach(p => {
      totalViews += p.views || 0;
      totalLikes += p.likes?.length || 0;
      totalBookmarks += p.bookmarks?.length || 0;
      
      const match = p.readTime?.match(/\d+/);
      if (match) {
        totalReadMinutes += parseInt(match[0], 10);
      }
    });

    // Get total comments on user's posts
    const myPostIds = posts.map(p => p._id);
    const totalComments = await Comment.countDocuments({ post: { $in: myPostIds } });

    // Categories breakdown
    const categoryCounts = {};
    posts.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    const categoryData = Object.keys(categoryCounts).map(cat => ({
      category: cat,
      count: categoryCounts[cat]
    }));

    // Views/Likes trend data for the charting component
    const blogViewsData = posts.slice(0, 10).map(p => ({
      title: p.title.length > 20 ? p.title.slice(0, 17) + '...' : p.title,
      views: p.views || 0,
      likes: p.likes?.length || 0
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalPosts,
        publishedCount,
        draftCount,
        totalViews,
        totalLikes,
        totalBookmarks,
        totalComments,
        totalReadMinutes,
        categoryData,
        blogViewsData
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform-wide admin statistics
// @route   GET /api/posts/analytics/admin-stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalComments = await Comment.countDocuments();
    
    const posts = await Post.find({});
    const totalPosts = posts.length;
    const publishedCount = posts.filter(p => p.status === 'published').length;
    const draftCount = posts.filter(p => p.status === 'draft').length;
    
    let totalViews = 0;
    posts.forEach(p => {
      totalViews += p.views || 0;
    });

    // Categories breakdown platform-wide
    const categoryCounts = {};
    posts.forEach(p => {
      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
    });

    const categoryData = Object.keys(categoryCounts).map(cat => ({
      category: cat,
      count: categoryCounts[cat]
    }));

    // Top posts by views
    const topPosts = posts
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
      .map(p => ({
        _id: p._id,
        title: p.title,
        views: p.views || 0,
        likes: p.likes?.length || 0
      }));

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalComments,
        totalPosts,
        publishedCount,
        draftCount,
        totalViews,
        categoryData,
        topPosts
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
  getMyStats,
  getAdminStats,
  getAllComments,
};
