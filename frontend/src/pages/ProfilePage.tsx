import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { 
  User as UserIcon, 
  Mail, 
  ShieldCheck, 
  Lock, 
  Award, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  Leaf 
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  const newPasswordBytes = new TextEncoder().encode(newPassword).length;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setIsUpdatingProfile(true);

    try {
      await authService.updateProfile({ full_name: fullName });
      await refreshUser();
      setProfileSuccess('Profile updated successfully!');
    } catch (err: any) {
      setProfileError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSuccess(null);
    setPwdError(null);

    if (newPassword !== confirmNewPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    if (newPasswordBytes < 8) {
      setPwdError('Password must be at least 8 characters.');
      return;
    }

    if (newPasswordBytes > 72) {
      setPwdError(`Password exceeds the maximum supported limit of 72 UTF-8 bytes (${newPasswordBytes} bytes).`);
      return;
    }

    setIsChangingPwd(true);
    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      setPwdSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setPwdError(err.response?.data?.detail || 'Failed to change password. Verify your current password.');
    } finally {
      setIsChangingPwd(false);
    }
  };

  if (!user) return null;

  return (
    <div className="py-8 max-w-4xl mx-auto space-y-8">
      
      {/* Header Profile Summary */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-eco-500 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{user.full_name}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                user.role === 'ADMIN' ? 'bg-indigo-500 text-white' : 'bg-eco-500/30 text-eco-300'
              }`}>
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{user.email}</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Member since {new Date(user.created_at).toLocaleDateString([], { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Tier & Score Badges */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 shrink-0">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Sustainability Tier</p>
            <p className="text-sm font-extrabold text-eco-400 mt-0.5">{user.eco_tier}</p>
          </div>
          <div className="border-l border-white/10 pl-4">
            <p className="text-[10px] uppercase font-bold text-slate-400">Score</p>
            <p className="text-sm font-extrabold text-white mt-0.5">{user.sustainability_score} pts</p>
          </div>
          <div className="border-l border-white/10 pl-4">
            <p className="text-[10px] uppercase font-bold text-slate-400">Streak</p>
            <p className="text-sm font-extrabold text-amber-400 mt-0.5 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              {user.current_streak}d
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left: Update Profile Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-black text-base text-slate-900 tracking-tight">
              Personal Information
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your display name and profile settings
            </p>
          </div>

          {profileSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-500/30 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address (Read-Only)
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right: Change Password */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-black text-base text-slate-900 tracking-tight">
              Security & Password
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Change password with strict 72-byte cryptographic validation
            </p>
          </div>

          {pwdSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{pwdSuccess}</span>
            </div>
          )}

          {pwdError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{pwdError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-500/30"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  New Password
                </label>
                <span className={`text-[10px] font-bold ${newPasswordBytes > 72 ? 'text-red-600' : 'text-slate-400'}`}>
                  {newPasswordBytes}/72 bytes
                </span>
              </div>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 chars (max 72 bytes)"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-500/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-eco-500/30"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPwd}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-eco-600 hover:bg-eco-700 transition-colors disabled:opacity-50"
            >
              {isChangingPwd ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
