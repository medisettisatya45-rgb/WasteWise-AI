import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './NotificationBell';
import { 
  Recycle, 
  Camera, 
  MapPin, 
  LayoutDashboard, 
  History, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Leaf
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-eco-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-eco-500/20 group-hover:scale-105 transition-transform">
              <Recycle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-xl tracking-tight text-slate-900">
                <span>WasteWise</span>
                <span className="text-eco-600">AI</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                Identify. Recycle. Sustain.
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/scan"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/scan')
                  ? 'bg-eco-50 text-eco-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Camera className="w-4 h-4 text-eco-600" />
              Scan Waste
            </Link>

            <Link
              to="/centers"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isActive('/centers')
                  ? 'bg-eco-50 text-eco-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-600" />
              Recycling Centers
            </Link>

            {user && (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-eco-50 text-eco-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-teal-600" />
                  Dashboard
                </Link>

                <Link
                  to="/history"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive('/history')
                      ? 'bg-eco-50 text-eco-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <History className="w-4 h-4 text-cyan-600" />
                  History
                </Link>

                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive('/admin')
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50/50'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Right Area: Notifications & User Menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NotificationBell />

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-eco-500/20"
                  >
                    <div className="w-8 h-8 rounded-full bg-eco-100 text-eco-800 font-bold text-sm flex items-center justify-center border border-eco-200">
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden lg:inline text-sm font-semibold text-slate-700 max-w-[120px] truncate">
                      {user.full_name}
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-xs text-slate-500">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{user.email}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-eco-100 text-eco-800">
                            {user.eco_tier} ({user.sustainability_score} pts)
                          </span>
                          {user.role === 'ADMIN' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                              ADMIN
                            </span>
                          )}
                        </div>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        My Profile
                      </Link>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <Leaf className="w-4 h-4 text-eco-500" />
                        Sustainability Impact
                      </Link>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left font-medium"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-eco-600 hover:bg-eco-700 rounded-lg shadow-sm shadow-eco-600/30 transition-all hover:shadow"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/scan"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-eco-50 hover:text-eco-700"
          >
            <Camera className="w-5 h-5 text-eco-600" />
            Scan Waste
          </Link>
          <Link
            to="/centers"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-eco-50 hover:text-eco-700"
          >
            <MapPin className="w-5 h-5 text-emerald-600" />
            Recycling Centers
          </Link>

          {user && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-eco-50 hover:text-eco-700"
              >
                <LayoutDashboard className="w-5 h-5 text-teal-600" />
                Dashboard
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-eco-50 hover:text-eco-700"
              >
                <History className="w-5 h-5 text-cyan-600" />
                Scan History
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-slate-700 hover:bg-eco-50 hover:text-eco-700"
              >
                <UserIcon className="w-5 h-5 text-slate-600" />
                My Profile
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold text-indigo-700 bg-indigo-50"
                >
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  Admin Dashboard
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
};
