import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Mail, Lock, Sparkles, ChevronRight } from 'lucide-react';

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
      let result = await login(demoEmail, demoPassword);
      if (result.success) {
        toast.success('Welcome to Demo Workspace!', { id: toastId });
        navigate('/dashboard');
        return;
      }
      
      toast.loading('Provisioning demo database account...', { id: toastId });
      const regResponse = await api.post('/auth/register', {
        name: demoName,
        email: demoEmail,
        password: demoPassword
      });
      
      if (regResponse.data?.success) {
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tight">AI BlogForge</span>
          </Link>
          <h1 className="text-3xl font-black text-white tracking-tight">Welcome back</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Sign in to continue to your workspace</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-black/40">

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-slate-700/80 text-slate-200 text-sm font-bold hover:bg-white/10 hover:border-slate-600 transition-all duration-200 cursor-pointer mb-6"
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  className="w-full bg-slate-800/60 border border-slate-700/80 text-white placeholder-slate-500 text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/50 transition-all"
                  placeholder="name@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-rose-400 font-semibold">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="password"
                  className="w-full bg-slate-800/60 border border-slate-700/80 text-white placeholder-slate-500 text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500/50 transition-all"
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                />
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-rose-400 font-semibold">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white font-bold text-sm shadow-lg shadow-violet-500/25 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  Sign In <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Demo Buttons */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Try a demo account</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 hover:border-violet-500/40 transition-all cursor-pointer"
              >
                <Sparkles size={13} /> One-Click Demo
              </button>
              <button
                type="button"
                onClick={() => {
                  setValue('email', 'demo@blogforge.com');
                  setValue('password', 'password123');
                  toast.success('Demo credentials filled!');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-400 bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:text-slate-200 transition-all cursor-pointer"
              >
                Fill Credentials
              </button>
            </div>
          </div>
        </div>

        {/* Footer link */}
        <p className="text-center mt-6 text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-violet-400 hover:text-violet-300 font-bold transition-colors">
            Register here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
