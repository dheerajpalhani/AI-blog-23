import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, ChevronLeft, ChevronRight, Eye, ThumbsUp } from 'lucide-react';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter and pagination states
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const categories = ['All', 'Technology', 'Design', 'AI Integration', 'Development'];

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/posts', {
        params: {
          status: 'published',
          search: search || undefined,
          category: category !== 'All' ? category : undefined,
          sortBy,
          page,
          limit: 6,
        },
      });
      setPosts(response.data?.posts || []);
      setPages(response.data?.pages || 1);
      setTotal(response.data?.total || 0);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [category, sortBy, page, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="home-container">
      <section className="home-hero">
        <h1 className="hero-title">Forge Your Ideas with AI</h1>
        <p className="hero-subtitle">
          Discover a next-generation writing space where Gemini AI assists you in generating, refining, and publishing beautiful content.
        </p>
      </section>

      {/* Filter and Search Bar Row */}
      <div className="feed-controls">
        <div className="search-sort-bar">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <input
              type="text"
              placeholder="Search articles by title, tags, or content..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn flex items-center gap-1.5 cursor-pointer">
              <Search size={16} />
              Search
            </button>
          </form>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="sort-select cursor-pointer"
          >
            <option value="latest">Sort: Latest</option>
            <option value="views">Sort: Most Viewed</option>
            <option value="likes">Sort: Most Liked</option>
          </select>
        </div>

        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`category-pill cursor-pointer ${category === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading articles...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          No published articles found matching your criteria.
        </div>
      ) : (
        <>
          <div className="blogs-grid">
            {posts.map((post) => (
              <Link to={`/blog/${post._id}`} key={post._id} className="blog-card flex flex-col">
                <div 
                  className="blog-card-img" 
                  style={{ 
                    backgroundImage: post.coverImage 
                      ? `url(${post.coverImage})` 
                      : `linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.4))` 
                  }} 
                />
                <div className="blog-card-content">
                  <span className="blog-card-tag">{post.category || 'Blogging'}</span>
                  <h2 className="blog-card-title line-clamp-2">{post.title}</h2>
                  <p className="blog-card-desc line-clamp-3">{post.description || 'No description available.'}</p>
                  <div className="blog-card-meta">
                    <span className="truncate">By {post.author?.name || 'Anonymous'}</span>
                    <div className="flex gap-3 items-center shrink-0">
                      <span className="flex items-center gap-0.5"><Eye size={12} /> {post.views || 0}</span>
                      <span className="flex items-center gap-0.5"><ThumbsUp size={12} /> {post.likes?.length || 0}</span>
                      <span className="shrink-0">{post.readTime || '3 min read'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {pages > 1 && (
            <div className="pagination-container">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
                className="pagination-btn cursor-pointer"
              >
                <ChevronLeft size={16} />
                Prev
              </button>
              <span className="pagination-info">
                Page {page} of {pages} ({total} total articles)
              </span>
              <button
                disabled={page === pages}
                onClick={() => setPage((prev) => prev + 1)}
                className="pagination-btn cursor-pointer"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;
