import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled runtime error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
            {/* Warning SVG Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-rose-950/30 flex items-center justify-center text-rose-500 border border-rose-900/40">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-white font-heading">Oops! Something went wrong</h2>
              <p className="text-sm text-slate-400">
                An unexpected system boundary error was encountered in this view.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 overflow-x-auto max-h-32 text-left">
                <code className="text-xs text-rose-450 font-mono block whitespace-pre">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div className="pt-2">
              <button 
                onClick={this.handleReload}
                className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold rounded-lg shadow-lg shadow-violet-950/20 transition cursor-pointer"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
