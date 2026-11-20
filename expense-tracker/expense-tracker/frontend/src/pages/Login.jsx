import React, { useState } from 'react';
import { Mail, Lock, LogIn, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import AuthLayout from '../layouts/AuthLayout';

export default function Login({ onNavigateRegister }) {
  const { login } = useAuth();
  const { addToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModal, setForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Required field missing. Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password, rememberMe);
      addToast('Welcome back! Login successful.', 'success');
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid email or password.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@tracker.com');
    setPassword('Password123!');
    setError('');
    addToast('Demo credentials filled into fields.', 'info');
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to manage your expenses & budgets."
    >
      {/* Quick Demo Fill Button */}
      <div className="mb-6 p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div className="text-left">
            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
              Demo Account Available
            </p>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
              Pre-seeded with 120+ transactions & budgets
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleFillDemo}
          className="px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-indigo-900/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-xl shadow-xs border border-indigo-200/80 dark:border-indigo-800 transition-all shrink-0"
        >
          Auto-fill
        </button>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-xs font-medium text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              onClick={() => setForgotModal(true)}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <Lock className="w-4 h-4" />
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
            Remember me on this device
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-500/20 transition-all"
        >
          <LogIn className="w-4 h-4" />
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-6 text-center border-t border-slate-100 dark:border-slate-800 pt-5">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Don't have an account yet?{' '}
          <button
            onClick={onNavigateRegister}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            Create Account <ArrowRight className="w-3 h-3" />
          </button>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Password Reset
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              For security reasons in this application, you can easily log in with the pre-seeded demo user or update your password in your Profile settings once logged in.
            </p>
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs space-y-1 font-mono text-slate-700 dark:text-slate-300 mb-4">
              <p>Demo Email: demo@tracker.com</p>
              <p>Password: Password123!</p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setForgotModal(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
