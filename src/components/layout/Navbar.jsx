import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Flame,
  Award,
  User,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getUserDisplayIdentity } from '../../utils/userIdentity';

export default function Navbar({ toggleSidebar, isSidebarOpen }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileDropdown, setProfileDropdown] = useState(false);
  const displayIdentity = getUserDisplayIdentity(user);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0d121f]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-colors">
      <div className="flex items-center justify-between">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden"
              aria-label="Toggle navigation"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span
                className="text-xl font-bold tracking-tight"
                style={{ color: 'var(--app-text)' }}
              >
                Placify
              </span>
              <span className="hidden sm:inline-block ml-1.5 text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                AI Prep
              </span>
            </div>
          </Link>
        </div>

        {/* Center / Navigation Links for Public View */}
        {!isAuthenticated && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link to="/companies" className="hover:text-indigo-400 transition-colors">Companies</Link>
            <Link to="/pyqs" className="hover:text-indigo-400 transition-colors">PYQ Archive</Link>
            <Link to="/coding" className="hover:text-indigo-400 transition-colors">Coding Practice</Link>
            <Link to="/mock-tests" className="hover:text-indigo-400 transition-colors">Mock Tests</Link>
            <Link to="/doubt-solver" className="hover:text-indigo-400 transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> AI Doubt Solver
            </Link>
          </nav>
        )}

        {/* Right: User State / CTA */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-700 text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-pressed={theme === 'dark'}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark'
              ? <Sun className="w-4 h-4" aria-hidden="true" />
              : <Moon className="w-4 h-4" aria-hidden="true" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Daily Streak */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>{user?.streakDays || 1} Day Streak</span>
              </div>

              {/* Points Badge */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>{user?.points || 0} pts</span>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-sm">
                    {displayIdentity.name ? displayIdentity.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-white leading-tight">{displayIdentity.name || 'Student'}</p>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {isAdmin ? 'Admin' : displayIdentity.targetCompany || 'Placement Prep'}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdown && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-[#111726] border border-slate-700/80 rounded-2xl shadow-xl shadow-black/60 py-2 z-50 text-xs"
                    onClick={() => setProfileDropdown(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="font-semibold text-white">{displayIdentity.name}</p>
                      <p className="text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <User className="w-4 h-4 text-indigo-400" /> My Profile & Goals
                    </Link>

                    <Link
                      to="/resume-analyzer"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-400" /> AI Resume Analyzer
                    </Link>

                    <Link
                      to="/mock-interview"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <Award className="w-4 h-4 text-indigo-400" /> AI Mock Interview
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-amber-400" /> Admin Control Panel
                      </Link>
                    )}

                    <div className="border-t border-slate-800 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 px-1.5 py-1 rounded-xl border border-slate-700/80">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-xs">
                  SS
                </div>
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs font-semibold text-white leading-tight whitespace-nowrap">
                    Shashank Srivastava
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 leading-tight whitespace-nowrap">
                    MNC / Company Prep
                  </p>
                </div>
              </div>
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-300 hover:text-white px-2 sm:px-3 py-2 rounded-xl hover:bg-slate-800/60 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-2.5 sm:px-4 py-2 rounded-xl shadow-md shadow-indigo-600/30 transition-all whitespace-nowrap"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

