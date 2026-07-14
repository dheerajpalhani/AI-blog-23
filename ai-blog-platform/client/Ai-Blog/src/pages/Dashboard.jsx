import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { 
  LayoutDashboard, 
  FileText, 
  PlusSquare, 
  FileEdit, 
  BarChart3, 
  Bookmark, 
  UserCircle, 
  Settings as SettingsIcon, 
  Menu, 
  X, 
  Eye, 
  ThumbsUp, 
  Sparkles, 
  TrendingUp,
  LogOut,
  Trash2,
  Shield
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AnalyticsChart from '../components/AnalyticsChart';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // States for embedded blog creation
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('Technology');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Blog CRUD states
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Editor metrics and autosave states
  const [wordCount, setWordCount] = useState(0);
  const [liveReadTime, setLiveReadTime] = useState('1 min read');
  const [autosaveStatus, setAutosaveStatus] = useState('');

  // Profile edit states
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileBio, setProfileBio] = useState(user?.bio || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
  const [profileTwitter, setProfileTwitter] = useState(user?.socialLinks?.twitter || '');
  const [profileLinkedin, setProfileLinkedin] = useState(user?.socialLinks?.linkedin || '');
  const [profileGithub, setProfileGithub] = useState(user?.socialLinks?.github || '');
  
  // Password states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Analytics states
  const [myStats, setMyStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Bookmarks state
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  // Admin panel states
  const [adminStats, setAdminStats] = useState(null);
  const [loadingAdminStats, setLoadingAdminStats] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminPosts, setAdminPosts] = useState([]);
  const [adminComments, setAdminComments] = useState([]);
  const [adminTab, setAdminTab] = useState('users'); // users, blogs, comments, stats

  // Calculate live word count & reading time
  useEffect(() => {
    const cleanText = newContent.replace(/<[^>]*>/g, '').trim();
    const words = cleanText ? cleanText.split(/\s+/).filter((w) => w.length > 0).length : 0;
    setWordCount(words);
    const min = Math.max(1, Math.round(words / 200));
    setLiveReadTime(`${min} min read`);
  }, [newContent]);

  // Debounced autosave effect
  useEffect(() => {
    if (activeTab !== 'create-blog' || !newTitle.trim()) {
      return;
    }

    setAutosaveStatus('Draft modified, saving soon...');

    const delayDebounceFn = setTimeout(async () => {
      setAutosaveStatus('Autosaving draft...');
      try {
        const payload = {
          title: newTitle,
          description: newSummary || `Draft of ${newTitle}`,
          content: newContent,
          category: newTag,
          coverImage,
          status: 'draft',
        };

        if (editPostId) {
          await api.put(`/posts/${editPostId}`, payload);
        } else {
          const response = await api.post('/posts', payload);
          setEditPostId(response.data?.post?._id || response.data?.post?.id);
        }

        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setAutosaveStatus(`Saved draft at ${now}`);
      } catch (error) {
        console.error('Autosave error:', error);
        setAutosaveStatus('Autosave failed');
      }
    }, 5000); // 5 seconds of inactivity triggers autosave

    return () => clearTimeout(delayDebounceFn);
  }, [newTitle, newContent, newSummary, newTag, coverImage, activeTab]);

  const fetchUserPosts = async () => {
    setLoadingPosts(true);
    try {
      const response = await api.get('/posts?author=me');
      setPosts(response.data?.posts || []);
    } catch (error) {
      console.error('Failed to load user posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Sync profile editing fields when user details update
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileEmail(user.email || '');
      setProfileBio(user.bio || '');
      setProfileAvatar(user.avatar || '');
      setProfileTwitter(user.socialLinks?.twitter || '');
      setProfileLinkedin(user.socialLinks?.linkedin || '');
      setProfileGithub(user.socialLinks?.github || '');
    }
  }, [user]);

  const fetchMyStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/posts/analytics/my-stats');
      setMyStats(res.data?.stats);
    } catch (e) {
      console.error('Failed to load personal analytics:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchBookmarks = async () => {
    setLoadingBookmarks(true);
    try {
      const response = await api.get('/posts');
      const allPublished = response.data?.posts || [];
      const uId = user?._id || user?.id;
      const filtered = allPublished.filter((p) => p.bookmarks?.includes(uId));
      setBookmarkedPosts(filtered);
    } catch (e) {
      console.error('Failed to load bookmarked posts:', e);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      setAdminUsers(res.data?.users || []);
    } catch (e) {
      console.error('Failed to load admin users:', e);
    }
  };

  const fetchAdminPosts = async () => {
    try {
      const res = await api.get('/posts');
      setAdminPosts(res.data?.posts || []);
    } catch (e) {
      console.error('Failed to load admin articles:', e);
    }
  };

  const fetchAdminComments = async () => {
    try {
      const res = await api.get('/posts/comments/admin/all');
      setAdminComments(res.data?.comments || []);
    } catch (e) {
      console.error('Failed to load admin comments:', e);
    }
  };

  const fetchAdminStats = async () => {
    setLoadingAdminStats(true);
    try {
      const res = await api.get('/posts/analytics/admin-stats');
      setAdminStats(res.data?.stats);
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setLoadingAdminStats(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    const payload = {
      name: profileName,
      bio: profileBio,
      avatar: profileAvatar,
      socialLinks: {
        twitter: profileTwitter,
        linkedin: profileLinkedin,
        github: profileGithub,
      },
    };

    if (newPassword) {
      payload.password = newPassword;
    }

    const toastId = toast.loading('Saving profile changes...');
    try {
      const res = await api.put('/auth/profile', payload);
      if (res.data?.success) {
        useAuthStore.setState({ user: res.data.user });
        toast.success('Profile updated successfully!', { id: toastId });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update profile', { id: toastId });
    }
  };

  const handleProfileAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const toastId = toast.loading('Uploading avatar...');
    try {
      const response = await api.post('/posts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setProfileAvatar(response.data?.imageUrl || '');
      toast.success('Avatar uploaded successfully!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Upload failed', { id: toastId });
    }
  };

  const handleToggleUserRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/auth/users/${userId}/role`, { role: nextRole });
      toast.success(`User role changed to ${nextRole}`);
      fetchAdminUsers();
    } catch (e) {
      toast.error('Failed to change user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user account permanently?')) return;
    try {
      await api.delete(`/auth/users/${userId}`);
      toast.success('User deleted');
      fetchAdminUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleAdminDeletePost = async (postId) => {
    if (!window.confirm('Remove this post permanently from the platform?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      toast.success('Post removed');
      fetchAdminPosts();
    } catch (e) {
      toast.error('Failed to remove post');
    }
  };

  const handleAdminDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    try {
      await api.delete(`/posts/comments/${commentId}`);
      toast.success('Comment removed');
      fetchAdminComments();
    } catch (e) {
      toast.error('Failed to remove comment');
    }
  };

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'my-blogs' || activeTab === 'drafts') {
      fetchUserPosts();
    }
    if (activeTab === 'analytics') {
      fetchMyStats();
    }
    if (activeTab === 'bookmarks') {
      fetchBookmarks();
    }
    if (activeTab === 'admin') {
      fetchAdminUsers();
      fetchAdminPosts();
      fetchAdminComments();
      fetchAdminStats();
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploadingImage(true);
    const toastId = toast.loading('Uploading cover image...');
    try {
      const response = await api.post('/posts/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setCoverImage(response.data?.imageUrl || '');
      toast.success('Cover image uploaded successfully!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Image upload failed', { id: toastId });
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePublish = async (e, status = 'published') => {
    if (e) e.preventDefault();
    if (!newTitle || !newSummary || !newContent) {
      toast.error('Please fill in all fields (Title, Summary, Content)');
      return;
    }
    setLoading(true);
    const payload = {
      title: newTitle,
      description: newSummary,
      content: newContent,
      category: newTag,
      coverImage,
      status,
    };
    try {
      if (editPostId) {
        await api.put(`/posts/${editPostId}`, payload);
        toast.success(status === 'published' ? 'Article published successfully!' : 'Draft updated successfully!');
      } else {
        await api.post('/posts', payload);
        toast.success(status === 'published' ? 'Article published successfully!' : 'Draft saved successfully!');
      }
      setNewTitle('');
      setNewSummary('');
      setNewContent('');
      setCoverImage('');
      setEditPostId(null);
      setActiveTab(status === 'published' ? 'my-blogs' : 'drafts');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit article');
    } finally {
      setLoading(false);
    }
  };

  // AI assistant states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [aiStreaming, setAiStreaming] = useState(false);
  const [aiAction, setAiAction] = useState('generate');

  const aiOptions = [
    { id: 'generate', name: 'Generate Blog', icon: Sparkles, requiresPrompt: true },
    { id: 'continue', name: 'Continue Writing', icon: TrendingUp, requiresPrompt: false },
    { id: 'rewrite', name: 'Rewrite Content', icon: Sparkles, requiresPrompt: false },
    { id: 'grammar', name: 'Improve Grammar', icon: Sparkles, requiresPrompt: false },
    { id: 'summarize', name: 'Summarize Blog', icon: FileText, requiresPrompt: false },
    { id: 'meta', name: 'SEO Meta Description', icon: FileText, requiresPrompt: false },
    { id: 'titles', name: 'Generate Blog Titles', icon: PlusSquare, requiresPrompt: true },
    { id: 'tags', name: 'Generate Hashtags', icon: Bookmark, requiresPrompt: false },
  ];

  const handleAiProcess = async (actionType) => {
    let targetPrompt = '';
    if (actionType === 'generate' || actionType === 'titles') {
      if (!aiPrompt.trim() && !newTitle.trim()) {
        toast.error('Please enter an AI prompt or blog title first!');
        return;
      }
      targetPrompt = aiPrompt.trim() || newTitle.trim();
    }

    setAiStreaming(true);
    setAiResult('');
    const toastId = toast.loading('Connecting to Gemini...');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: actionType,
          prompt: targetPrompt,
          content: newContent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'AI processing request failed');
      }

      toast.dismiss(toastId);
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let finished = false;
      let accumulatedText = '';

      while (!finished) {
        const { value, done } = await reader.read();
        if (done) {
          finished = true;
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              finished = true;
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                throw new Error(parsed.error);
              }
              if (parsed.text) {
                accumulatedText += parsed.text;
                setAiResult(accumulatedText);
              }
            } catch (e) {
              // Partial chunk parsed
            }
          }
        }
      }
      toast.success('AI processing complete!');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to communicate with AI model', { id: toastId });
    } finally {
      setAiStreaming(false);
    }
  };

  const handleEdit = (post) => {
    setEditPostId(post._id);
    setNewTitle(post.title);
    setNewSummary(post.description || '');
    setNewContent(post.content);
    setNewTag(post.category);
    setCoverImage(post.coverImage || '');
    setActiveTab('create-blog');
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) {
      return;
    }
    try {
      await api.delete(`/posts/${postId}`);
      toast.success('Article deleted successfully!');
      fetchUserPosts();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete article');
    }
  };

  const menuItems = [
    { id: 'overview', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-blogs', name: 'My Blogs', icon: FileText },
    { id: 'create-blog', name: 'Create Blog', icon: PlusSquare },
    { id: 'drafts', name: 'Drafts', icon: FileEdit },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'bookmarks', name: 'Bookmarks', icon: Bookmark },
    { id: 'profile', name: 'Profile', icon: UserCircle },
    { id: 'settings', name: 'Settings', icon: SettingsIcon },
  ];

  if (user && user.role === 'admin') {
    menuItems.push({ id: 'admin', name: 'Admin Panel', icon: Shield });
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-slate-900 border border-slate-800 rounded-lg lg:hidden focus:outline-none"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/90 border-r border-slate-800 backdrop-blur-md transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo Area */}
          <div className="p-6 border-b border-slate-800">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              AI BlogForge
            </span>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    flex items-center w-full gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${activeTab === item.id 
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20' 
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}
                  `}
                >
                  <Icon size={18} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* User Profile Summary */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-500 text-white font-bold">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate text-slate-200">{user?.name || 'Author'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'author@blogforge.com'}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-semibold text-rose-400 border border-rose-950/30 bg-rose-950/10 rounded-lg hover:bg-rose-950/30 transition"
            >
              <LogOut size={14} />
              Logout Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-slate-950 p-6 lg:p-10">
        <div className="max-w-6xl mx-auto mt-8 lg:mt-0">
          
          {/* Header Row */}
          <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center mb-8 pb-6 border-b border-slate-800/80">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white capitalize">
                {activeTab.replace('-', ' ')}
              </h1>
              <p className="text-sm text-slate-400">
                Welcome back to your workspace, {user?.name || 'Author'}.
              </p>
            </div>
            {activeTab !== 'create-blog' && (
              <button 
                onClick={() => setActiveTab('create-blog')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-500 shadow-md hover:shadow-violet-600/10 transition"
              >
                <PlusSquare size={16} />
                Create New Post
              </button>
            )}
          </div>

          {/* Dynamically Rendered Tab Views */}
          
          {/* 1. Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: 'Published Blogs', count: posts.filter(p => p.status === 'published').length.toString(), icon: FileText, color: 'text-violet-500' },
                  { title: 'Draft Blogs', count: posts.filter(p => p.status === 'draft').length.toString(), icon: FileEdit, color: 'text-cyan-500' },
                  { title: 'Total Post Views', count: (posts.length * 154 + 48).toString(), icon: Eye, trend: '+12.4%', color: 'text-emerald-500' },
                  { title: 'AI Assistant Queries', count: '18', icon: Sparkles, color: 'text-amber-500' }
                ].map((stat, i) => {
                  const StatIcon = stat.icon;
                  return (
                    <div key={i} className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 transition">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-medium text-slate-400">{stat.title}</span>
                        <StatIcon className={stat.color} size={20} />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tracking-tight text-white">{stat.count}</span>
                        {stat.trend && (
                          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                            <TrendingUp size={12} />
                            {stat.trend}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grid sections for activities & tags */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Recent Activities */}
                <div className="lg:col-span-2 p-6 bg-slate-900 border border-slate-800 rounded-xl">
                  <h3 className="text-lg font-bold mb-4">Recent Activities</h3>
                  <div className="space-y-4">
                    {posts.slice(0, 3).map((blog, i) => (
                      <div key={blog._id} className="flex justify-between items-center p-3 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-800 transition">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-900 text-slate-300 rounded-lg">
                            <FileText size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-200">
                              {blog.status === 'published' ? 'Published' : 'Saved draft'} <span className="text-violet-400">"{blog.title}"</span>
                            </p>
                            <span className="text-xs text-slate-500">{new Date(blog.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 bg-slate-900 border border-slate-800 text-slate-400 rounded-full">{blog.category}</span>
                      </div>
                    ))}
                    {posts.length === 0 && (
                      <div className="text-center text-slate-500 text-sm py-4">No recent activities to show.</div>
                    )}
                  </div>
                </div>

                {/* Popular Tags */}
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                  <h3 className="text-lg font-bold mb-4">Tag Performance</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Technology', percentage: posts.filter(p => p.category === 'Technology').length > 0 ? '80%' : '0%', color: 'bg-violet-600' },
                      { name: 'AI Integration', percentage: posts.filter(p => p.category === 'AI Integration').length > 0 ? '60%' : '0%', color: 'bg-cyan-500' },
                      { name: 'Design', percentage: posts.filter(p => p.category === 'Design').length > 0 ? '45%' : '0%', color: 'bg-emerald-500' },
                      { name: 'Development', percentage: posts.filter(p => p.category === 'Development').length > 0 ? '30%' : '0%', color: 'bg-amber-500' }
                    ].map((tag, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span>{tag.name}</span>
                          <span>{tag.percentage}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                          <div className={`h-full ${tag.color} rounded-full`} style={{ width: tag.percentage }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. My Blogs Tab */}
          {activeTab === 'my-blogs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loadingPosts ? (
                <div className="col-span-full text-center py-10 text-slate-400">Loading your articles...</div>
              ) : posts.filter(p => p.status === 'published').length === 0 ? (
                <div className="col-span-full text-center py-10 text-slate-500">You haven't published any articles yet.</div>
              ) : (
                posts.filter(p => p.status === 'published').map((blog) => (
                  <div key={blog._id} className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition">
                    <div className="p-6 flex-grow">
                      <span className="inline-block text-xs font-bold text-violet-400 bg-violet-950/40 px-2.5 py-1 rounded-full uppercase tracking-wider mb-3">
                        {blog.category}
                      </span>
                      <h3 className="text-xl font-bold mb-2 text-white">{blog.title}</h3>
                      <p className="text-sm text-slate-450 line-clamp-3">{blog.description}</p>
                    </div>
                    <div className="px-6 py-4 bg-slate-950 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-500">
                      <span>Published: {new Date(blog.createdAt).toLocaleDateString()}</span>
                      <div className="flex gap-4">
                        <button onClick={() => handleEdit(blog)} className="text-violet-400 hover:text-violet-300 font-semibold cursor-pointer">Edit</button>
                        <button onClick={() => handleDelete(blog._id)} className="text-rose-400 hover:text-rose-350 font-semibold flex items-center gap-1 cursor-pointer">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 3. Create Blog Tab (Embedded Form) */}
          {activeTab === 'create-blog' && (
            <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto items-start">
              {/* Form Editor (Left Side - 70%) */}
              <div className="flex-1 w-full p-6 bg-slate-900 border border-slate-800 rounded-xl">
                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-350 text-left">Post Title</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition" 
                      placeholder="Enter blog post title"
                      value={newTitle} 
                      onChange={(e) => setNewTitle(e.target.value)} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-350 text-left">Cover Image</label>
                    <div className="flex gap-4 items-center">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-violet-950/40 file:text-violet-400 hover:file:bg-violet-950/70 file:cursor-pointer" 
                      />
                      {uploadingImage && <span className="text-xs text-slate-500">Uploading...</span>}
                    </div>
                    {coverImage && (
                      <div className="mt-3 relative w-full h-40 bg-slate-950 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                        <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setCoverImage('')}
                          className="absolute top-2 right-2 p-1.5 bg-rose-600 hover:bg-rose-500 rounded-full text-white cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-350 text-left">Category / Tag</label>
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-600 transition"
                      value={newTag} 
                      onChange={(e) => setNewTag(e.target.value)}
                    >
                      <option>Technology</option>
                      <option>Design</option>
                      <option>AI Integration</option>
                      <option>Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-350 text-left">Short Summary</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-violet-600 focus:ring-1 focus:ring-violet-600 transition" 
                      placeholder="Brief overview summarizing the article"
                      value={newSummary} 
                      onChange={(e) => setNewSummary(e.target.value)} 
                      required 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-350 text-left">Body Content</label>
                    <div className="bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
                      <ReactQuill theme="snow" value={newContent} onChange={setNewContent} />
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-400 mt-2 px-1">
                      <div className="flex gap-4">
                        <span>Words: <strong className="text-violet-400">{wordCount}</strong></span>
                        <span>Read Time: <strong className="text-cyan-400">{liveReadTime}</strong></span>
                      </div>
                      {autosaveStatus && (
                        <span className="text-slate-500 italic">{autosaveStatus}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button 
                      type="button" 
                      onClick={() => {
                        setNewTitle('');
                        setNewSummary('');
                        setNewContent('');
                        setEditPostId(null);
                        setActiveTab('overview');
                      }}
                      className="px-4 py-2 border border-slate-850 hover:bg-slate-800 rounded-lg text-sm font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => handlePublish(e, 'draft')}
                      disabled={loading}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-sm font-semibold transition cursor-pointer"
                    >
                      Save as Draft
                    </button>
                    <button 
                      type="button" 
                      onClick={(e) => handlePublish(e, 'published')}
                      disabled={loading}
                      className="px-5 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg text-sm font-semibold text-white shadow-md hover:shadow-violet-600/10 transition cursor-pointer"
                    >
                      {editPostId ? 'Update & Publish' : 'Publish Blog'}
                    </button>
                  </div>
                </form>
              </div>

              {/* AI Assistant Panel (Right Side - 30%) */}
              <div className="w-full lg:w-80 shrink-0 p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-6 lg:sticky lg:top-6">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <Sparkles className="text-violet-400" size={18} />
                  <h3 className="font-bold text-white text-sm">AI Assistant</h3>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-semibold text-slate-400 text-left">Select Task</label>
                  <div className="grid grid-cols-2 gap-2">
                    {aiOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAiAction(opt.id)}
                        className={`flex items-center gap-1.5 p-2.5 rounded-lg text-left text-[11px] font-semibold border transition cursor-pointer ${
                          aiAction === opt.id 
                            ? 'bg-violet-950/40 border-violet-600 text-violet-400' 
                            : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800'
                        }`}
                      >
                        {React.createElement(opt.icon, { size: 12 })}
                        <span className="truncate">{opt.name}</span>
                      </button>
                    ))}
                  </div>

                  {aiOptions.find((o) => o.id === aiAction)?.requiresPrompt && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 text-left">AI Prompt / Topic</label>
                      <input
                        type="text"
                        placeholder="e.g. Web3 trends, CSS layouts"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-600 transition"
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleAiProcess(aiAction)}
                    disabled={aiStreaming}
                    className="w-full h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-950/40 border border-cyan-800/80 text-cyan-400 font-bold text-xs hover:bg-cyan-950/60 transition cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles size={14} />
                    {aiStreaming ? 'Streaming response...' : 'Run AI Assistant'}
                  </button>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="block text-xs font-semibold text-slate-400 text-left">Response Preview</label>
                    <div className="w-full min-h-[140px] max-h-[220px] overflow-y-auto bg-slate-950 border border-slate-850 rounded-lg p-3 text-xs text-slate-350 select-text leading-relaxed whitespace-pre-wrap text-left">
                      {aiResult ? (
                        <div dangerouslySetInnerHTML={{ __html: aiResult }} />
                      ) : (
                        <span className="text-slate-650 italic">Generated output will stream here...</span>
                      )}
                    </div>
                  </div>

                  {aiResult && (
                    <div className="space-y-2 pt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNewContent((prev) => prev + aiResult);
                            toast.success('Appended to editor!');
                          }}
                          className="p-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Append to Content
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNewContent(aiResult);
                            toast.success('Replaced editor content!');
                          }}
                          className="p-2 bg-violet-950/40 hover:bg-violet-950/70 text-violet-400 border border-violet-850 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Replace Content
                        </button>
                      </div>

                      {(aiAction === 'meta' || aiAction === 'summarize') && (
                        <button
                          type="button"
                          onClick={() => {
                            const cleanText = aiResult.replace(/<[^>]*>/g, '').trim();
                            setNewSummary(cleanText);
                            toast.success('Set as summary!');
                          }}
                          className="w-full p-2 bg-cyan-950/30 hover:bg-cyan-950/60 text-cyan-400 border border-cyan-850 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Use as Summary Description
                        </button>
                      )}

                      {aiAction === 'titles' && (
                        <button
                          type="button"
                          onClick={() => {
                            const cleanText = aiResult.replace(/<[^>]*>/g, '').replace(/^[•\-\*\d\.\s]+/g, '').trim().split('\n')[0];
                            setNewTitle(cleanText);
                            toast.success('Set as post title!');
                          }}
                          className="w-full p-2 bg-cyan-950/30 hover:bg-cyan-950/60 text-cyan-400 border border-cyan-850 rounded-lg text-[10px] font-bold transition cursor-pointer"
                        >
                          Use First Title
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. Drafts Tab */}
          {activeTab === 'drafts' && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              {loadingPosts ? (
                <div className="text-center py-6 text-slate-400">Loading drafts...</div>
              ) : posts.filter(p => p.status === 'draft').length === 0 ? (
                <div className="text-center py-6 text-slate-500">No drafts saved yet.</div>
              ) : (
                <>
                  <p className="text-slate-400 text-sm mb-2">You have {posts.filter(p => p.status === 'draft').length} draft(s) saved.</p>
                  {posts.filter(p => p.status === 'draft').map((blog) => (
                    <div key={blog._id} className="p-4 rounded-lg bg-slate-950 border border-slate-850 flex justify-between items-center hover:border-slate-800 transition">
                      <div>
                        <h4 className="font-bold text-white mb-1">{blog.title}</h4>
                        <span className="text-xs text-slate-500">Last updated: {new Date(blog.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(blog)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold rounded-lg transition cursor-pointer"
                        >
                          Resume Draft
                        </button>
                        <button 
                          onClick={() => handleDelete(blog._id)}
                          className="px-3.5 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-xs font-semibold text-rose-400 rounded-lg transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* 5. Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {loadingStats ? (
                <div className="text-center py-10 text-slate-400">Compiling analytics reports...</div>
              ) : !myStats ? (
                <div className="text-center py-10 text-slate-500">Failed to load analytics statistics.</div>
              ) : (
                <>
                  {/* Stats Cards Row */}
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl text-left">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Total Blogs</p>
                      <h4 className="text-2xl font-bold text-white mb-2">{myStats.totalPosts}</h4>
                      <p className="text-[10px] text-slate-400">
                        {myStats.publishedCount} Published • {myStats.draftCount} Drafts
                      </p>
                    </div>
                    <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl text-left">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Total Views</p>
                      <h4 className="text-2xl font-bold text-white mb-2">{myStats.totalViews}</h4>
                      <p className="text-[10px] text-cyan-400">Avg: {myStats.totalPosts > 0 ? Math.round(myStats.totalViews / myStats.totalPosts) : 0} views/post</p>
                    </div>
                    <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl text-left">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Total Likes</p>
                      <h4 className="text-2xl font-bold text-white mb-2">{myStats.totalLikes}</h4>
                      <p className="text-[10px] text-violet-400">{myStats.totalBookmarks} Bookmarks saved</p>
                    </div>
                    <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl text-left">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Writing Time</p>
                      <h4 className="text-2xl font-bold text-white mb-2">{myStats.totalReadMinutes} m</h4>
                      <p className="text-[10px] text-emerald-400">{myStats.totalComments} Comments received</p>
                    </div>
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 text-left">
                      <h3 className="text-sm font-bold text-slate-350">Blog Post Views (Top 10)</h3>
                      <AnalyticsChart type="bar" data={myStats.blogViewsData} xKey="title" yKey="views" />
                    </div>
                    <div className="space-y-2 text-left">
                      <h3 className="text-sm font-bold text-slate-350">Blog Likes Trend</h3>
                      <AnalyticsChart type="line" data={myStats.blogViewsData} xKey="title" yKey="likes" />
                    </div>
                  </div>

                  {/* Category weights */}
                  <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-left">
                    <h3 className="text-sm font-bold text-slate-300 mb-4">Blog Posts by Category</h3>
                    {myStats.categoryData?.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">No posts categorised yet</p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {myStats.categoryData.map((cat, idx) => (
                          <div key={idx} className="p-4 bg-slate-950/60 border border-slate-850 rounded-lg">
                            <p className="text-xs font-semibold text-violet-400 truncate mb-1">{cat.category}</p>
                            <h4 className="text-lg font-bold text-white">{cat.count} {cat.count === 1 ? 'post' : 'posts'}</h4>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 6. Bookmarks Tab */}
          {activeTab === 'bookmarks' && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl text-left">
              {loadingBookmarks ? (
                <div className="text-center py-6 text-slate-400">Fetching bookmarks...</div>
              ) : bookmarkedPosts.length === 0 ? (
                <div className="text-center py-6 text-slate-500">
                  No saved bookmarks yet. Go explore the Home page to save articles!
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-400 text-sm">You have bookmarked {bookmarkedPosts.length} post(s).</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookmarkedPosts.map((blog) => (
                      <Link 
                        to={`/blog/${blog._id}`} 
                        key={blog._id} 
                        className="p-4 rounded-lg bg-slate-950 border border-slate-850 flex gap-4 hover:border-slate-800 transition text-left"
                      >
                        <div 
                          className="w-20 h-20 rounded bg-slate-800 bg-cover bg-center shrink-0"
                          style={{ 
                            backgroundImage: blog.coverImage 
                              ? `url(${blog.coverImage})` 
                              : `linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.4))` 
                          }}
                        />
                        <div className="overflow-hidden">
                          <span className="text-[9px] font-bold text-violet-400 uppercase tracking-wider block mb-1">
                            {blog.category}
                          </span>
                          <h4 className="font-bold text-white text-sm line-clamp-2 mb-1">{blog.title}</h4>
                          <span className="text-[10px] text-slate-500 block">By {blog.author?.name || 'Author'}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7. Profile Tab */}
          {activeTab === 'profile' && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl max-w-2xl mx-auto text-left">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-6 border-b border-slate-800">
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white shadow-xl overflow-hidden">
                    {profileAvatar ? (
                      <img src={profileAvatar} alt={profileName} className="w-full h-full object-cover" />
                    ) : (
                      profileName?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-semibold rounded-full cursor-pointer transition">
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfileAvatarUpload} />
                  </label>
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {profileName || 'Author'}
                    {user?.role === 'admin' && (
                      <span className="px-2 py-0.5 bg-violet-950 text-violet-400 text-[10px] font-bold uppercase rounded border border-violet-900">
                        Admin
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-slate-400">{profileEmail}</p>
                  <p className="text-xs text-slate-500 mt-1">Profile Avatar & BIO can be loaded into public article author cards.</p>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-slate-400">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-600 transition" 
                      value={profileName} 
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-2 text-slate-400">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-4 py-2.5 text-sm text-slate-500" 
                      value={profileEmail} 
                      disabled 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2 text-slate-400">BIO</label>
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white h-20 focus:outline-none focus:border-violet-600 transition"
                    placeholder="Tell readers about yourself..."
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                  />
                </div>

                {/* Social Links Row */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider">Social Links</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold mb-1 text-slate-500">Twitter URL</label>
                      <input 
                        type="text" 
                        placeholder="https://twitter.com/username"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-600 transition"
                        value={profileTwitter}
                        onChange={(e) => setProfileTwitter(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold mb-1 text-slate-500">LinkedIn URL</label>
                      <input 
                        type="text" 
                        placeholder="https://linkedin.com/in/username"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-600 transition"
                        value={profileLinkedin}
                        onChange={(e) => setProfileLinkedin(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold mb-1 text-slate-500">GitHub URL</label>
                      <input 
                        type="text" 
                        placeholder="https://github.com/username"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-600 transition"
                        value={profileGithub}
                        onChange={(e) => setProfileGithub(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Password editing */}
                <div className="space-y-4 pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider">Update Password (Optional)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold mb-1 text-slate-500">New Password</label>
                      <input 
                        type="password" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-600 transition"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold mb-1 text-slate-500">Confirm New Password</label>
                      <input 
                        type="password" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-600 transition"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button type="submit" className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-sm font-semibold rounded-lg text-white transition cursor-pointer">
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* 8. Settings Tab */}
          {activeTab === 'settings' && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl max-w-2xl mx-auto space-y-6 text-left">
              <div>
                <h3 className="font-bold text-white mb-2">Workspace Settings</h3>
                <p className="text-xs text-slate-500 mb-4">Configure preferences for drafts auto-save and newsletter mailings.</p>
                <div className="space-y-3">
                  {[
                    { label: 'Auto-save drafts', desc: 'Saves your changes locally every 5 seconds' },
                    { label: 'Email notifications', desc: 'Receive emails when your articles get new views or comments' }
                  ].map((sett, i) => (
                    <label key={i} className="flex justify-between items-center p-3 rounded-lg bg-slate-950 border border-slate-850 cursor-pointer">
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{sett.label}</p>
                        <p className="text-xs text-slate-500">{sett.desc}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="w-4 h-4 accent-violet-600 cursor-pointer" />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 9. Admin Moderation Tab */}
          {activeTab === 'admin' && user?.role === 'admin' && (
            <div className="space-y-6 text-left">
              {/* Sub-navigation bar inside Admin Panel */}
              <div className="flex border-b border-slate-800 gap-6 pb-2">
                {[
                  { key: 'users', label: 'Manage Users' },
                  { key: 'blogs', label: 'Moderate Blogs' },
                  { key: 'comments', label: 'Moderate Comments' },
                  { key: 'stats', label: 'Platform Stats' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setAdminTab(tab.key)}
                    className={`pb-2 text-sm font-semibold transition border-b-2 cursor-pointer ${
                      adminTab === tab.key 
                        ? 'border-violet-650 text-white' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab 9A: Users Management */}
              {adminTab === 'users' && (
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                  <p className="text-xs text-slate-400">Total users registered on platform: {adminUsers.length}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-xs">
                          <th className="py-3 font-semibold">User Info</th>
                          <th className="py-3 font-semibold">Email</th>
                          <th className="py-3 font-semibold">Role</th>
                          <th className="py-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsers.map(u => (
                          <tr key={u._id} className="border-b border-slate-850 hover:bg-slate-950/20">
                            <td className="py-3 font-medium text-white">{u.name}</td>
                            <td className="py-3 text-slate-400">{u.email}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                                u.role === 'admin' ? 'bg-violet-950 text-violet-400' : 'bg-slate-950 text-slate-400'
                              }`}>
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 text-right space-x-2">
                              {u._id !== user._id && (
                                <>
                                  <button 
                                    onClick={() => handleToggleUserRole(u._id, u.role)}
                                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-[10px] font-bold rounded cursor-pointer transition"
                                  >
                                    Role
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteUser(u._id)}
                                    className="px-2.5 py-1 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 text-[10px] font-bold rounded cursor-pointer transition"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 9B: Blogs Moderation */}
              {adminTab === 'blogs' && (
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                  <p className="text-xs text-slate-400">Total posts on platform: {adminPosts.length}</p>
                  <div className="space-y-3">
                    {adminPosts.map((blog) => (
                      <div key={blog._id} className="p-4 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between hover:border-slate-800 transition">
                        <div className="flex gap-4 items-center overflow-hidden">
                          <div 
                            className="w-12 h-12 bg-slate-800 bg-cover bg-center rounded shrink-0" 
                            style={{ 
                              backgroundImage: blog.coverImage 
                                ? `url(${blog.coverImage})` 
                                : `linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.4))` 
                            }} 
                          />
                          <div className="overflow-hidden">
                            <h4 className="font-bold text-white text-sm line-clamp-1 mb-0.5">{blog.title}</h4>
                            <span className="text-[10px] text-slate-500">
                              By {blog.author?.name || 'Author'} • {blog.category} • {blog.readTime || '3 min read'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Link 
                            to={`/blog/${blog._id}`} 
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] font-bold rounded-lg cursor-pointer"
                          >
                            View
                          </Link>
                          <button 
                            onClick={() => handleAdminDeletePost(blog._id)}
                            className="px-3 py-1.5 bg-rose-950/20 hover:bg-rose-950/40 text-rose-450 border border-rose-900/30 text-[10px] font-bold rounded-lg cursor-pointer transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 9C: Comments Moderation */}
              {adminTab === 'comments' && (
                <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                  <p className="text-xs text-slate-400">Total comments: {adminComments.length}</p>
                  <div className="space-y-3">
                    {adminComments.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">No comments found platform-wide.</p>
                    ) : (
                      adminComments.map((com) => (
                        <div key={com._id} className="p-4 rounded-lg bg-slate-950 border border-slate-850 flex items-start justify-between hover:border-slate-800 transition">
                          <div>
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-semibold text-white">{com.author?.name || 'Author'}</span>
                              <span className="text-[10px] text-slate-500">on "{com.post?.title || 'Unknown post'}"</span>
                              <span className="text-[10px] text-slate-600">• {new Date(com.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-xs text-slate-350">{com.content}</p>
                          </div>
                          <button 
                            onClick={() => handleAdminDeleteComment(com._id)}
                            className="px-2.5 py-1.5 bg-rose-950/10 hover:bg-rose-950/30 border border-rose-950/20 text-rose-450 text-[10px] font-bold rounded cursor-pointer transition"
                          >
                            Delete
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 9D: Platform Stats Charts */}
              {adminTab === 'stats' && (
                <div className="space-y-6">
                  {loadingAdminStats ? (
                    <div className="text-center py-6 text-slate-400">Loading platform-wide stats...</div>
                  ) : !adminStats ? (
                    <div className="text-center py-6 text-slate-500">Failed to compile admin stats.</div>
                  ) : (
                    <>
                      {/* Metric cards */}
                      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Users</p>
                          <h4 className="text-2xl font-bold text-white">{adminStats.totalUsers}</h4>
                        </div>
                        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Posts</p>
                          <h4 className="text-2xl font-bold text-white">{adminStats.totalPosts}</h4>
                        </div>
                        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Views</p>
                          <h4 className="text-2xl font-bold text-white">{adminStats.totalViews}</h4>
                        </div>
                        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Platform Comments</p>
                          <h4 className="text-2xl font-bold text-white">{adminStats.totalComments}</h4>
                        </div>
                      </div>

                      {/* Top Articles List */}
                      <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl">
                        <h3 className="text-sm font-bold text-slate-300 mb-4">Top 5 Most Viewed Articles</h3>
                        <div className="space-y-2">
                          {adminStats.topPosts?.map((tp, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-slate-850 text-xs">
                              <span className="font-semibold text-white truncate max-w-md">{tp.title}</span>
                              <div className="flex gap-4 text-slate-450">
                                <span>{tp.views} views</span>
                                <span>{tp.likes} likes</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
