import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  BookOpenCheck,
  Code2,
  FileCheck2,
  MessageSquareText,
  Trophy,
  UserCircle2,
  ShieldCheck,
  Sparkles,
  FileText,
  Bot,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserDisplayIdentity } from '../../utils/userIdentity';

export default function Sidebar({ isOpen, closeSidebar }) {
  const { user, isAdmin } = useAuth();
  const displayIdentity = getUserDisplayIdentity(user);

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Analyzer', path: '/resume-analyzer', icon: FileText, highlight: true, tag: 'ATS' },
    { name: 'AI Mock Interview', path: '/mock-interview', icon: Bot, highlight: true, tag: 'Voice' },
    { name: 'Company-Wise Prep', path: '/companies', icon: Building2 },
    { name: 'PYQ Repository', path: '/pyqs', icon: BookOpenCheck },
    { name: 'Coding Practice (100+)', path: '/coding', icon: Code2 },
    { name: 'Mock Assessments (50Q)', path: '/mock-tests', icon: FileCheck2 },
    { name: 'AI Doubt Solver', path: '/doubt-solver', icon: MessageSquareText, highlight: true, tag: 'AI' },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'My Profile', path: '/profile', icon: UserCircle2 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-[61px] left-0 z-30 h-screen lg:h-[calc(100vh-61px)] w-64 bg-[#0d121f] border-r border-slate-800/80 flex flex-col justify-between py-5 px-3 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Nav Links */}
        <div className="space-y-1">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Preparation Modules
          </p>

          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-inner'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.name}</span>
                </div>
                {link.highlight && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <Sparkles className="w-2.5 h-2.5" /> {link.tag || 'AI'}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* Admin link if user has admin privileges */}
          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-slate-800/80">
              <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-amber-500/80">
                Administration
              </p>
              <NavLink
                to="/admin"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                      : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Admin Dashboard</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Target Company Mini-Widget */}
        <div className="p-3.5 rounded-2xl bg-[#111726] border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-400">Targeting</span>
            <span className="text-xs font-bold text-indigo-400">{displayIdentity.targetCompany || 'Amazon'}</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[65%]" />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 text-center">
            Placement Readiness: <span className="font-semibold text-slate-200">65%</span>
          </p>
        </div>
      </aside>
    </>
  );
}

