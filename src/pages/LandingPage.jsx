import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Code2,
  CheckCircle2,
  BarChart3,
  Bot,
  Trophy,
  Building2,
  BrainCircuit,
  ShieldCheck,
  ChevronRight,
  Flame,
  FileText,
  Mic,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  const companies = [
    { name: 'TCS', role: 'NQT Ninja / Digital / Prime', pkg: '3.6 - 11.5 LPA', color: 'from-blue-600 to-indigo-600' },
    { name: 'Infosys', role: 'SP / DSE / Systems Eng.', pkg: '3.6 - 9.5 LPA', color: 'from-indigo-600 to-blue-500' },
    { name: 'Amazon', role: 'SDE-1 / Summer Intern', pkg: '18 - 45 LPA', color: 'from-amber-600 to-orange-500' },
    { name: 'Microsoft', role: 'Software Engineer', pkg: '16 - 44 LPA', color: 'from-cyan-600 to-blue-600' },
    { name: 'Accenture', role: 'ASE / Advanced ASE', pkg: '4.5 - 6.5 LPA', color: 'from-purple-600 to-indigo-600' },
    { name: 'Cognizant', role: 'GenC Next / Elevate', pkg: '4.0 - 6.75 LPA', color: 'from-teal-600 to-cyan-600' },
    { name: 'Capgemini', role: 'Exceller Senior Analyst', pkg: '4.0 - 7.5 LPA', color: 'from-blue-500 to-indigo-700' },
    { name: 'Wipro', role: 'Elite NTH / Turbo', pkg: '3.5 - 6.5 LPA', color: 'from-emerald-600 to-teal-600' },
  ];

  const features = [
    {
      icon: Building2,
      title: 'Company-Wise Targeted Prep',
      description: 'Dedicated modules for TCS, Infosys, Amazon, Microsoft, and Accenture with blueprints, past question patterns, and hiring rounds.',
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      icon: FileText,
      title: 'AI Resume ATS Auditor',
      description: 'Automated company-specific ATS score calculation, missing skill detection, section ratings, and Google X-Y-Z bullet rewrites.',
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: Mic,
      title: 'AI Voice Mock Interviewer',
      description: 'Real-time multi-round speech & text interview simulations tailored to your resume, role, and company with hiring committee verdict.',
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
    {
      icon: Code2,
      title: '100+ Coding Practice Arena',
      description: '100+ algorithmic challenges categorized into Easy, Medium, and Hard with Monaco editor supporting JS, Python, C++, and Java.',
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      icon: ShieldCheck,
      title: 'Proctored Mock Tests (50+ Qs)',
      description: '50+ questions per test with strict fullscreen enforcement, tab-switch tracking, and 3-switch auto-submission proctoring.',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: BrainCircuit,
      title: 'AI Performance Analyzer',
      description: 'Post-test Gemini intelligence pinpointing strong and weak topics, time inefficiencies, and company readiness scores.',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      icon: Bot,
      title: '24/7 AI Doubt Solver',
      description: 'Instant step-by-step mentor assistance for aptitude shortcuts, code debugging, and technical interview concepts.',
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
    },
    {
      icon: Trophy,
      title: 'Gamified Leaderboard & Badges',
      description: 'Real-time college-wise rankings, daily practice streaks, and achievement milestones to keep your prep consistent.',
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 px-4 lg:px-8 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Powered Placement Preparation Platform for B.Tech Aspirants</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Crack Your Dream Campus Placement with{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
            Practice company-wise PYQs for <span className="text-white font-medium">TCS, Infosys, Amazon, Microsoft</span>,
            solve coding problems in Monaco Editor, attempt timed mock tests, and receive automated AI performance diagnostics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all"
              >
                Go to Student Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all"
                >
                  Start Preparing Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#111726] hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-all"
                >
                  Explore Demo Accounts
                </Link>
              </>
            )}
          </div>

          {/* Quick Metrics Banner */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-[#111726]/60 border border-slate-800">
              <p className="text-2xl font-bold text-white">8+ Top</p>
              <p className="text-xs text-slate-400">IT & Product Companies</p>
            </div>
            <div className="p-4 rounded-xl bg-[#111726]/60 border border-slate-800">
              <p className="text-2xl font-bold text-indigo-400">100%</p>
              <p className="text-xs text-slate-400">Monaco Editor Runner</p>
            </div>
            <div className="p-4 rounded-xl bg-[#111726]/60 border border-slate-800">
              <p className="text-2xl font-bold text-purple-400">Gemini AI</p>
              <p className="text-xs text-slate-400">Weak Topic Analyzer</p>
            </div>
            <div className="p-4 rounded-xl bg-[#111726]/60 border border-slate-800">
              <p className="text-2xl font-bold text-emerald-400">Real-Time</p>
              <p className="text-xs text-slate-400">Timed Mock Assessments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Companies Grid */}
      <section className="py-16 px-4 lg:px-8 border-b border-slate-800/80 bg-[#0d121f]/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Company-Specific Placement Blueprints
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Every company has a unique pattern. Prepare with tailored syllabi, past questions, and hiring rounds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {companies.map((c) => (
              <Link
                key={c.name}
                to={`/companies/${c.name.toLowerCase()}`}
                className="p-5 rounded-2xl bg-[#111726] border border-slate-800 hover:border-indigo-500/50 transition-all group shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${c.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                    {c.name.slice(0, 3)}
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {c.pkg}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{c.role}</p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-indigo-400 font-medium">
                  <span>View Prep Pattern</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Core Modules & Features */}
      <section className="py-20 px-4 lg:px-8 border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              All 10 Essential Modules in One Unified Platform
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              From foundational aptitude shortcuts to high-concurrency coding and AI performance diagnostics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#111726] border border-slate-800/90 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${f.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">{f.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 px-4 lg:px-8 border-b border-slate-800/80 bg-[#0d121f]/50">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">How Placify Works</h2>
            <p className="text-xs sm:text-sm text-slate-400">Four easy steps to turn campus placement anxiety into confidence.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 relative">
              <span className="text-3xl font-black text-indigo-500/30">01</span>
              <h4 className="text-sm font-bold text-white mt-2">Pick Target Company</h4>
              <p className="text-xs text-slate-400 mt-1">Select from TCS, Infosys, Amazon, Microsoft and unlock custom syllabi.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 relative">
              <span className="text-3xl font-black text-indigo-500/30">02</span>
              <h4 className="text-sm font-bold text-white mt-2">Generate AI Study Plan</h4>
              <p className="text-xs text-slate-400 mt-1">Receive a weekly structured daily schedule based on your time constraints.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 relative">
              <span className="text-3xl font-black text-indigo-500/30">03</span>
              <h4 className="text-sm font-bold text-white mt-2">Practice PYQs & Code</h4>
              <p className="text-xs text-slate-400 mt-1">Solve company previous questions and run code live in Monaco Editor.</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 relative">
              <span className="text-3xl font-black text-indigo-500/30">04</span>
              <h4 className="text-sm font-bold text-white mt-2">Mock Tests & AI Analysis</h4>
              <p className="text-xs text-slate-400 mt-1">Attempt timed tests and get automated AI diagnostic reports on weak topics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Ace Your On-Campus Placements?
          </h2>
          <p className="text-sm text-slate-300">
            Join thousands of engineering students mastering placement aptitude, coding, and mock assessments.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all"
            >
              Get Started Now
            </Link>
            <Link
              to="/companies"
              className="px-6 py-3 rounded-xl bg-[#111726] hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-all"
            >
              Browse Company Papers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

