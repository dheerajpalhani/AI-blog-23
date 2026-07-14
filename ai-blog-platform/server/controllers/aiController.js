const aiService = require('../services/aiService');

// @desc    Process custom AI tasks (Generate, Continue, Rewrite, Grammar, Summarize, Meta, Titles, Tags)
// @route   POST /api/ai/process
// @access  Private
const processAiTask = async (req, res, next) => {
  const { action, prompt, content } = req.body;

  try {
    if (!action) {
      res.status(400);
      throw new Error('Please specify an action');
    }

    // Setup headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    await aiService.runAiTaskStream(
      action,
      prompt,
      content,
      (chunkText) => {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      },
      () => {
        res.write('data: [DONE]\n\n');
        res.end();
      }
    );
  } catch (error) {
    if (!res.headersSent) {
      next(error);
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message || 'Server error occurred' })}\n\n`);
      res.end();
    }
  }
};

module.exports = {
  processAiTask,
};
