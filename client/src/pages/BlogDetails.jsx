import React, { useEffect, useState, useCallback } from 'react';
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
          if (res.data?.views !== undefined) {
            setPost((prev) => prev ? { ...prev, views: res.data.views } : null);
          }
        })
        .catch(console.error);
      sessionStorage.setItem(sessionKey, 'true');
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await api.get(`/posts/${id}/comments`);
      setComments(response.data?.comments || []);
    } catch (e) {
      console.error('Failed to load comments:', e);
    }
  }, [id]);

  const fetchRelatedPosts = useCallback(async (cat) => {
    try {
      const response = await api.get('/posts', {
        params: { status: 'published', category: cat, limit: 4 }
      });
      // Filter out current post
      setRelatedPosts((response.data?.posts || []).filter((p) => p._id !== id));
    } catch (e) {
      console.error('Failed to load related posts:', e);
    }
  }, [id]);

  const fetchPostDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/posts/${id}`);
      const data = response.data?.post;
      setPost(data);
      setLikesCount(data.likes?.length || 0);

      if (data) {
        document.title = `${data.title} | AI BlogForge`;
      }

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
  }, [id, user, fetchComments, fetchRelatedPosts, navigate]);

  useEffect(() => {
    fetchPostDetails();
  }, [fetchPostDetails]);

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
      <div key={comment._id} className="mb-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm transition-colors hover:border-slate-700">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-black text-white shadow-md">
                {comment.author?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{comment.author?.name || 'Anonymous'}</p>
                <span className="text-[10px] font-semibold text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            {user && comment.author?._id === uId && (
              <button 
                onClick={() => handleCommentDelete(comment._id)}
                className="text-rose-500/80 hover:text-rose-400 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 rounded-lg border border-rose-500/20"
              >
                <Trash2 size={12} /> Delete
              </button>
            )}
          </div>
          
          <p className="text-sm text-slate-300 leading-relaxed mb-4">{comment.content}</p>
          
          <div className="flex gap-4">
            {user && (
              <button 
                onClick={() => {
                  setReplyTo(comment._id);
                  setReplyContent('');
                }} 
                className="text-[11px] font-bold text-slate-400 hover:text-violet-400 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 10 20 15 15 20"></polyline><path d="M4 4v7a4 4 0 0 0 4 4h12"></path></svg>
                Reply
              </button>
            )}
          </div>

          {replyTo === comment._id && (
            <div className="mt-4 p-1 rounded-xl bg-gradient-to-r from-violet-600/30 to-cyan-600/30">
              <div className="bg-slate-950 rounded-lg p-3 border border-slate-800/80">
                <textarea
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none resize-none min-h-[60px]"
                  placeholder={`Reply to ${comment.author?.name}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-800/50">
                  <button 
                    onClick={() => setReplyTo(null)} 
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleCommentSubmit(comment._id)} 
                    className="px-4 py-1.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-xs font-bold text-white transition-colors cursor-pointer shadow-lg shadow-violet-500/20"
                  >
                    Post Reply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {replies.length > 0 && (
          <div className="mt-3 pl-4 sm:pl-8 border-l-2 border-slate-800/60 ml-4 space-y-3">
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
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-950 via-purple-900 to-indigo-950 text-slate-100 pb-20">
      <motion.div 
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-violet-400 transition-colors mb-8 group">
          <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-violet-500/50 group-hover:bg-violet-500/10 transition-colors">
            <ChevronLeft size={16} />
          </div>
          Back to feed
        </Link>

        {/* Header Section */}
        <header className="mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-black uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
            {post.category}
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-8">
            {post.title}
          </h1>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-5 sm:p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-500 p-0.5 shadow-lg shadow-violet-500/20 shrink-0">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center font-bold text-lg text-white">
                  {post.author?.name?.[0]?.toUpperCase()}
                </div>
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-white text-base truncate">{post.author?.name || 'Anonymous'}</h3>
                <p className="text-xs text-slate-400 font-medium">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-semibold text-slate-400 shrink-0">
              <span className="flex items-center gap-1.5"><Eye size={16} className="text-slate-500" /> {post.views || 0}</span>
              <span className="flex items-center gap-1.5"><ThumbsUp size={16} className="text-violet-400" /> {likesCount}</span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                {post.readTime || '3 min read'}
              </span>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="relative w-full h-[300px] sm:h-[450px] rounded-3xl overflow-hidden mb-12 shadow-2xl border border-slate-800/60 group bg-slate-900">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-40 z-10"></div>
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        )}

        {/* Content Body */}
        <div className="relative">
          {/* Floating Actions Sidebar (Desktop) */}
          <div className="hidden lg:flex flex-col gap-4 absolute -left-20 top-0 sticky top-24 z-20">
            <button 
              onClick={handleLikeToggle}
              className={`p-3.5 rounded-full border transition-all duration-300 shadow-lg cursor-pointer ${
                isLiked 
                  ? 'bg-violet-600 border-violet-500 text-white shadow-violet-500/30 hover:bg-violet-500' 
                  : 'bg-slate-900/80 backdrop-blur-md border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-violet-400 hover:border-violet-500/50'
              }`}
              title="Like Article"
            >
              <ThumbsUp size={20} fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button 
              onClick={handleBookmarkToggle}
              className={`p-3.5 rounded-full border transition-all duration-300 shadow-lg cursor-pointer ${
                isBookmarked 
                  ? 'bg-cyan-600 border-cyan-500 text-white shadow-cyan-500/30 hover:bg-cyan-500' 
                  : 'bg-slate-900/80 backdrop-blur-md border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-cyan-400 hover:border-cyan-500/50'
              }`}
              title="Bookmark Article"
            >
              <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
            <div className="w-8 h-px bg-slate-800 my-2 mx-auto"></div>
            <a 
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-400 hover:bg-[#1DA1F2] hover:border-[#1DA1F2] hover:text-white transition-all duration-300 shadow-lg cursor-pointer"
              title="Share on Twitter"
            >
              <svg className="fill-current" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <button 
              onClick={copyPageLink}
              className="p-3.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-300 shadow-lg cursor-pointer"
              title="Copy Link"
            >
              <Link2 size={20} />
            </button>
          </div>

          <div 
            className="prose prose-invert prose-lg max-w-none text-left ql-editor prose-headings:font-bold prose-headings:text-slate-100 prose-p:text-slate-300 prose-a:text-violet-400 hover:prose-a:text-violet-300 prose-img:rounded-2xl bg-slate-900/20 p-6 sm:p-12 rounded-3xl border border-slate-800/40 shadow-inner"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Mobile Actions Bar */}
        <div className="lg:hidden flex flex-wrap items-center justify-center gap-3 mt-10 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
          <button 
            onClick={handleLikeToggle}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              isLiked 
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' 
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-violet-400'
            }`}
          >
            <ThumbsUp size={18} fill={isLiked ? 'currentColor' : 'none'} />
            {likesCount}
          </button>
          <button 
            onClick={handleBookmarkToggle}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              isBookmarked 
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30' 
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-cyan-400'
            }`}
          >
            <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
            Save
          </button>
          <button 
            onClick={copyPageLink}
            className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            <Link2 size={18} />
          </button>
        </div>

        {/* Comments Section */}
        <div className="mt-20 pt-12 border-t border-slate-800/60 text-left">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <MessageSquare size={24} />
            </div>
            Discussion ({comments.length})
          </h3>

          {user ? (
            <div className="mb-10 p-1 rounded-2xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 shadow-lg">
              <div className="bg-slate-950 rounded-xl p-4 sm:p-6 border border-slate-800/80">
                <textarea
                  className="w-full bg-transparent text-base text-white placeholder-slate-500 focus:outline-none resize-none min-h-[100px]"
                  placeholder="Share your thoughts on this article..."
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                />
                <div className="flex justify-end mt-4 pt-4 border-t border-slate-800/50">
                  <button 
                    onClick={() => handleCommentSubmit(null)}
                    className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-500/20 transition-all cursor-pointer"
                  >
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-10 p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center backdrop-blur-sm">
              <MessageSquare size={36} className="mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 text-lg">
                Please <Link to="/login" className="text-violet-400 font-bold hover:text-violet-300 hover:underline transition-colors">log in</Link> to join the conversation.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {comments.filter(c => !c.parentId).length === 0 ? (
              <p className="text-center text-slate-500 py-10 italic bg-slate-900/30 rounded-2xl border border-slate-800/30">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment) => renderComment(comment))
            )}
          </div>
        </div>

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <div className="mt-24 pt-16 border-t border-slate-800/60 text-left">
            <h3 className="text-2xl font-black text-white mb-8 tracking-tight">Continue Reading</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.slice(0, 3).map((rel) => (
                <Link to={`/blog/${rel._id}`} key={rel._id} className="group flex flex-col bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden hover:border-violet-500/40 hover:bg-slate-900/80 transition-all duration-300 shadow-lg hover:shadow-violet-500/10">
                  <div 
                    className="h-44 w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                    style={{ 
                      backgroundImage: rel.coverImage 
                        ? `url(${rel.coverImage})` 
                        : `linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.4))` 
                    }} 
                  />
                  <div className="p-5 sm:p-6 flex flex-col flex-grow relative z-10 bg-slate-900/90">
                    <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-3">
                      {rel.category}
                    </span>
                    <h4 className="text-lg font-bold text-white line-clamp-2 mb-4 group-hover:text-violet-300 transition-colors leading-tight">{rel.title}</h4>
                    <div className="mt-auto flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span className="truncate pr-2">{rel.author?.name || 'Author'}</span>
                      <span className="flex items-center gap-1 text-cyan-500/80 shrink-0">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        {rel.readTime || '3 min read'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BlogDetails;
