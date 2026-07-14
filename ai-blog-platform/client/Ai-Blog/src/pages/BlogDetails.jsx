import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import SkeletonCard from '../components/SkeletonCard';
import { 
  Eye, 
  ThumbsUp, 
  Bookmark, 
  Share2, 
  ChevronLeft, 
  Link2, 
  MessageSquare,
  Trash2
} from 'lucide-react';

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState([]);
  
  // Comments states
  const [comments, setComments] = useState([]);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // Social Toggle states
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Increment views once per browser session
  useEffect(() => {
    const sessionKey = `viewed_${id}`;
    if (!sessionStorage.getItem(sessionKey)) {
      api.put(`/posts/${id}/view`)
        .then((res) => {
          if (res.data?.views !== undefined && post) {
            setPost((prev) => prev ? { ...prev, views: res.data.views } : null);
          }
        })
        .catch(console.error);
      sessionStorage.setItem(sessionKey, 'true');
    }
  }, [id]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/posts/${id}/comments`);
      setComments(response.data?.comments || []);
    } catch (e) {
      console.error('Failed to load comments:', e);
    }
  };

  const fetchRelatedPosts = async (cat) => {
    try {
      const response = await api.get('/posts', {
        params: { status: 'published', category: cat, limit: 4 }
      });
      // Filter out current post
      setRelatedPosts((response.data?.posts || []).filter((p) => p._id !== id));
    } catch (e) {
      console.error('Failed to load related posts:', e);
    }
  };

  const fetchPostDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/posts/${id}`);
      const data = response.data?.post;
      setPost(data);
      setLikesCount(data.likes?.length || 0);

      if (user) {
        const uId = user._id || user.id;
        setIsLiked(data.likes?.includes(uId));
        setIsBookmarked(data.bookmarks?.includes(uId));
      }

      fetchComments();
      fetchRelatedPosts(data.category);
    } catch (error) {
      console.error(error);
      toast.error('Article not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [id, user]);

  const handleLikeToggle = async () => {
    if (!user) {
      toast.error('Please login to like articles');
      return;
    }
    try {
      const response = await api.post(`/posts/${id}/like`);
      setLikesCount(response.data?.likesCount || 0);
      setIsLiked(response.data?.isLiked);
    } catch (error) {
      console.error(error);
      toast.error('Failed to toggle like');
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user) {
      toast.error('Please login to bookmark articles');
      return;
    }
    try {
      const response = await api.post(`/posts/${id}/bookmark`);
      setIsBookmarked(response.data?.isBookmarked);
      toast.success(response.data?.isBookmarked ? 'Article bookmarked!' : 'Bookmark removed');
    } catch (error) {
      console.error(error);
      toast.error('Failed to toggle bookmark');
    }
  };

  const handleCommentSubmit = async (parentId = null) => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    const content = parentId ? replyContent : newCommentContent;
    if (!content.trim()) return;

    try {
      const response = await api.post(`/posts/${id}/comments`, { content, parentId });
      toast.success('Comment posted!');
      
      if (parentId) {
        setReplyContent('');
        setReplyTo(null);
      } else {
        setNewCommentContent('');
      }
      fetchComments();
    } catch (error) {
      console.error(error);
      toast.error('Failed to post comment');
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await api.delete(`/posts/comments/${commentId}`);
      toast.success('Comment removed');
      fetchComments();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete comment');
    }
  };

  const copyPageLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const renderComment = (comment) => {
    // Only render top-level comments first; replies will render inside their parent nodes recursively
    if (comment.parentId) return null;

    return renderCommentNode(comment);
  };

  const renderCommentNode = (comment) => {
    const replies = comments.filter((c) => c.parentId === comment._id);
    const uId = user?._id || user?.id;

    return (
      <div key={comment._id} className="comment-card">
        <div className="comment-header">
          <div className="commenter-info">
            <div className="commenter-avatar">
              {comment.author?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="commenter-name">{comment.author?.name || 'Anonymous'}</p>
              <span className="comment-date">{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          {user && comment.author?._id === uId && (
            <button 
              onClick={() => handleCommentDelete(comment._id)}
              className="comment-action-link text-rose-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
        
        <p className="comment-content">{comment.content}</p>
        
        <div className="comment-actions">
          {user && (
            <span 
              onClick={() => {
                setReplyTo(comment._id);
                setReplyContent('');
              }} 
              className="comment-action-link cursor-pointer"
            >
              Reply
            </span>
          )}
        </div>

        {replyTo === comment._id && (
          <div className="comment-input-box mt-3 pl-4 border-l-2 border-slate-700">
            <textarea
              className="comment-textarea text-xs"
              placeholder={`Reply to ${comment.author?.name}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setReplyTo(null)} 
                className="px-3 py-1 bg-slate-800 rounded-md text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleCommentSubmit(comment._id)} 
                className="px-3 py-1 bg-violet-600 rounded-md text-xs text-white cursor-pointer"
              >
                Post Reply
              </button>
            </div>
          </div>
        )}

        {replies.length > 0 && (
          <div className="replies-container">
            {replies.map((reply) => renderCommentNode(reply))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <SkeletonCard variant="details" />;
  }

  if (!post) {
    return <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Article not found.</div>;
  }

  const shareText = encodeURIComponent(post.title);
  const shareUrl = encodeURIComponent(window.location.href);

  return (
    <motion.div 
      className="details-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Link to="/" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-6">
        <ChevronLeft size={14} /> Back to feed
      </Link>

      <article className="details-header text-left">
        <span className="details-category">{post.category}</span>
        <h1 className="details-title">{post.title}</h1>
        
        <div className="details-meta-row">
          <div className="details-author-card">
            <div className="author-avatar">
              {post.author?.name?.[0]?.toUpperCase()}
            </div>
            <div className="author-meta-info">
              <span className="author-name">{post.author?.name || 'Anonymous'}</span>
              <span className="post-pub-date">Published: {new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="details-stats-group">
            <span className="flex items-center gap-1"><Eye size={16} /> {post.views || 0} views</span>
            <span className="flex items-center gap-1"><ThumbsUp size={16} /> {likesCount} likes</span>
            <span>{post.readTime || '3 min read'}</span>
          </div>
        </div>
      </article>

      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className="details-cover" />
      )}

      {/* Blog Article Content Body */}
      <div 
        className="details-content text-left ql-editor"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Social Actions Buttons Bar */}
      <div className="details-actions-bar">
        <div className="flex gap-4">
          <button 
            onClick={handleLikeToggle}
            className={`action-btn-toggle cursor-pointer ${isLiked ? 'active' : ''}`}
          >
            <ThumbsUp size={18} fill={isLiked ? 'currentColor' : 'none'} />
            {isLiked ? 'Liked' : 'Like'} ({likesCount})
          </button>
          <button 
            onClick={handleBookmarkToggle}
            className={`action-btn-toggle cursor-pointer ${isBookmarked ? 'active-bookmark' : ''}`}
          >
            <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </button>
        </div>

        <div className="share-buttons-group">
          <a 
            href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn-toggle cursor-pointer"
            title="Share on Twitter"
          >
            <svg className="fill-current" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a 
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="action-btn-toggle cursor-pointer"
            title="Share on LinkedIn"
          >
            <svg className="fill-current" viewBox="0 0 24 24" style={{ width: '16px', height: '16px' }}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/></svg>
          </a>
          <button 
            onClick={copyPageLink}
            className="action-btn-toggle cursor-pointer"
            title="Copy Page Link"
          >
            <Link2 size={16} />
          </button>
        </div>
      </div>

      {/* Threaded Comments Section */}
      <div className="comments-section text-left">
        <h3 className="comments-title flex items-center gap-2">
          <MessageSquare size={20} />
          Comments ({comments.length})
        </h3>

        {user ? (
          <div className="comment-input-box">
            <textarea
              className="comment-textarea"
              placeholder="What are your thoughts on this article? Share them here..."
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
            />
            <button 
              onClick={() => handleCommentSubmit(null)}
              className="comment-submit-btn cursor-pointer"
            >
              Post Comment
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500 mb-6 bg-slate-900 border border-slate-850 p-4 rounded-lg">
            Please <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold underline">Login</Link> to share comments and replies on this article.
          </p>
        )}

        <div className="comments-list">
          {comments.filter(c => !c.parentId).length === 0 ? (
            <p className="text-sm text-slate-500 italic">No comments posted yet. Be the first to share your thoughts!</p>
          ) : (
            comments.map((comment) => renderComment(comment))
          )}
        </div>
      </div>

      {/* Related Blogs Block */}
      {relatedPosts.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-800">
          <h3 className="text-xl font-bold text-left mb-6 text-white">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.slice(0, 3).map((rel) => (
              <Link to={`/blog/${rel._id}`} key={rel._id} className="blog-card flex flex-col hover:border-slate-700 transition">
                <div 
                  className="h-32 bg-slate-800 bg-cover bg-center rounded-t-lg" 
                  style={{ 
                    backgroundImage: rel.coverImage 
                      ? `url(${rel.coverImage})` 
                      : `linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.4))` 
                  }} 
                />
                <div className="p-4 flex-grow flex flex-col justify-between text-left">
                  <div>
                    <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block mb-1">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-bold text-white line-clamp-2 mb-2">{rel.title}</h4>
                  </div>
                  <span className="text-[11px] text-slate-500 block">{rel.readTime || '3 min read'}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BlogDetails;
