import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Code2,
  Play,
  Send,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Cpu,
  ArrowLeft,
  Lightbulb,
  Terminal,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import CodeEditor from '../components/coding/CodeEditor';
import AIHintModal from '../components/ai/AIHintModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function CodingWorkspacePage() {
  const { slug } = useParams();
  const { user, refreshUser } = useAuth();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editor State
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');

  // Execution & Testing State
  const [activeTab, setActiveTab] = useState('testcases'); // 'testcases' or 'result'
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  // AI Hint Modal
  const [hintModal, setHintModal] = useState({ isOpen: false, loading: false, hintText: '' });

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/coding/${slug}`);
        if (data.success && data.problem) {
          setProblem(data.problem);
          setCode(data.problem.starterCode?.[language] || '// Write your solution here');
        }
      } catch (err) {
        console.error('Failed to fetch coding problem:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [slug]);

  // Handle language change
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problem?.starterCode?.[newLang]) {
      setCode(problem.starterCode[newLang]);
    }
  };

  const handleResetCode = () => {
    if (problem?.starterCode?.[language]) {
      setCode(problem.starterCode[language]);
    }
  };

  // Run against sample test cases
  const handleRunCode = async () => {
    if (!problem) return;
    setIsRunning(true);
    setActiveTab('result');

    try {
      const { data } = await api.post('/coding/run', {
        problemId: problem._id,
        language,
        code,
      });

      if (data.success) {
        setExecutionResult(data.result);
      }
    } catch (err) {
      setExecutionResult({
        success: false,
        status: 'Runtime Error',
        passed: false,
        results: [{ error: err.response?.data?.message || err.message }],
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit against hidden test cases
  const handleSubmitCode = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setActiveTab('result');

    try {
      const { data } = await api.post('/coding/submit', {
        problemId: problem._id,
        language,
        code,
      });

      if (data.success) {
        setExecutionResult(data.result);
        if (data.result.passed) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
          refreshUser();
        }
      }
    } catch (err) {
      setExecutionResult({
        success: false,
        status: 'Submission Error',
        passed: false,
        results: [{ error: err.response?.data?.message || err.message }],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger Gemini AI Hint
  const handleGetAIHint = async () => {
    if (!problem) return;
    setHintModal({ isOpen: true, loading: true, hintText: '' });

    try {
      const { data } = await api.post('/coding/hint', {
        problemId: problem._id,
        language,
        code,
      });

      if (data.success) {
        setHintModal({ isOpen: true, loading: false, hintText: data.hint });
      }
    } catch (err) {
      setHintModal({
        isOpen: true,
        loading: false,
        hintText: 'Failed to retrieve AI review hint. Please try again.',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Launching Monaco Editor IDE..." fullPage />;
  }

  if (!problem) {
    return (
      <div className="p-8 text-center bg-[#111726] border border-slate-800 rounded-3xl space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Problem Not Found</h2>
        <Link to="/coding" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Practice
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#111726] border border-slate-800">
        <div className="flex items-center gap-3">
          <Link to="/coding" className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white">{problem.title}</h1>
              <Badge variant={problem.difficulty === 'Hard' ? 'rose' : problem.difficulty === 'Medium' ? 'amber' : 'emerald'}>
                {problem.difficulty}
              </Badge>
              <span className="hidden sm:inline-block text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {problem.company}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleGetAIHint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Review & Hint
          </button>

          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#182238] hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit Solution'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Description (Left) & Monaco Editor + Console (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Pane: Problem Details */}
        <div className="lg:col-span-5 bg-[#111726] border border-slate-800 rounded-2xl p-5 space-y-5 h-[calc(100vh-160px)] overflow-y-auto">
          <div>
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              {problem.category}
            </span>
            <h2 className="text-xl font-bold text-white mt-1">{problem.title}</h2>
          </div>

          {/* Description */}
          <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
            {problem.description}
          </div>

          {/* Examples */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sample Examples</h3>
            {(problem.examples || []).map((ex, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-[#0d121f] border border-slate-800/80 space-y-1.5 text-xs">
                <span className="font-bold text-indigo-400">Example {idx + 1}:</span>
                <div className="font-mono text-slate-300">
                  <p><span className="text-slate-500">Input: </span>{ex.input}</p>
                  <p><span className="text-slate-500">Output: </span>{ex.output}</p>
                </div>
                {ex.explanation && (
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 font-sans">
                    <span className="text-slate-300 font-semibold">Explanation: </span>{ex.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Constraints */}
          {problem.constraints && problem.constraints.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Constraints</h3>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1 font-mono">
                {problem.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Hints Accordion */}
          {problem.hints && problem.hints.length > 0 && (
            <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-400" /> Algorithmic Hints
              </span>
              <ul className="list-disc list-inside text-xs text-indigo-200/90 space-y-1">
                {problem.hints.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Pane: Monaco Code Editor + Output Console */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Editor Container */}
          <div className="h-[460px]">
            <CodeEditor
              code={code}
              onChange={(val) => setCode(val)}
              language={language}
              onLanguageChange={handleLanguageChange}
              onReset={handleResetCode}
              height="400px"
            />
          </div>

          {/* Bottom Console / Test Results Panel */}
          <div className="bg-[#111726] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            {/* Console Tabs */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#0d121f] border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('testcases')}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    activeTab === 'testcases' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sample Test Cases
                </button>
                <button
                  onClick={() => setActiveTab('result')}
                  className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                    activeTab === 'result' ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" /> Execution Console
                </button>
              </div>

              {executionResult && (
                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-indigo-400" /> {executionResult.runtimeMs || 25}ms
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Cpu className="w-3 h-3 text-purple-400" /> {executionResult.memoryKb || 12000} KB
                  </span>
                </div>
              )}
            </div>

            {/* Tab Body */}
            <div className="p-4 min-h-[160px] max-h-[220px] overflow-y-auto text-xs">
              {activeTab === 'testcases' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {(problem.examples || []).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestCaseIndex(idx)}
                        className={`px-3 py-1 rounded-lg font-semibold text-xs ${
                          activeTestCaseIndex === idx
                            ? 'bg-slate-700 text-white'
                            : 'bg-[#0d121f] text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {problem.examples && problem.examples[activeTestCaseIndex] && (
                    <div className="p-3 rounded-xl bg-[#0d121f] border border-slate-800 font-mono space-y-2">
                      <div>
                        <span className="text-slate-500 text-[11px] block">Input:</span>
                        <span className="text-slate-200">{problem.examples[activeTestCaseIndex].input}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[11px] block">Expected Output:</span>
                        <span className="text-emerald-400">{problem.examples[activeTestCaseIndex].output}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Result View */
                <div>
                  {!executionResult ? (
                    <div className="py-6 text-center text-slate-500">
                      Click <strong className="text-slate-400">Run Code</strong> to evaluate against sample test cases or <strong className="text-slate-400">Submit Solution</strong> to run against all hidden test cases.
                    </div>
                  ) : (
                    <div className="space-y-3 font-mono">
                      <div className="flex items-center gap-2">
                        {executionResult.passed ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{executionResult.status}</span>
                            <span className="text-xs text-slate-400 font-normal">
                              ({executionResult.passedTestCases}/{executionResult.totalTestCases} test cases passed)
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-400 font-bold text-sm">
                            <XCircle className="w-4 h-4" />
                            <span>{executionResult.status}</span>
                            <span className="text-xs text-slate-400 font-normal">
                              ({executionResult.passedTestCases}/{executionResult.totalTestCases} passed)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Individual test case results */}
                      <div className="space-y-2">
                        {(executionResult.results || []).map((r, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-lg border text-xs ${
                              r.passed ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold">Test Case {i + 1}: {r.passed ? 'PASSED' : 'FAILED'}</span>
                            </div>
                            {r.error ? (
                              <p className="text-rose-400 mt-1 font-mono text-[11px]">{r.error}</p>
                            ) : (
                              <div className="mt-1 text-[11px] space-y-0.5">
                                <p><span className="text-slate-400">Input: </span>{r.input}</p>
                                <p><span className="text-slate-400">Expected: </span>{r.expected}</p>
                                <p><span className="text-slate-400">Actual: </span>{r.actual}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Hint Modal */}
      <AIHintModal
        isOpen={hintModal.isOpen}
        onClose={() => setHintModal((prev) => ({ ...prev, isOpen: false }))}
        hintText={hintModal.hintText}
        loading={hintModal.loading}
        problemTitle={problem.title}
      />
    </div>
  );
}

