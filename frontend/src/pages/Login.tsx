import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Recycle, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setErrorMsg(null);
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl shadow-sm border border-slate-200">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-eco-100 text-eco-600 flex items-center justify-center mx-auto shadow-sm">
          <Recycle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Welcome to WasteWise AI
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Sign in to track your recycling history and sustainability score
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <p>{errorMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-500/30 focus:border-eco-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-500/30 focus:border-eco-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-eco-600 hover:bg-eco-700 disabled:opacity-50 shadow-sm shadow-eco-600/30 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Quick Test Demo Credentials */}
      <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-eco-600" />
          One-Click Demo Credentials:
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillCredentials('admin@wastewise.ai', 'AdminPassword123!')}
            className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-xs transition-colors"
          >
            <div className="font-extrabold text-slate-800">Admin Account</div>
            <div className="text-[10px] text-slate-500 truncate">admin@wastewise.ai</div>
          </button>
          <button
            type="button"
            onClick={() => fillCredentials('user@wastewise.ai', 'UserPassword123!')}
            className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-eco-50 border border-slate-200 hover:border-eco-300 text-xs transition-colors"
          >
            <div className="font-extrabold text-slate-800">Standard User</div>
            <div className="text-[10px] text-slate-500 truncate">user@wastewise.ai</div>
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link to="/register" className="font-bold text-eco-600 hover:text-eco-700">
          Sign up free
        </Link>
      </div>
    </div>
  );
};
