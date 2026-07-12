import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/posts');
        setPosts(response.data?.posts || []);
      } catch (error) {
        console.error('Failed to fetch posts, using mock data as fallback:', error);
        // Mock data fallback
        setPosts([
          {
            _id: '1',
            title: 'The Future of AI in Web Development',
            description: 'Discover how modern AI tools are shifting the paradigms of full-stack engineering and user experience design.',
            tag: 'Technology',
            author: { name: 'Sarah Jenkins' },
            createdAt: new Date().toISOString(),
            readTime: '5 min read'
          },
          {
            _id: '2',
            title: 'Crafting Premium Glassmorphic Designs',
            description: 'A step-by-step guide to building highly interactive glassmorphism UI interfaces using vanilla CSS styling.',
            tag: 'Design',
            author: { name: 'Alex Rivera' },
            createdAt: new Date().toISOString(),
            readTime: '8 min read'
          },
          {
            _id: '3',
            title: 'Unlocking Gemini AI Capabilities in Express',
            description: 'Learn how to integrate the Gemini AI SDK into Node.js backend controllers to generate high-quality text dynamically.',
            tag: 'AI Integration',
            author: { name: 'David Chen' },
            createdAt: new Date().toISOString(),
            readTime: '12 min read'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="home-container">
      <section className="home-hero">
        <h1 className="hero-title">Forge Your Ideas with AI</h1>
        <p className="hero-subtitle">
          Discover a next-generation writing space where Gemini AI assists you in generating, refining, and publishing beautiful content.
        </p>
      </section>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading articles...</div>
      ) : (
        <div className="blogs-grid">
          {posts.map((post) => (
            <article key={post._id} className="blog-card">
              <div 
                className="blog-card-img" 
                style={{ 
                  backgroundImage: `linear-gradient(135deg, rgba(139, 92, 246, 0.4), rgba(6, 182, 212, 0.4))` 
                }} 
              />
              <div className="blog-card-content">
                <span className="blog-card-tag">{post.tag || 'Blogging'}</span>
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-card-desc">{post.description}</p>
                <div className="blog-card-meta">
                  <span>By {post.author?.name || 'Anonymous'}</span>
                  <span>{post.readTime || '3 min read'}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
