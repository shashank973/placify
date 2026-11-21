import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Award,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Clock,
  Layers,
  History,
  Briefcase,
  Play,
  RotateCcw,
} from 'lucide-react';
import api from '../api';

const COMPANIES = [
  'Amazon',
  'Microsoft',
  'TCS',
  'Infosys',
  'Wipro',
  'Accenture',
  'Cognizant',
  'Capgemini',
];

const ROLES = [
  'SDE-1 (Software Development Engineer)',
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'Associate Software Engineer',
  'Data Analyst / ML Engineer',
];

const ROUNDS = [
  'Introduction & Resume Deep Dive',
  'Core Computer Science & Fundamentals',
  'Algorithmic Problem Solving & System Design',
  'Behavioral & Leadership Principles',
];

const HR_ROUNDS = [
  'HR Introduction & Motivation',
  'Behavioral & Situational Questions',
  'Communication & Culture Fit',
  'HR Closing',
];

export default function AIMockInterviewPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Setup state
  const [targetCompany, setTargetCompany] = useState(
    location.state?.targetCompany || 'Amazon'
  );
  const [targetRole, setTargetRole] = useState(
    location.state?.targetRole || 'SDE-1 (Software Development Engineer)'
  );
  const [interviewType, setInterviewType] = useState(
    location.state?.interviewType || 'technical'
  );
  const [resumeSnippet, setResumeSnippet] = useState(
    location.state?.resumeSnippet || ''
  );

  // Active Session state
  const [session, setSession] = useState(null);
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Audio / Speech refs
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const recognitionShouldContinueRef = useRef(false);
  const finalizedTranscriptRef = useRef('');
  const processedFinalResultsRef = useRef(0);
  const userInputRef = useRef('');
  const restartTimeoutRef = useRef(null);
  const stopTimeoutRef = useRef(null);
  const recognitionEndResolverRef = useRef(null);

  const updateUserInput = (value) => {
    userInputRef.current = value;
    setUserInput(value);
  };

  const finishStoppingRecognition = () => {
    if (stopTimeoutRef.current) {
      clearTimeout(stopTimeoutRef.current);
      stopTimeoutRef.current = null;
    }
    const resolve = recognitionEndResolverRef.current;
    recognitionEndResolverRef.current = null;
    resolve?.();
  };

  // Load history on mount
  useEffect(() => {
    fetchPastInterviews();
  }, []);

  // Timer effect
  useEffect(() => {
    if (session && session.status === 'in-progress') {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [session]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript.trim();
          if (result.isFinal && i >= processedFinalResultsRef.current) {
            finalizedTranscriptRef.current = [
              finalizedTranscriptRef.current,
              transcript,
            ].filter(Boolean).join(' ');
            processedFinalResultsRef.current = i + 1;
          }
        }
        for (let i = 0; i < event.results.length; i++) {
          if (!event.results[i].isFinal) {
            interimTranscript += `${event.results[i][0].transcript} `;
          }
        }
        updateUserInput(
          [finalizedTranscriptRef.current, interimTranscript.trim()]
            .filter(Boolean)
            .join(' ')
        );
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          recognitionShouldContinueRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        if (recognitionShouldContinueRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (!recognitionShouldContinueRef.current) return;
            processedFinalResultsRef.current = 0;
            try {
              recognition.start();
            } catch (error) {
              console.warn('Unable to restart speech recognition:', error);
              recognitionShouldContinueRef.current = false;
              setIsListening(false);
              finishStoppingRecognition();
            }
          }, 250);
        } else {
          setIsListening(false);
          finishStoppingRecognition();
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      recognitionShouldContinueRef.current = false;
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
      recognitionEndResolverRef.current?.();
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  const fetchPastInterviews = async () => {
    try {
      const res = await api.get('/interview/history');
      if (res.data?.success && res.data.data) {
        setHistory(res.data.data);
      }
    } catch (err) {
      // Non-blocking
    }
  };

  const speakText = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleStartInterview = async () => {
    setStarting(true);
    try {
      const res = await api.post('/interview/start', {
        targetCompany,
        targetRole,
        interviewType,
        resumeSnippet: resumeSnippet || 'Computer Science student with full stack and algorithmic background.',
      });

      if (res.data?.success && res.data.data) {
        setSession(res.data.data);
        setTimerSeconds(0);
        // Speak initial question
        const firstMsg = res.data.data.messages?.[0]?.content;
        if (firstMsg) {
          setTimeout(() => speakText(firstMsg), 500);
        }
        fetchPastInterviews();
      }
    } catch (err) {
      alert('Error starting interview session: ' + (err.response?.data?.message || err.message));
    } finally {
      setStarting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (sending || !session) return;

    if (isListening && recognitionRef.current) {
      await stopListening();
    }

    const textToSend = userInputRef.current.trim();
    if (!textToSend) return;
    updateUserInput('');
    finalizedTranscriptRef.current = '';
    setSending(true);

    try {
      const res = await api.post(`/interview/${session._id}/message`, {
        content: textToSend,
      });

      if (res.data?.success && res.data.data) {
        setSession(res.data.data);
        // Speak latest interviewer message
        const lastMsg = res.data.data.messages?.[res.data.data.messages.length - 1];
        if (lastMsg && lastMsg.sender === 'interviewer') {
          speakText(lastMsg.content);
        }
      }
    } catch (err) {
      alert('Failed to send message: ' + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  const stopListening = () => {
    recognitionShouldContinueRef.current = false;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    const recognition = recognitionRef.current;
    if (!recognition || !isListening) return Promise.resolve();

    setIsListening(false);
    return new Promise((resolve) => {
      recognitionEndResolverRef.current = resolve;
      stopTimeoutRef.current = setTimeout(finishStoppingRecognition, 1000);
      try {
        recognition.stop();
      } catch (error) {
        console.warn('Unable to stop speech recognition:', error);
        finishStoppingRecognition();
      }
    });
  };

  const handleToggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported by your browser. Please type your response or use Chrome.');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      updateUserInput('');
      finalizedTranscriptRef.current = '';
      processedFinalResultsRef.current = 0;
      recognitionShouldContinueRef.current = true;
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        recognitionShouldContinueRef.current = false;
        console.warn('Unable to start speech recognition:', error);
        alert('Could not start speech recognition. Please check microphone access and try again.');
      }
    }
  };

  const handleFinishInterview = async () => {
    if (!session || finalizing) return;
    if (window.confirm('Are you ready to conclude this interview and generate your hiring evaluation report?')) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setFinalizing(true);
      try {
        const res = await api.post(`/interview/${session._id}/finish`);
        if (res.data?.success && res.data.data) {
          setSession(res.data.data);
          fetchPastInterviews();
        }
      } catch (err) {
        alert('Error finalizing interview: ' + (err.response?.data?.message || err.message));
      } finally {
        setFinalizing(false);
      }
    }
  };

  const formatTimer = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // 1. Setup Screen (when no active session or starting a new one)
  if (!session) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
              <Bot className="w-3.5 h-3.5" />
              AI {interviewType === 'hr' ? 'HR' : 'Technical'} Interview Simulation
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Mock {interviewType === 'hr' ? 'HR' : 'Technical'} Interviewer
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Practice a focused {interviewType === 'hr' ? 'HR and behavioral' : 'technical and behavioral'} interview tailored to your target company, role, and background.
            </p>
          </div>

          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              <History className="w-4 h-4 text-indigo-400" />
              <span>Past Sessions ({history.length})</span>
            </button>
          )}
        </div>

        {/* History Modal / Drawer */}
        {showHistory && (
          <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" />
                Previous Mock Interview Sessions
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.map((h, i) => (
                <div
                  key={h._id || i}
                  onClick={() => {
                    setSession(h);
                    setShowHistory(false);
                  }}
                  className="p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-200">
                      {h.targetCompany} • {h.targetRole?.split(' ')[0]}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {h.interviewType === 'hr' ? 'HR' : 'Technical'} • {h.messages?.length || 0} turns • {new Date(h.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      h.status === 'completed'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {h.status === 'completed' ? h.finalReport?.verdict || 'Completed' : 'In Progress'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Setup Form */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-xl space-y-6">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-400" />
            Configure Your Mock Interview Simulation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Interview Section
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    value: 'technical',
                    title: 'Technical Interview',
                    description: 'Projects, computer science, problem solving, and engineering behavior.',
                  },
                  {
                    value: 'hr',
                    title: 'HR Interview',
                    description: 'Introduction, motivation, strengths, workplace scenarios, and culture fit.',
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setInterviewType(option.value)}
                    aria-pressed={interviewType === option.value}
                    className={`p-4 rounded-xl border text-left transition ${
                      interviewType === option.value
                        ? 'bg-indigo-500/10 border-indigo-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span className="block text-sm font-bold">{option.title}</span>
                    <span className="block mt-1 text-xs text-slate-400">{option.description}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Target Company
              </label>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                {COMPANIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Target Job Profile
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-400">
                {interviewType === 'hr' ? 'Resume Context / Experience (Optional)' : 'Resume Context / Key Technical Projects (Optional)'}
              </label>
              <button
                type="button"
                onClick={() =>
                  setResumeSnippet(
                    'Full Stack Developer proficient in React.js, Node.js, Express, and MongoDB. Built Placify placement prep platform with Monaco coding editor and Amazon clone microservices engine. Solved 350+ LeetCode problems.'
                  )
                }
                className="text-[11px] text-indigo-400 hover:text-indigo-300"
              >
                Load Default Profile
              </button>
            </div>
            <textarea
              rows={4}
              value={resumeSnippet}
              onChange={(e) => setResumeSnippet(e.target.value)}
              placeholder="Paste snippets of your projects, skills, or internship achievements so the interviewer asks realistic, targeted probing questions about your actual work..."
              className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 font-mono focus:outline-none focus:border-indigo-500 resize-none transition"
            />
          </div>

          {/* Interview Stages Preview */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              {interviewType === 'hr' ? 'HR Interview Sections' : 'Progressive Assessment Rounds'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              {(interviewType === 'hr'
                ? HR_ROUNDS
                : [
                    'Introduction & Resume Project Deep Dive',
                    'Core Computer Science (OS, DBMS, Networks)',
                    'Algorithmic Problem Solving & System Architecture',
                    'Behavioral & Company Leadership Values',
                  ]
              ).map((round, index) => (
                <div key={round} className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[9px]">{index + 1}</span>
                  <span>{round}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={starting}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 disabled:opacity-50 transition"
          >
            {starting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Initializing Interviewer AI...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Begin Live {interviewType === 'hr' ? 'HR' : 'Technical'} Interview</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 2. Completed Final Evaluation Screen
  if (session.status === 'completed' && session.finalReport) {
    const report = session.finalReport;
    const verdictColorMap = {
      'Strong Hire': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      'Hire': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      'Lean Hire': 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      'No Hire': 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    };

    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Interview Evaluation Report
            </span>
            <h1 className="text-2xl font-bold text-white">
              {session.targetCompany} • {session.targetRole}
            </h1>
          </div>
          <button
            onClick={() => setSession(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Take Another Interview
          </button>
        </div>

        {/* Verdict Banner */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400">Hiring Committee Recommendation</span>
            <div className="flex items-center gap-3 mt-1">
              <span
                className={`text-2xl font-extrabold px-4 py-1.5 rounded-xl border ${
                  verdictColorMap[report.verdict] || verdictColorMap['Hire']
                }`}
              >
                {report.verdict}
              </span>
              <span className="text-xs text-slate-400">
                Duration: {formatTimer(timerSeconds || 320)} • {session.messages.length} exchanges
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Overall Placement Readiness</span>
            <span className="text-3xl font-extrabold text-white">
              {Math.round(
                ((report.technicalRating +
                  report.communicationRating +
                  report.problemSolvingRating +
                  report.culturalFitRating) /
                  40) *
                  100
              )}
              %
            </span>
          </div>
        </div>

        {/* Rating Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(session.interviewType === 'hr'
            ? [
                { label: 'Motivation', score: report.technicalRating || 8, color: 'text-indigo-400' },
                { label: 'Communication', score: report.communicationRating || 8, color: 'text-purple-400' },
                { label: 'Behavioral Answers', score: report.problemSolvingRating || 8, color: 'text-teal-400' },
                { label: 'Culture Fit', score: report.culturalFitRating || 8, color: 'text-emerald-400' },
              ]
            : [
                { label: 'Technical Depth', score: report.technicalRating || 8, color: 'text-indigo-400' },
                { label: 'Communication', score: report.communicationRating || 8, color: 'text-purple-400' },
                { label: 'Problem Solving', score: report.problemSolvingRating || 8, color: 'text-teal-400' },
                { label: 'Cultural Fit', score: report.culturalFitRating || 8, color: 'text-emerald-400' },
              ]
          ).map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#0d1322] border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400 font-medium">{item.label}</span>
              <p className={`text-2xl font-black ${item.color}`}>{item.score} / 10</p>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${item.score * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800 space-y-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-indigo-400" />
            Executive Assessment Summary
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {report.executiveSummary}
          </p>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Key Strengths Noted
            </h3>
            <ul className="space-y-2">
              {report.strengths?.map((s, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {report.improvements?.map((imp, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Full Transcript Review Accordion */}
        <div className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Interview Transcript Review
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {session.messages.map((m, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-xl text-xs space-y-1 ${
                  m.sender === 'interviewer'
                    ? 'bg-slate-900/90 border border-slate-800 text-slate-200'
                    : 'bg-indigo-950/30 border border-indigo-800/40 text-indigo-100 ml-4'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1">
                  <span>{m.sender === 'interviewer' ? `AI Interviewer (${session.targetCompany})` : 'Candidate (You)'}</span>
                  {m.feedbackSnippet && (
                    <span className="text-emerald-400 font-normal italic">
                      Note: {m.feedbackSnippet}
                    </span>
                  )}
                </div>
                <p className="leading-relaxed whitespace-pre-line">{m.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. Live Interview Screen
  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8 flex flex-col h-[calc(100vh-100px)]">
      {/* Top Bar: Company, Role, Round, Timer & Controls */}
      <div className="p-4 rounded-2xl bg-[#0d1322] border border-slate-800 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{session.targetCompany}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                {session.interviewType === 'hr' ? 'HR Interview' : 'Technical Interview'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Round: <strong className="text-slate-300">{session.currentRound}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTimer(timerSeconds)}</span>
          </div>

          {/* Voice Output Toggle */}
          <button
            onClick={() => {
              if (voiceEnabled && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
              setVoiceEnabled(!voiceEnabled);
            }}
            className={`p-2 rounded-xl border text-xs transition ${
              voiceEnabled
                ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={voiceEnabled ? 'Mute AI voice output' : 'Enable AI voice output'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Conclude Interview Button */}
          <button
            onClick={handleFinishInterview}
            disabled={finalizing || session.messages.length < 2}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold border border-rose-500/30 transition disabled:opacity-40"
          >
            {finalizing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
            <span>Conclude & Evaluate</span>
          </button>
        </div>
      </div>

      {/* Main Dialogue Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 rounded-2xl bg-[#090d16] border border-slate-800 space-y-4">
        {session.messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.sender === 'interviewer' ? 'justify-start' : 'justify-end'
            }`}
          >
            {m.sender === 'interviewer' && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 flex-shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[82%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                m.sender === 'interviewer'
                  ? 'bg-[#111726] border border-slate-800 text-slate-200 rounded-tl-sm'
                  : 'bg-indigo-600 text-white rounded-tr-sm shadow-lg shadow-indigo-600/20'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1.5 opacity-70">
                <span className="font-semibold">
                  {m.sender === 'interviewer' ? session.targetCompany + ' Interviewer' : 'You'}
                </span>
                <span>
                  {new Date(m.timestamp || Date.now()).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="whitespace-pre-line font-sans">{m.content}</p>

              {m.feedbackSnippet && m.sender === 'interviewer' && (
                <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[11px] text-emerald-400/90 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{m.feedbackSnippet}</span>
                </div>
              )}
            </div>

            {m.sender === 'candidate' && (
              <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 flex-shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#111726] border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>Interviewer is evaluating your response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Candidate Input & Voice Controls */}
      <form onSubmit={handleSendMessage} className="space-y-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* Microphone Speech Recognition Button */}
          <button
            type="button"
            onClick={handleToggleListening}
            className={`p-3.5 rounded-2xl border transition flex items-center gap-2 ${
              isListening
                ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-indigo-500'
            }`}
            title={isListening ? 'Click to stop speaking' : 'Speak to answer'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            <span className="hidden sm:inline text-xs font-semibold">
              {isListening ? 'Listening...' : 'Speak'}
            </span>
          </button>

          {/* Text Input */}
          <textarea
            rows={3}
            value={userInput}
            onChange={(e) => updateUserInput(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your voice... Your transcript will appear here'
                : 'Type your answer or click Speak to use the microphone...'
            }
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition resize-y"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!userInput.trim() || sending}
            className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-lg shadow-indigo-600/30 disabled:opacity-40"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {isListening && (
          <div className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              Microphone active. Speak your answer, then click Send or click Mic to stop.
            </span>
            <button
              type="button"
              onClick={handleToggleListening}
              className="underline text-[11px]"
            >
              Done speaking
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

