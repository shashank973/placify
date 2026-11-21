import React from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-[#0d121f] border-t border-slate-800/80 py-8 px-4 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm">Placify</span>
            <span className="text-slate-500">|</span>
            <span>AI-Powered Placement Preparation & Assessment Platform</span>
          </div>

          <nav aria-label="Footer navigation" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/companies" className="hover:text-white transition-colors">Companies</Link>
            <Link to="/pyqs" className="hover:text-white transition-colors">PYQ Repository</Link>
            <Link to="/coding" className="hover:text-white transition-colors">Coding</Link>
            <Link to="/mock-tests" className="hover:text-white transition-colors">Mock Tests</Link>
            <Link to="/doubt-solver" className="hover:text-white transition-colors flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" /> AI Solver
            </Link>
          </nav>
        </div>

        <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <nav aria-label="Legal and contact links" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-use" className="hover:text-white transition-colors">Terms of Use</Link>
          </nav>
          <p className="text-center">
            © {new Date().getFullYear()} Placify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

