import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Recycle, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate UTF-8 byte length
  const passwordBytes = new TextEncoder().encode(password).length;
  const isByteLengthValid = passwordBytes >= 8 && passwordBytes <= 72;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (passwordBytes < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    if (passwordBytes > 72) {
      setErrorMsg(`Password exceeds the maximum supported limit of 72 UTF-8 bytes (currently ${passwordBytes} bytes).`);
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, fullName);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl shadow-sm border border-slate-200">
      
      {/* Header */}
      <div className="text-center space-y-2 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-eco-100 text-eco-600 flex items-center justify-center mx-auto shadow-sm">
          <Recycle className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Create WasteWise Account
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Start scanning recyclables, earning points, and reducing landfill waste
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
            Full Name
          </label>
          <div className="relative">
            <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alex Green"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-500/30 focus:border-eco-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

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
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <span className={`text-[10px] font-bold ${passwordBytes > 72 ? 'text-red-600' : 'text-slate-400'}`}>
              {passwordBytes}/72 bytes
            </span>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters (max 72 bytes)"
              className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:outline-none transition-all placeholder:text-slate-400 ${
                password && !isByteLengthValid
                  ? 'border-red-300 focus:ring-2 focus:ring-red-400/30'
                  : 'border-slate-200 focus:ring-2 focus:ring-eco-500/30 focus:border-eco-500'
              }`}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Note: Enforces strict bcrypt 72 UTF-8 byte boundary limit for secure cryptographic hashing.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-500/30 focus:border-eco-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-eco-600 hover:bg-eco-700 disabled:opacity-50 shadow-sm shadow-eco-600/30 transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? 'Creating Account...' : 'Complete Registration'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-eco-600 hover:text-eco-700">
          Sign In
        </Link>
      </div>
    </div>
  );
};
