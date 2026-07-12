const Post = require('../models/Post');

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

// @desc    Get all blog posts (supports filtering by author, and status)
// @route   GET /api/posts
// @access  Public / Private
const getPosts = async (req, res, next) => {
  const { author, status } = req.query;

  try {
    const filter = {};

    // Filter by specific author
    if (author) {
      if (author === 'me') {
        // Enforce protect was run
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
      // By default, if no specific query is requested, only return published posts to the public
      if (!author || author !== 'me') {
        filter.status = 'published';
      }
    }

    const posts = await Post.find(filter)
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: posts.length, posts });
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

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  generateAiContent,
};
