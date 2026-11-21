import React, { useState, useEffect } from 'react';
import {
  BookOpenCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Bookmark,
  Sparkles,
  HelpCircle,
  RotateCcw,
  Eye,
  Award,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function PYQRepositoryPage() {
  const { user, refreshUser } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Practice state
  const [userAnswers, setUserAnswers] = useState({}); // { [qid]: { selected, isCorrect, explanation, verified } }
  const [revealedSolutions, setRevealedSolutions] = useState({});
  const [bookmarks, setBookmarks] = useState(user?.bookmarkedQuestions || []);

  // AI Modal
  const [aiExplanationModal, setAiExplanationModal] = useState({
    isOpen: false,
    loading: false,
    questionText: '',
    explanation: '',
  });

  const companiesList = ['All', 'TCS', 'Infosys', 'Amazon', 'Microsoft', 'Accenture', 'Cognizant', 'Capgemini', 'Wipro'];
  const typesList = ['All', 'Aptitude', 'Reasoning', 'Verbal', 'Technical'];
  const difficultiesList = ['All', 'Easy', 'Medium', 'Hard'];

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCompany !== 'All') params.company = selectedCompany;
      if (selectedTopic !== 'All') params.topic = selectedTopic;
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
      if (selectedType !== 'All') params.questionType = selectedType;
      if (searchQuery.trim()) params.search = searchQuery;

      const { data } = await api.get('/questions', { params });
      if (data.success) {
        setQuestions(data.questions || []);
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedCompany, selectedDifficulty, selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const handleSelectOption = async (questionId, optionId) => {
    if (userAnswers[questionId]?.verified) return; // already answered

    try {
      const { data } = await api.post(`/questions/${questionId}/verify`, {
        selectedOption: optionId,
      });

      setUserAnswers((prev) => ({
        ...prev,
        [questionId]: {
          selected: optionId,
          isCorrect: data.isCorrect,
          correctOption: data.correctOption,
          explanation: data.explanation,
          verified: true,
        },
      }));

      if (data.totalPoints) {
        refreshUser();
      }
    } catch (err) {
      console.error('Error verifying answer:', err);
    }
  };

  const handleToggleBookmark = async (questionId) => {
    try {
      const { data } = await api.post(`/questions/${questionId}/bookmark`);
      if (data.success) {
        setBookmarks(data.bookmarkedQuestions);
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleRequestAIExplanation = async (q) => {
    setAiExplanationModal({
      isOpen: true,
      loading: true,
      questionText: q.questionText,
      explanation: '',
    });

    try {
      const chosen = userAnswers[q._id]?.selected || 'None';
      const { data } = await api.post(`/questions/${q._id}/ai-explain`, {
        selectedOption: chosen,
      });
      if (data.success) {
        setAiExplanationModal((prev) => ({
          ...prev,
          loading: false,
          explanation: data.explanation,
        }));
      }
    } catch (err) {
      setAiExplanationModal((prev) => ({
        ...prev,
        loading: false,
        explanation: 'Failed to generate AI explanation. Please try again.',
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
          <BookOpenCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Company Placement PYQ Repository</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Previous Year Questions & Practice Bank
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Solve verified questions asked in TCS NQT, Infosys Certification, Amazon OA, Accenture Cognitive, and Microsoft assessments. Test your answers instantly and unlock Gemini AI explanations!
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, formula (e.g. Time and Work, BST, Syllogism)..."
              className="w-full bg-[#182238] border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" /> Filter Questions
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3 pt-2 text-xs border-t border-slate-800/80">
          {/* Company */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Company:</span>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="bg-[#0d121f] border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              {companiesList.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#0d121f] border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              {typesList.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-[#0d121f] border border-slate-700 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              {difficultiesList.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <LoadingSpinner text="Retrieving placement questions..." />
      ) : questions.length === 0 ? (
        <div className="p-12 text-center bg-[#111726] border border-slate-800 rounded-3xl space-y-3">
          <BookOpenCheck className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No questions found matching your filter</h3>
          <p className="text-xs text-slate-400">Try resetting filters to explore questions from all companies.</p>
          <button
            onClick={() => {
              setSelectedCompany('All');
              setSelectedType('All');
              setSelectedDifficulty('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-indigo-600 rounded-xl text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Showing <span className="font-semibold text-white">{questions.length}</span> verified placement questions
          </p>

          {questions.map((q, idx) => {
            const answerState = userAnswers[q._id];
            const isBookmarked = bookmarks.includes(q._id);
            const isSolutionRevealed = revealedSolutions[q._id];

            return (
              <div
                key={q._id}
                className="p-5 sm:p-6 rounded-2xl bg-[#111726] border border-slate-800/90 hover:border-slate-700/80 transition-all space-y-4 shadow-lg"
              >
                {/* Meta row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {q.company}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-[#0d121f] text-slate-300 border border-slate-800">
                      {q.topic}
                    </span>
                    {q.subTopic && (
                      <span className="hidden sm:inline-block text-[11px] text-slate-400">
                        • {q.subTopic}
                      </span>
                    )}
                    <Badge variant={q.difficulty === 'Hard' ? 'rose' : q.difficulty === 'Medium' ? 'amber' : 'emerald'}>
                      {q.difficulty}
                    </Badge>
                  </div>

                  <button
                    onClick={() => handleToggleBookmark(q._id)}
                    className={`p-2 rounded-xl transition-colors ${
                      isBookmarked
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={isBookmarked ? 'Bookmarked' : 'Bookmark this question'}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>

                {/* Question Text */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white leading-relaxed whitespace-pre-wrap">
                    <span className="font-bold text-indigo-400 mr-2">Q{idx + 1}.</span>
                    {q.questionText}
                  </p>

                  {q.codeSnippet && (
                    <pre className="p-3 rounded-xl bg-[#0a0d14] border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto">
                      <code>{q.codeSnippet}</code>
                    </pre>
                  )}
                </div>

                {/* Multiple Choice Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {(q.options || []).map((opt) => {
                    const isSelected = answerState?.selected === opt.id;
                    const isCorrectOpt = answerState?.correctOption === opt.id || (isSolutionRevealed && q.correctOption === opt.id);
                    const isWrongSelection = isSelected && !answerState?.isCorrect;

                    let optStyle = 'bg-[#0d121f] border-slate-800 text-slate-300 hover:border-slate-700';

                    if (answerState?.verified || isSolutionRevealed) {
                      if (isCorrectOpt) {
                        optStyle = 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold';
                      } else if (isWrongSelection) {
                        optStyle = 'bg-rose-500/15 border-rose-500/40 text-rose-300 line-through';
                      }
                    } else if (isSelected) {
                      optStyle = 'bg-indigo-600/20 border-indigo-500 text-indigo-200';
                    }

                    return (
                      <button
                        key={opt.id}
                        disabled={answerState?.verified}
                        onClick={() => handleSelectOption(q._id, opt.id)}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-left text-xs transition-all ${optStyle}`}
                      >
                        <span className="w-5 h-5 rounded-md bg-[#182238] flex items-center justify-center font-bold text-[11px] shrink-0 text-slate-300">
                          {opt.id}
                        </span>
                        <span className="flex-1 mt-0.5">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Answer Feedback / Verification Panel */}
                {answerState?.verified && (
                  <div
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      answerState.isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold">
                        {answerState.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Correct! +5 points awarded</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-rose-400" />
                            <span>Incorrect. Correct Option is ({answerState.correctOption})</span>
                          </>
                        )}
                      </div>

                      <button
                        onClick={() => handleRequestAIExplanation(q)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shadow-sm transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Explain with AI
                      </button>
                    </div>

                    <p className="text-slate-300 leading-relaxed font-sans pt-1 border-t border-slate-800">
                      <span className="font-semibold text-white">Explanation: </span>
                      {answerState.explanation}
                    </p>
                  </div>
                )}

                {/* Footer Controls: Reveal Solution / Ask AI */}
                {!answerState?.verified && (
                  <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-400">Select an option to test your answer</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setRevealedSolutions((prev) => ({
                            ...prev,
                            [q._id]: !prev[q._id],
                          }))
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isSolutionRevealed ? 'Hide Solution' : 'View Answer'}</span>
                      </button>

                      <button
                        onClick={() => handleRequestAIExplanation(q)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-medium transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> AI Explanation
                      </button>
                    </div>
                  </div>
                )}

                {/* If solution revealed without answering */}
                {isSolutionRevealed && !answerState?.verified && (
                  <div className="p-3.5 rounded-xl bg-[#0d121f] border border-slate-800 text-xs text-slate-300 space-y-1">
                    <p className="font-bold text-emerald-400">Correct Option: ({q.correctOption})</p>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AI Explanation Modal */}
      <Modal
        isOpen={aiExplanationModal.isOpen}
        onClose={() => setAiExplanationModal((prev) => ({ ...prev, isOpen: false }))}
        title="Gemini AI Step-by-Step Breakdown"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-[#0d121f] border border-slate-800 text-xs font-medium text-white">
            "{aiExplanationModal.questionText}"
          </div>

          {aiExplanationModal.loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
              <p>Gemini AI analyzing concept, distractors, and shortcuts...</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#0d121f] border border-indigo-500/20 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap">
              {aiExplanationModal.explanation}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

