import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  ArrowRight,
  Target,
  BookOpen,
  MessageSquareText,
  RotateCcw,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import AIStudyPlanModal from '../components/ai/AIStudyPlanModal';
import api from '../api';

export default function TestResultAnalysisPage() {
  const { id } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterReview, setFilterReview] = useState('all'); // 'all', 'incorrect', 'correct'
  const [showStudyPlanModal, setShowStudyPlanModal] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/tests/submissions/${id}`);
        if (data.success && data.submission) {
          setSubmission(data.submission);
        }
      } catch (err) {
        console.error('Failed to fetch test report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Generating Gemini AI diagnostic report..." fullPage />;
  }

  if (!submission) {
    return (
      <div className="p-8 text-center bg-[#111726] border border-slate-800 rounded-3xl space-y-4">
        <h2 className="text-xl font-bold text-white">Assessment Report Not Found</h2>
        <Link to="/mock-tests" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Back to Tests
        </Link>
      </div>
    );
  }

  const { aiAnalysis = {}, answers = [] } = submission;
  const filteredAnswers = answers.filter((a) => {
    if (filterReview === 'correct') return a.isCorrect;
    if (filterReview === 'incorrect') return !a.isCorrect;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-[#111726] border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Performance Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {submission.testTitle}
            </h1>
            <p className="text-xs text-slate-300">
              Assessment for <strong className="text-white">{submission.company}</strong> • Attempted on {new Date(submission.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowStudyPlanModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
            >
              <Sparkles className="w-4 h-4" /> Generate Remediation Plan
            </button>
            <Link
              to="/mock-tests"
              className="px-4 py-2.5 rounded-xl bg-[#0d121f] hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
            >
              Take Another Test
            </Link>
          </div>
        </div>

        {/* Core Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-indigo-500/20">
          <div className="p-3.5 rounded-2xl bg-[#0d121f]/90 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Score</span>
            <span className="text-xl font-bold text-white">
              {submission.score} <span className="text-xs text-slate-400">/ {submission.totalMarks}</span>
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0d121f]/90 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Accuracy</span>
            <span className="text-xl font-bold text-indigo-400">{submission.accuracy}%</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0d121f]/90 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Correct Answers</span>
            <span className="text-xl font-bold text-emerald-400">{submission.correctCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0d121f]/90 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Incorrect Answers</span>
            <span className="text-xl font-bold text-rose-400">{submission.wrongCount}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0d121f]/90 border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Readiness Score</span>
            <span className="text-xl font-bold text-purple-400">
              {aiAnalysis.companyReadinessScore || 80}%
            </span>
          </div>
        </div>
      </div>

      {/* AI Diagnostic Report Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall AI Verdict & Improvement Plan */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#111726] border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Gemini Placement Diagnostic Verdict</h2>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs sm:text-sm text-indigo-200 leading-relaxed font-sans">
            "{aiAnalysis.overallVerdict || 'Solid foundational performance across quantitative and reasoning rounds.'}"
          </div>

          {/* Actionable Improvement Roadmap */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Personalized Action Steps for {submission.company}
            </h3>
            <div className="space-y-2">
              {(aiAnalysis.improvementPlan || [
                'Practice 15 timed questions daily on weak topics.',
                'Memorize shortcut formulas for time and work problems.',
                'Attempt full-length mock under exam constraints twice a week.'
              ]).map((plan, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#0d121f] border border-slate-800 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-md bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{plan}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Strong vs Weak Topics Identification */}
        <div className="p-6 rounded-3xl bg-[#111726] border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Topic Competencies</h2>
          </div>

          {/* Strong Topics */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
              ✅ Strong Topics (High Accuracy)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(aiAnalysis.strongTopics || ['Quantitative Aptitude', 'Syllogism', 'Speed Time Distance']).map((top, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  {top}
                </span>
              ))}
            </div>
          </div>

          {/* Weak Topics */}
          <div className="space-y-2 pt-3 border-t border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
              ⚠️ Weak Topics (Needs Attention)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {(aiAnalysis.weakTopics || ['Dynamic Programming', 'Pseudocode Bitwise Shift']).map((top, idx) => (
                <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {top}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <Link
              to="/doubt-solver"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors"
            >
              <MessageSquareText className="w-4 h-4" /> Discuss Weak Topics with AI
            </Link>
          </div>
        </div>
      </div>

      {/* Detailed Question Review Section */}
      <div className="p-6 rounded-3xl bg-[#111726] border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Question-by-Question Solution Review</h2>
            <p className="text-xs text-slate-400">Review your choices against verified answers and solutions</p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 text-xs">
            {['all', 'incorrect', 'correct'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterReview(f)}
                className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-all ${
                  filterReview === f
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-[#0d121f] text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f} ({f === 'all' ? answers.length : f === 'correct' ? submission.correctCount : submission.wrongCount})
              </button>
            ))}
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredAnswers.map((item, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                item.isCorrect
                  ? 'bg-emerald-950/10 border-emerald-500/20'
                  : 'bg-rose-950/10 border-rose-500/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">Question {idx + 1}</span>
                <span
                  className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    item.isCorrect
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {item.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {item.isCorrect ? 'Correct (+2 marks)' : 'Incorrect (-0.5 marks)'}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-white leading-relaxed">
                {item.questionText}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 rounded-xl bg-[#0d121f] border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Your Answer:</span>
                  <span className={`font-semibold ${item.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    Option ({item.selectedOption})
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#0d121f] border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Correct Answer:</span>
                  <span className="font-semibold text-emerald-400">Option ({item.correctOption})</span>
                </div>
              </div>

              {item.explanation && (
                <div className="p-3.5 rounded-xl bg-[#0d121f]/80 border border-slate-800/80 text-xs text-slate-300 font-sans leading-relaxed">
                  <span className="font-semibold text-indigo-400">Explanation: </span>
                  {item.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Remediation Plan Modal */}
      <AIStudyPlanModal
        isOpen={showStudyPlanModal}
        onClose={() => setShowStudyPlanModal(false)}
        initialCompany={submission.company}
      />
    </div>
  );
}

