import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  XCircle,
  Flag,
  Maximize,
  ShieldAlert,
  Eye,
  AlertOctagon,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import api from '../api';

export default function MockTestLivePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Flattened Questions list across all sections
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User responses: { [questionId]: optionId }
  const [answers, setAnswers] = useState({});
  // Question status: 'unvisited', 'visited', 'answered', 'marked'
  const [questionStatus, setQuestionStatus] = useState({});

  // Countdown Timer
  const [secondsLeft, setSecondsLeft] = useState(60 * 60);
  const timerRef = useRef(null);

  // Fullscreen & Anti-Cheat Proctoring States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showTabWarningModal, setShowTabWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isTestLocked, setIsTestLocked] = useState(false);
  const isSwitchingRef = useRef(false);

  // Submit Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Test
  useEffect(() => {
    const fetchTest = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/tests/${id}`);
        if (data.success && data.test) {
          setTest(data.test);
          setSecondsLeft((data.test.durationMinutes || 60) * 60);

          const flatQs = [];
          (data.test.sections || []).forEach((sec) => {
            (sec.questions || []).forEach((q) => {
              flatQs.push({ ...q, sectionName: sec.name });
            });
          });

          setQuestions(flatQs);

          const initialStatus = {};
          flatQs.forEach((q, idx) => {
            initialStatus[q._id] = idx === 0 ? 'visited' : 'unvisited';
          });
          setQuestionStatus(initialStatus);
        }
      } catch (err) {
        console.error('Failed to load test:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [id]);

  // 2. Fullscreen Listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const requestFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.warn('Fullscreen request failed:', err.message);
    }
  };

  // 3. Tab Switch & Visibility Detection (Max 3 switches allowed)
  useEffect(() => {
    if (!test || isTestLocked) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isSwitchingRef.current = true;
      } else if (isSwitchingRef.current) {
        isSwitchingRef.current = false;
        triggerTabSwitch();
      }
    };

    const handleWindowBlur = () => {
      isSwitchingRef.current = true;
    };

    const handleWindowFocus = () => {
      if (isSwitchingRef.current) {
        isSwitchingRef.current = false;
        triggerTabSwitch();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [test, tabSwitches, isTestLocked]);

  const triggerTabSwitch = () => {
    const newCount = tabSwitches + 1;
    setTabSwitches(newCount);

    if (newCount === 1) {
      setWarningMessage(
        '⚠️ Warning 1 of 3: Tab switch or window focus loss detected! Navigating away from the assessment window is strictly prohibited. If you switch tabs 3 times, your exam will be automatically locked and submitted.'
      );
      setShowTabWarningModal(true);
    } else if (newCount === 2) {
      setWarningMessage(
        '🚨 FINAL WARNING (2 of 3): Second tab switch detected! One more tab switch will immediately terminate your assessment and submit all answers.'
      );
      setShowTabWarningModal(true);
    } else if (newCount >= 3) {
      setIsTestLocked(true);
      setShowTabWarningModal(false);
      alert('⛔ Exam Terminated: You exceeded the maximum allowed tab switches (3/3). Your assessment is automatically submitted.');
      handleSubmit(true, 'Terminated due to multiple tab switches / anti-cheat violation');
    }
  };

  // 4. Timer Tick
  useEffect(() => {
    if (!test || secondsLeft <= 0 || !isFullscreen || isTestLocked) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [test, secondsLeft, isFullscreen, isTestLocked]);

  const handleAutoSubmit = () => {
    handleSubmit(true, 'Time Expired');
  };

  const handleSelectOption = (qId, optionId) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionId }));
    setQuestionStatus((prev) => ({ ...prev, [qId]: 'answered' }));
  };

  const handleClearResponse = (qId) => {
    const updated = { ...answers };
    delete updated[qId];
    setAnswers(updated);
    setQuestionStatus((prev) => ({ ...prev, [qId]: 'visited' }));
  };

  const handleMarkForReview = (qId) => {
    setQuestionStatus((prev) => ({ ...prev, [qId]: 'marked' }));
    handleNext();
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextQId = questions[nextIdx]._id;
      if (questionStatus[nextQId] === 'unvisited') {
        setQuestionStatus((prev) => ({ ...prev, [nextQId]: 'visited' }));
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentIndex(index);
    const targetQId = questions[index]._id;
    if (questionStatus[targetQId] === 'unvisited') {
      setQuestionStatus((prev) => ({ ...prev, [targetQId]: 'visited' }));
    }
  };

  const handleSubmit = async (isAuto = false, submissionNote = '') => {
    setSubmitting(true);
    try {
      const totalSeconds = (test.durationMinutes || 60) * 60;
      const timeTaken = Math.max(1, totalSeconds - secondsLeft);

      // Exit fullscreen safely
      if (document.fullscreenElement && document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch {}
      }

      const { data } = await api.post('/tests/submit', {
        testId: test._id,
        answers,
        timeTakenSeconds: timeTaken,
        tabSwitchesCount: tabSwitches,
        submissionNote,
      });

      if (data.success && data.submissionId) {
        navigate(`/test-results/${data.submissionId}`);
      }
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  // Format Time
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <LoadingSpinner text="Configuring timed test session & anti-cheat engine..." fullPage />;
  }

  if (!test || questions.length === 0) {
    return (
      <div className="p-8 text-center bg-[#111726] border border-slate-800 rounded-3xl space-y-4">
        <h2 className="text-xl font-bold text-white">Assessment is currently empty or unavailable</h2>
      </div>
    );
  }

  // Fullscreen Blocker Overlay
  if (!isFullscreen) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-xl w-full p-8 rounded-3xl bg-[#111726] border border-indigo-500/40 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto">
            <Maximize className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Fullscreen Mode Required</h1>
            <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
              To guarantee strict exam integrity for <strong className="text-indigo-400">{test.title}</strong>, this assessment can only be taken in Fullscreen Mode.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 text-left text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-amber-400 font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Anti-Cheating Proctoring Rules:</span>
            </div>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li>Exiting fullscreen will temporarily pause and lock your assessment.</li>
              <li>Switching tabs, windows, or opening external apps is monitored.</li>
              <li><strong className="text-rose-400">3 Tab Switches</strong> will trigger an immediate automatic submission of your exam.</li>
            </ul>
          </div>

          <button
            onClick={requestFullscreen}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Maximize className="w-4 h-4" /> Enter Fullscreen & Begin Assessment
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(questionStatus).filter((s) => s === 'marked').length;
  const unvisitedCount = Object.values(questionStatus).filter((s) => s === 'unvisited').length;

  return (
    <div className="space-y-4">
      {/* Top Test Header Bar with Proctoring Indicators */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#111726] border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              {test.company} Assessment
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Fullscreen Locked
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                tabSwitches === 0
                  ? 'bg-slate-800 text-slate-300 border-slate-700'
                  : tabSwitches === 1
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
              }`}
            >
              <AlertTriangle className="w-3 h-3" /> Tab Switches: {tabSwitches} / 3
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-white mt-0.5">{test.title}</h1>
        </div>

        {/* Live Timer & Submit */}
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold text-sm ${
              secondsLeft < 300
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : 'bg-[#0d121f] text-indigo-300 border-slate-700'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Time Left: {formatTimer(secondsLeft)}</span>
          </div>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
          >
            <Send className="w-3.5 h-3.5" /> Submit Assessment
          </button>
        </div>
      </div>

      {/* Main Assessment Layout: Question Card (Left) & Palette (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Pane: Question Card */}
        <div className="lg:col-span-8 bg-[#111726] border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl flex flex-col justify-between min-h-[520px]">
          <div className="space-y-4">
            {/* Question Meta */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-indigo-400">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#0d121f] text-slate-400 border border-slate-800">
                Section: {currentQ.sectionName}
              </span>
            </div>

            {/* Question Text */}
            <div className="text-sm font-medium text-white leading-relaxed">
              {currentQ.questionText}
            </div>

            {currentQ.codeSnippet && (
              <pre className="p-3.5 rounded-xl bg-[#0a0d14] border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}

            {/* Options */}
            <div className="space-y-3 pt-2">
              {(currentQ.options || []).map((opt) => {
                const isSelected = answers[currentQ._id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ._id, opt.id)}
                    className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-semibold shadow-inner'
                        : 'bg-[#0d121f] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-[#182238] flex items-center justify-center font-bold text-xs shrink-0 text-slate-200">
                      {opt.id}
                    </span>
                    <span className="flex-1 mt-0.5">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleClearResponse(currentQ._id)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                Clear Response
              </button>
              <button
                onClick={() => handleMarkForReview(currentQ._id)}
                className="px-3 py-2 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5"
              >
                <Flag className="w-3.5 h-3.5" /> Mark for Review & Next
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#0d121f] text-slate-300 border border-slate-800 hover:text-white transition-colors disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition-colors disabled:opacity-40"
              >
                Save & Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Pane: Question Palette (Scrollable for 50 questions) */}
        <div className="lg:col-span-4 bg-[#111726] border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-white">Question Palette ({questions.length} Questions)</h3>
            <p className="text-[11px] text-slate-400">Click any question number to jump directly</p>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-3.5 h-3.5 rounded bg-emerald-500/20 border border-emerald-500/40" />
              <span>Answered ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <span className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-500/40" />
              <span>Marked ({markedCount})</span>
            </div>
            <div className="flex items-center gap-2 text-rose-400">
              <span className="w-3.5 h-3.5 rounded bg-rose-500/20 border border-rose-500/40" />
              <span>Visited (No Ans)</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700" />
              <span>Not Visited</span>
            </div>
          </div>

          {/* Question Grid (Scrollable container for 50 questions) */}
          <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-800 max-h-[380px] overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const status = questionStatus[q._id];
              const isAnswered = !!answers[q._id];
              const isCurrent = idx === currentIndex;

              let btnStyle = 'bg-slate-800 text-slate-400 border-slate-700';

              if (status === 'marked') {
                btnStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
              } else if (isAnswered) {
                btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
              } else if (status === 'visited') {
                btnStyle = 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-medium';
              }

              if (isCurrent) {
                btnStyle += ' ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#111726]';
              }

              return (
                <button
                  key={q._id}
                  onClick={() => handleJumpToQuestion(idx)}
                  className={`h-9 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all ${btnStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Submit Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Proctoring Warning Modal (Tab Switch 1 or 2) */}
      <Modal
        isOpen={showTabWarningModal}
        onClose={() => setShowTabWarningModal(false)}
        title="⚠️ Exam Proctoring Alert"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-3">
            <AlertOctagon className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-rose-300 text-sm">Integrity Violation Detected</h4>
              <p className="text-xs text-rose-200 leading-relaxed">{warningMessage}</p>
            </div>
          </div>

          <div className="p-3 bg-[#0d121f] rounded-xl border border-slate-800 text-xs text-slate-300">
            Current Tab Switch Count: <strong className="text-rose-400 text-sm">{tabSwitches} / 3</strong>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowTabWarningModal(false)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
            >
              I Understand & Acknowledge
            </button>
          </div>
        </div>
      </Modal>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Submit Assessment Confirmation"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to finish and submit the assessment? Your test responses will be locked and analyzed by the Placify AI engine.
          </p>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-[#0d121f] border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">Total Questions:</span>
              <strong className="text-white text-sm">{questions.length}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Questions Answered:</span>
              <strong className="text-emerald-400 text-sm">{answeredCount}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Marked for Review:</span>
              <strong className="text-amber-400 text-sm">{markedCount}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Unanswered:</span>
              <strong className="text-rose-400 text-sm">{questions.length - answeredCount}</strong>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowSubmitModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors"
            >
              Resume Test
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
            >
              {submitting ? <LoadingSpinner text="Evaluating..." /> : 'Confirm & Generate AI Analysis'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
