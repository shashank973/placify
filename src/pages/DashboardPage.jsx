import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  Award,
  CheckCircle2,
  Code2,
  FileCheck2,
  Flame,
  ArrowRight,
  BookOpen,
  Calendar,
  Building2,
  Clock,
  Play,
  Lightbulb,
  FileText,
  Bot,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AIStudyPlanModal from '../components/ai/AIStudyPlanModal';
import api from '../api';
import { getUserDisplayIdentity } from '../utils/userIdentity';

export default function DashboardPage() {
  const { user, refreshUser } = useAuth();
  const displayIdentity = getUserDisplayIdentity(user);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentTests, setRecentTests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        await refreshUser();
        const [testsRes, recRes] = await Promise.all([
          api.get('/tests/history/my-submissions').catch(() => ({ data: { submissions: [] } })),
          api.get('/ai/recommendations').catch(() => ({ data: { recommendations: [] } })),
        ]);

        setRecentTests(testsRes.data.submissions || []);
        setRecommendations(recRes.data.recommendations || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const performanceTrendData = [
    { day: 'Mon', score: 62, accuracy: 70 },
    { day: 'Tue', score: 68, accuracy: 75 },
    { day: 'Wed', score: 74, accuracy: 80 },
    { day: 'Thu', score: 71, accuracy: 78 },
    { day: 'Fri', score: 82, accuracy: 85 },
    { day: 'Sat', score: 79, accuracy: 83 },
    { day: 'Sun', score: 88, accuracy: 89 },
  ];

  const competencyBreakdownData = [
    { subject: 'Quant', value: 85 },
    { subject: 'Reasoning', value: 78 },
    { subject: 'Verbal', value: 70 },
    { subject: 'CS Core', value: 82 },
    { subject: 'Coding', value: 75 },
  ];

  const companyReadiness = [
    { name: 'TCS', role: 'Ninja / Digital', readiness: 85, color: 'bg-blue-500' },
    { name: 'Infosys', role: 'DSE / SP', readiness: 78, color: 'bg-indigo-500' },
    { name: 'Amazon', role: 'SDE-1', readiness: 65, color: 'bg-amber-500' },
    { name: 'Microsoft', role: 'SWE', readiness: 62, color: 'bg-cyan-500' },
  ];

  if (loading) {
    return <LoadingSpinner text="Loading placement analytics dashboard..." fullPage />;
  }

  const userStats = user?.stats || {
    testsCompleted: recentTests.length || 1,
    codingSolved: 4,
    totalQuestionsAttempted: 52,
    overallAccuracy: 81,
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Target Company Banner */}
      <div className="dashboard-welcome-panel relative overflow-hidden p-6 sm:p-8 rounded-3xl border shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Targeting: {displayIdentity.targetCompany || 'Amazon'} 🎯
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                {user?.streakDays || 1} Day Streak
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {displayIdentity.name || 'Aspirant'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              You are currently preparing for 2026 campus placements. Keep your daily momentum to clear aptitude cutoffs and coding rounds!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowPlanModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4" /> AI Study Plan
            </button>
            <Link
              to="/mock-tests"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111726] hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-all"
            >
              <Play className="w-4 h-4 text-emerald-400" /> Take Mock Test
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Questions Attempted"
          value={userStats.totalQuestionsAttempted}
          subtext="PYQs & Practice MCQs"
          icon={BookOpen}
          color="brand"
          trend="+12 this week"
        />
        <StatCard
          title="Mock Tests Taken"
          value={userStats.testsCompleted}
          subtext="Timed company assessments"
          icon={FileCheck2}
          color="emerald"
          trend="83% average score"
        />
        <StatCard
          title="Coding Solved"
          value={userStats.codingSolved}
          subtext="Verified in Monaco Editor"
          icon={Code2}
          color="cyan"
          trend="Accepted submissions"
        />
        <StatCard
          title="Platform Accuracy"
          value={`${userStats.overallAccuracy}%`}
          subtext="Across all domains"
          icon={TrendingUp}
          color="purple"
          trend="Top 15% percentile"
        />
      </div>

      {/* Featured AI Modules: Resume Analyzer & Mock Interview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/resume-analyzer"
          className="dashboard-feature-card dashboard-feature-card--resume p-5 rounded-2xl border transition group flex items-start gap-4 shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition flex-shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                AI Resume ATS Auditor
              </h3>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                New
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Scan your resume against TCS, Amazon, and Microsoft ATS filters. Get missing keywords, section scores, and Google X-Y-Z bullet rewrites.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 mt-2">
              Audit Resume <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </span>
          </div>
        </Link>

        <Link
          to="/mock-interview"
          className="dashboard-feature-card dashboard-feature-card--interview p-5 rounded-2xl border transition group flex items-start gap-4 shadow-lg"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition flex-shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                AI Mock Interviewer
              </h3>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Voice AI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Experience dynamic multi-round placement interviews with real-time speech recognition, audio answers, and instant hiring committee evaluations.
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-400 mt-2">
              Start Voice Interview <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </span>
          </div>
        </Link>
      </div>

      {/* Charts Section: Performance Trends & Competencies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Accuracy Trend */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#111726] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Daily Performance & Score Trend</h3>
              <p className="text-xs text-slate-400">Score & accuracy trajectory over the past week</p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Live Recharts
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[40, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d121f',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Competency Breakdown Bar Chart */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Subject Mastery</h3>
              <p className="text-xs text-slate-400">Accuracy % per domain</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={competencyBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="subject" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0d121f',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="value" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two-Column Section: Company Readiness & Recent Test Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Readiness Meters */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Company Readiness Indicators</h3>
            </div>
            <Link to="/companies" className="text-xs text-indigo-400 hover:underline">
              View all 8 companies
            </Link>
          </div>

          <div className="space-y-3.5">
            {companyReadiness.map((comp) => (
              <div key={comp.name} className="p-3 rounded-xl bg-[#0d121f] border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{comp.name}</span>
                    <span className="text-slate-400 text-[11px]">({comp.role})</span>
                  </div>
                  <span className="font-bold text-indigo-400">{comp.readiness}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className={`${comp.color} h-full rounded-full transition-all`} style={{ width: `${comp.readiness}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Mock Assessments & Activities */}
        <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Recent Mock Assessments</h3>
            </div>
            <Link to="/mock-tests" className="text-xs text-indigo-400 hover:underline">
              Explore Tests
            </Link>
          </div>

          {recentTests.length > 0 ? (
            <div className="space-y-3">
              {recentTests.slice(0, 3).map((test) => (
                <div
                  key={test._id}
                  className="p-3.5 rounded-xl bg-[#0d121f] border border-slate-800 flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{test.testTitle}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Score: <span className="text-emerald-400 font-semibold">{test.score}/{test.totalMarks}</span> | Accuracy: {test.accuracy}%
                    </p>
                  </div>
                  <Link
                    to={`/test-results/${test._id}`}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors shrink-0"
                  >
                    <span>AI Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#0d121f] border border-dashed border-slate-800 rounded-xl space-y-2">
              <Clock className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-300">No mock assessments completed yet.</p>
              <Link
                to="/mock-tests"
                className="inline-block mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white"
              >
                Attempt Your First Test
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* AI Smart Practice Recommendations */}
      {recommendations.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#111726] border border-indigo-500/20 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Smart AI Practice Recommendations</h3>
            </div>
            <Link to="/pyqs" className="text-xs text-indigo-400 hover:underline">
              View All Questions
            </Link>
          </div>
          <p className="text-xs text-slate-400">
            Targeted practice questions identified based on your weak topics and target company ({user?.targetCompany || 'Amazon'}).
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {recommendations.slice(0, 3).map((q) => (
              <div key={q._id} className="p-3.5 rounded-xl bg-[#0d121f] border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {q.company}
                    </span>
                    <span className="text-[10px] text-slate-400">{q.topic}</span>
                  </div>
                  <p className="text-xs text-slate-200 line-clamp-2">{q.questionText}</p>
                </div>
                <Link
                  to="/pyqs"
                  className="mt-3 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <span>Practice Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Plan Modal */}
      <AIStudyPlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        initialCompany={user?.targetCompany || 'Amazon'}
      />
    </div>
  );
}

