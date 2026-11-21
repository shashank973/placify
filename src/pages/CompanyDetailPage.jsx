import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  BookOpen,
  Code2,
  Lightbulb,
  Clock,
  Sparkles,
  Play,
  ChevronRight,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import AIStudyPlanModal from '../components/ai/AIStudyPlanModal';
import api from '../api';

export default function CompanyDetailPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, syllabus, pyqs, mocktests
  const [showPlanModal, setShowPlanModal] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/companies/${slug}`);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch company details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [slug]);

  if (loading) {
    return <LoadingSpinner text="Loading company recruitment details..." fullPage />;
  }

  if (!data || !data.company) {
    return (
      <div className="p-8 text-center bg-[#111726] border border-slate-800 rounded-3xl space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Company Not Found</h2>
        <p className="text-xs text-slate-400">The requested company blueprint does not exist.</p>
        <Link to="/companies" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Companies
        </Link>
      </div>
    );
  }

  const { company, pyqs = [], mockTests = [], codingProblems = [] } = data;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link to="/companies" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> All Companies
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-[#111726] border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shrink-0">
              {company.name.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{company.name}</h1>
                <Badge variant={company.difficulty === 'Hard' ? 'rose' : company.difficulty === 'Medium' ? 'amber' : 'emerald'}>
                  {company.difficulty}
                </Badge>
              </div>
              <p className="text-xs text-indigo-300 font-semibold">{company.tagline || `${company.name} Recruitment Preparation`}</p>
              <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">{company.description}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => setShowPlanModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4" /> AI Prep Schedule
            </button>
            <Link
              to="/mock-tests"
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#111726] hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs transition-all"
            >
              <Play className="w-4 h-4 text-emerald-400" /> Start Mock Test
            </Link>
          </div>
        </div>

        {/* Quick Highlights Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-indigo-500/20">
          <div className="p-3 rounded-xl bg-[#0d121f]/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Package Range</span>
            <span className="text-sm font-bold text-indigo-400">{company.packageRange}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d121f]/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Min. CGPA</span>
            <span className="text-sm font-bold text-white">{company.eligibility?.cgpa || '60%'}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d121f]/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">PYQ Bank</span>
            <span className="text-sm font-bold text-emerald-400">{pyqs.length}+ Questions</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0d121f]/80 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Timed Mock Tests</span>
            <span className="text-sm font-bold text-purple-400">{mockTests.length || 1} Tests</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Hiring Rounds & Tips' },
          { id: 'syllabus', label: 'Detailed Syllabus' },
          { id: 'pyqs', label: `Previous Year Questions (${pyqs.length})` },
          { id: 'mocktests', label: `Mock Assessments (${mockTests.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Hiring Rounds & Tips */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rounds */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" /> Selection Process Breakdown
            </h3>
            <div className="space-y-3">
              {(company.selectionProcess || []).map((round, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#111726] border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {round.roundNumber || idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-white">{round.name}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400">{round.duration}</span>
                      {round.elimination && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Elimination Round
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{round.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips & Roles */}
          <div className="space-y-5">
            {/* Roles */}
            <div className="p-5 rounded-2xl bg-[#111726] border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white">Target Roles</h3>
              <div className="flex flex-wrap gap-2">
                {(company.hiringRoles || []).map((r, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-[#0d121f] text-indigo-300 border border-slate-800">
                    {r}
                  </span>
                ))}
              </div>
            </div>

            {/* Placement Tips */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-[#111726] border border-indigo-500/20 space-y-3">
              <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" /> Placement Pro Tips
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(company.tips || []).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Syllabus */}
      {activeTab === 'syllabus' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(company.syllabus || []).map((sec, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#111726] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white">{sec.section}</h4>
                <span className="text-xs font-bold text-indigo-400">{sec.weightage}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {(sec.topics || []).map((top, tIdx) => (
                  <li key={tIdx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span>{top}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: PYQs */}
      {activeTab === 'pyqs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">Questions previously asked in {company.name} recruitment rounds.</p>
            <Link to="/pyqs" className="text-xs text-indigo-400 hover:underline">
              Open Full Question Bank
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pyqs.map((q) => (
              <div key={q._id} className="p-4 rounded-2xl bg-[#111726] border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {q.topic}
                  </span>
                  <Badge variant={q.difficulty === 'Hard' ? 'rose' : q.difficulty === 'Medium' ? 'amber' : 'emerald'}>
                    {q.difficulty}
                  </Badge>
                </div>
                <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">{q.questionText}</p>
                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <Link
                    to="/pyqs"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    Solve in Repository <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Mock Tests */}
      {activeTab === 'mocktests' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mockTests.map((t) => (
            <div key={t._id} className="p-5 rounded-2xl bg-[#111726] border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-indigo-400">{company.name} Full Assessment</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> {t.durationMinutes} Mins
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{t.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{t.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Total: {t.totalMarks} Marks</span>
                <Link
                  to={`/mock-tests/${t._id}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
                >
                  <Play className="w-3.5 h-3.5" /> Start Test Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Study Plan Modal */}
      <AIStudyPlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        initialCompany={company.name}
      />
    </div>
  );
}

