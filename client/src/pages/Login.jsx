import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { login, loading, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Login | AI BlogForge';
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Login failed');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`;
  };

  const handleDemoLogin = async () => {
    const demoEmail = 'demo@blogforge.com';
    const demoPassword = 'password123';
    const demoName = 'Demo Writer';
    
    const toastId = toast.loading('Initiating demo workspace...');
    try {
      // 1. Try to login directly
      let result = await login(demoEmail, demoPassword);
      if (result.success) {
        toast.success('Welcome to Demo Workspace!', { id: toastId });
        navigate('/dashboard');
        return;
      }
      
      // 2. Register first if the account doesn't exist
      toast.loading('Provisioning demo database account...', { id: toastId });
      const regResponse = await api.post('/auth/register', {
        name: demoName,
        email: demoEmail,
        password: demoPassword
      });
      
      if (regResponse.data?.success) {
        // 3. Retry login
        result = await login(demoEmail, demoPassword);
        if (result.success) {
          toast.success('Demo account provisioned and logged in!', { id: toastId });
          navigate('/dashboard');
          return;
        }
      }
      toast.error('Authentication check failed', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Demo sandbox environment unavailable', { id: toastId });
    }
  };

  return (
    <div className="main-content">
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your AI BlogForge account</p>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="name@example.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })} 
              />
              {errors.email && <span style={{ color: 'var(--error)', fontSize: '12px' }}>{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })} 
              />
              {errors.password && <span style={{ color: 'var(--error)', fontSize: '12px' }}>{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '12px', background: 'white', color: '#111827', border: '1px solid #d1d5db' }}
            >
              Sign in with Google
            </button>
            
            <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: '10px' }}>Want to look around? Use the demo account:</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={handleDemoLogin}
                  className="btn btn-secondary" 
                  style={{ 
                    flex: 1,
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.1))', 
                    borderColor: 'var(--primary)',
                    padding: '8px 12px',
                    fontSize: '13px'
                  }}
                >
                  ✨ One-Click Demo
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setValue('email', 'demo@blogforge.com');
                    setValue('password', 'password123');
                    toast.success('Demo credentials filled!');
                  }}
                  className="btn btn-secondary" 
                  style={{ 
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '13px'
                  }}
                >
                  Fill Credentials
                </button>
              </div>
            </div>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
