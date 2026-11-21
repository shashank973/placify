import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  BookOpenCheck,
  Code2,
  FileCheck2,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import api from '../api';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('questions'); // 'questions', 'coding', 'tests', 'users'
  const [loading, setLoading] = useState(true);

  // Collections
  const [questions, setQuestions] = useState([]);
  const [codingProblems, setCodingProblems] = useState([]);
  const [mockTests, setMockTests] = useState([]);
  const [users, setUsers] = useState([]);

  // Modals
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showAddCodingModal, setShowAddCodingModal] = useState(false);
  const [showAddTestModal, setShowAddTestModal] = useState(false);

  // Form states
  const [questionForm, setQuestionForm] = useState({
    questionText: '',
    company: 'TCS',
    topic: 'Quantitative Aptitude',
    subTopic: '',
    difficulty: 'Medium',
    questionType: 'Aptitude',
    options: [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' },
    ],
    correctOption: 'A',
    explanation: '',
  });

  const [codingForm, setCodingForm] = useState({
    title: '',
    company: 'Amazon',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    description: '',
    starterCode: {
      javascript: 'function solve(input) {\n  // Write solution\n}',
      python: 'def solve(input):\n    # Write solution\n    pass',
      cpp: 'class Solution {\npublic:\n    void solve() {}\n};',
      java: 'class Solution {\n    public void solve() {}\n}',
    },
    examples: [{ input: '[1, 2, 3]', output: '6', explanation: 'Sum of elements' }],
    hiddenTestCases: [{ input: '[4, 5]', output: '9' }],
  });

  const [testForm, setTestForm] = useState({
    title: '',
    description: '',
    company: 'TCS',
    durationMinutes: 45,
    totalMarks: 50,
    passingMarks: 30,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, qRes, cRes, tRes, uRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/questions'),
        api.get('/coding'),
        api.get('/tests'),
        api.get('/admin/users'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (qRes.data.success) setQuestions(qRes.data.questions || []);
      if (cRes.data.success) setCodingProblems(cRes.data.problems || []);
      if (tRes.data.success) setMockTests(tRes.data.tests || []);
      if (uRes.data.success) setUsers(uRes.data.users || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* Handlers for Add Operations */
  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/questions', questionForm);
      if (data.success) {
        setShowAddQuestionModal(false);
        fetchData();
      }
    } catch (err) {
      alert('Failed to add question: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question permanently?')) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete question', err);
    }
  };

  const handleCreateCodingProblem = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/coding', codingForm);
      if (data.success) {
        setShowAddCodingModal(false);
        fetchData();
      }
    } catch (err) {
      alert('Failed to add coding problem: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteCodingProblem = async (id) => {
    if (!window.confirm('Delete this coding problem?')) return;
    try {
      await api.delete(`/admin/coding/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete problem', err);
    }
  };

  const handleCreateMockTest = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/tests', {
        ...testForm,
        sections: [
          {
            name: 'Core Assessment',
            sectionType: 'mcq',
            durationMinutes: testForm.durationMinutes,
            marksPerQuestion: 2,
            negativeMarks: 0.5,
            questions: questions.slice(0, 5).map((q) => q._id),
          },
        ],
      });
      if (data.success) {
        setShowAddTestModal(false);
        fetchData();
      }
    } catch (err) {
      alert('Failed to add mock test: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteMockTest = async (id) => {
    if (!window.confirm('Delete this mock test?')) return;
    try {
      await api.delete(`/admin/tests/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete test', err);
    }
  };

  const handleToggleUserRole = async (u) => {
    const newRole = u.role === 'admin' ? 'student' : 'admin';
    try {
      await api.put(`/admin/users/${u._id}/role`, { role: newRole });
      fetchData();
    } catch (err) {
      console.error('Failed to update user role', err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Remove this user from the platform?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchData();
    } catch (err) {
      console.error('Failed to delete user', err);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Admin Management Control..." fullPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-900/30 via-slate-900 to-[#111726] border border-amber-500/30 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold border border-amber-500/20">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Platform Administrator Control Panel</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Admin Management & Content System
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Manage questions repository, coding challenges, company mock tests, student accounts, and overall platform analytics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalUsers || users.length}
          subtext="Registered aspirants"
          icon={Users}
          color="brand"
        />
        <StatCard
          title="PYQ Bank"
          value={stats?.totalQuestions || questions.length}
          subtext="Aptitude & Tech MCQs"
          icon={BookOpenCheck}
          color="emerald"
        />
        <StatCard
          title="Coding Challenges"
          value={stats?.totalCodingProblems || codingProblems.length}
          subtext="Monaco Editor problems"
          icon={Code2}
          color="cyan"
        />
        <StatCard
          title="Mock Assessments"
          value={stats?.totalMockTests || mockTests.length}
          subtext="Timed company tests"
          icon={FileCheck2}
          color="purple"
        />
      </div>

      {/* Module Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'questions', label: `Questions Bank (${questions.length})`, icon: BookOpenCheck },
          { id: 'coding', label: `Coding Problems (${codingProblems.length})`, icon: Code2 },
          { id: 'tests', label: `Mock Tests (${mockTests.length})`, icon: FileCheck2 },
          { id: 'users', label: `User Management (${users.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Questions Management */}
      {activeTab === 'questions' && (
        <div className="bg-[#111726] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Placement Questions Management</h2>
            <button
              onClick={() => setShowAddQuestionModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Question
            </button>
          </div>

          <div className="space-y-3">
            {questions.map((q) => (
              <div
                key={q._id}
                className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-400">{q.company}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-300">{q.topic}</span>
                    <Badge variant={q.difficulty === 'Hard' ? 'rose' : q.difficulty === 'Medium' ? 'amber' : 'emerald'}>
                      {q.difficulty}
                    </Badge>
                  </div>
                  <p className="text-slate-200 line-clamp-2">{q.questionText}</p>
                  <p className="text-[11px] text-emerald-400">Correct Option: ({q.correctOption})</p>
                </div>

                <button
                  onClick={() => handleDeleteQuestion(q._id)}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Coding Problems Management */}
      {activeTab === 'coding' && (
        <div className="bg-[#111726] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Coding Challenges Management</h2>
            <button
              onClick={() => setShowAddCodingModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Coding Challenge
            </button>
          </div>

          <div className="space-y-3">
            {codingProblems.map((p) => (
              <div
                key={p._id}
                className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{p.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                      {p.company}
                    </span>
                    <Badge variant={p.difficulty === 'Hard' ? 'rose' : p.difficulty === 'Medium' ? 'amber' : 'emerald'}>
                      {p.difficulty}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-[11px]">{p.category}</p>
                </div>

                <button
                  onClick={() => handleDeleteCodingProblem(p._id)}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Delete coding problem"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Mock Tests Management */}
      {activeTab === 'tests' && (
        <div className="bg-[#111726] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Mock Assessments Management</h2>
            <button
              onClick={() => setShowAddTestModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Create Assessment
            </button>
          </div>

          <div className="space-y-3">
            {mockTests.map((t) => (
              <div
                key={t._id}
                className="p-4 rounded-2xl bg-[#0d121f] border border-slate-800 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <h3 className="font-bold text-white text-sm">{t.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Company: <span className="text-indigo-400 font-semibold">{t.company}</span> • {t.durationMinutes} Mins • Total {t.totalMarks} Marks
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteMockTest(t._id)}
                  className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title="Delete assessment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-[#111726] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">Registered Users & Role Management</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0d121f] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">College</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">{u.name}</td>
                    <td className="py-3.5 px-4 text-slate-400">{u.email}</td>
                    <td className="py-3.5 px-4">{u.college}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                          u.role === 'admin'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleUserRole(u)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition-colors"
                      >
                        {u.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Add Question */}
      <Modal
        isOpen={showAddQuestionModal}
        onClose={() => setShowAddQuestionModal(false)}
        title="Add Placement PYQ Question"
      >
        <form onSubmit={handleCreateQuestion} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Question Statement</label>
            <textarea
              required
              rows={3}
              value={questionForm.questionText}
              onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
              className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Company</label>
              <select
                value={questionForm.company}
                onChange={(e) => setQuestionForm({ ...questionForm, company: e.target.value })}
                className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {['TCS', 'Infosys', 'Amazon', 'Microsoft', 'Accenture', 'Cognizant', 'Capgemini', 'Wipro'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Topic</label>
              <input
                type="text"
                required
                value={questionForm.topic}
                onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })}
                className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          {/* 4 Options */}
          <div className="grid grid-cols-2 gap-3">
            {questionForm.options.map((opt, i) => (
              <div key={opt.id}>
                <label className="block text-slate-400 font-medium mb-1">Option {opt.id}</label>
                <input
                  type="text"
                  required
                  value={opt.text}
                  onChange={(e) => {
                    const newOpts = [...questionForm.options];
                    newOpts[i].text = e.target.value;
                    setQuestionForm({ ...questionForm, options: newOpts });
                  }}
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Correct Option</label>
              <select
                value={questionForm.correctOption}
                onChange={(e) => setQuestionForm({ ...questionForm, correctOption: e.target.value })}
                className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {['A', 'B', 'C', 'D'].map((o) => (
                  <option key={o} value={o}>Option {o}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Difficulty</label>
              <select
                value={questionForm.difficulty}
                onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}
                className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Detailed Explanation</label>
            <textarea
              required
              rows={2}
              value={questionForm.explanation}
              onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
              className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all mt-2"
          >
            Create Question
          </button>
        </form>
      </Modal>

      {/* Modal: Add Coding Problem */}
      <Modal
        isOpen={showAddCodingModal}
        onClose={() => setShowAddCodingModal(false)}
        title="Add Monaco Coding Challenge"
      >
        <form onSubmit={handleCreateCodingProblem} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Problem Title</label>
            <input
              type="text"
              required
              value={codingForm.title}
              onChange={(e) => setCodingForm({ ...codingForm, title: e.target.value })}
              placeholder="e.g. Invert Binary Tree"
              className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Company</label>
              <select
                value={codingForm.company}
                onChange={(e) => setCodingForm({ ...codingForm, company: e.target.value })}
                className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {['Amazon', 'Microsoft', 'TCS', 'Infosys', 'Accenture', 'Cognizant'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Difficulty</label>
              <select
                value={codingForm.difficulty}
                onChange={(e) => setCodingForm({ ...codingForm, difficulty: e.target.value })}
                className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {['Easy', 'Medium', 'Hard'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Problem Description</label>
            <textarea
              required
              rows={4}
              value={codingForm.description}
              onChange={(e) => setCodingForm({ ...codingForm, description: e.target.value })}
              placeholder="Describe constraints and problem specification..."
              className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all mt-2"
          >
            Create Coding Challenge
          </button>
        </form>
      </Modal>

      {/* Modal: Add Mock Test */}
      <Modal
        isOpen={showAddTestModal}
        onClose={() => setShowAddTestModal(false)}
        title="Create New Mock Assessment"
      >
        <form onSubmit={handleCreateMockTest} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Assessment Title</label>
            <input
              type="text"
              required
              value={testForm.title}
              onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
              placeholder="e.g. TCS NQT Full Assessment 2"
              className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Company</label>
              <select
                value={testForm.company}
                onChange={(e) => setTestForm({ ...testForm, company: e.target.value })}
                className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {['TCS', 'Infosys', 'Amazon', 'Microsoft', 'Accenture', 'Cognizant'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Duration (Minutes)</label>
              <input
                type="number"
                required
                value={testForm.durationMinutes}
                onChange={(e) => setTestForm({ ...testForm, durationMinutes: Number(e.target.value) })}
                className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Description</label>
            <textarea
              rows={2}
              value={testForm.description}
              onChange={(e) => setTestForm({ ...testForm, description: e.target.value })}
              className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all mt-2"
          >
            Create Mock Assessment
          </button>
        </form>
      </Modal>
    </div>
  );
}

