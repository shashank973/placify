import React, { useState, useEffect } from 'react';
import {
  UserCircle2,
  Mail,
  School,
  Calendar,
  Target,
  Award,
  Flame,
  CheckCircle2,
  Save,
  BookOpen,
  Code2,
  FileCheck2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';

export default function ProfilePage() {
  const { user, updateProfile, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    gradYear: 2026,
    targetCompany: 'Amazon',
    bio: '',
    skills: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [testHistory, setTestHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        college: user.college || '',
        gradYear: user.gradYear || 2026,
        targetCompany: user.targetCompany || 'Amazon',
        bio: user.bio || '',
        skills: Array.isArray(user.skills) ? user.skills.join(', ') : '',
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const { data } = await api.get('/tests/history/my-submissions');
        if (data.success) {
          setTestHistory(data.submissions || []);
        }
      } catch (err) {
        console.error('Error fetching test submissions:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage('');

    const skillsArray = formData.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await updateProfile({
      ...formData,
      skills: skillsArray,
    });

    setSaving(false);
    if (res.success) {
      setSaveMessage('Profile saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      refreshUser();
    }
  };

  const achievements = user?.achievements || [
    { id: '1', title: 'Placify Pioneer', description: 'Joined the AI Placement Prep Platform', icon: Sparkles },
    { id: '2', title: 'Speed Demon', description: 'Solved mock test in top 15% time', icon: Flame },
    { id: '3', title: 'Century Club', description: 'Practiced 100+ questions', icon: Award },
    { id: '4', title: 'Code Maestro', description: 'Accepted code submissions in Monaco Editor', icon: Code2 },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-[#111726] border border-indigo-500/30 shadow-xl flex flex-col sm:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-3xl shadow-xl shrink-0">
          {user?.name ? user.name[0].toUpperCase() : 'U'}
        </div>

        <div className="space-y-1 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
            <Badge variant="brand">{user?.role === 'admin' ? 'Administrator' : 'Student Aspirant'}</Badge>
          </div>
          <p className="text-xs text-slate-300">{user?.college} • Class of {user?.gradYear}</p>
          <p className="text-xs text-indigo-400 font-semibold mt-1">🎯 Aiming for: {user?.targetCompany}</p>
        </div>

        <div className="flex items-center gap-4 bg-[#0d121f] p-3.5 rounded-2xl border border-slate-800 shrink-0">
          <div className="text-center px-2">
            <span className="text-xs font-bold text-indigo-400 block">{user?.points || 0}</span>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Points</span>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="text-center px-2">
            <span className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-amber-400" /> {user?.streakDays || 1}d
            </span>
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Streak</span>
          </div>
        </div>
      </div>

      {/* Grid: Edit Profile (Left) & Achievements + History (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Edit Profile */}
        <div className="lg:col-span-7 bg-[#111726] border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Profile Details & Goals</h2>
            {saveMessage && (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {saveMessage}
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-[#0d121f] border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-400 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Target Company</label>
                <select
                  name="targetCompany"
                  value={formData.targetCompany}
                  onChange={handleChange}
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                >
                  <option value="Amazon">Amazon</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="TCS">TCS</option>
                  <option value="Infosys">Infosys</option>
                  <option value="Accenture">Accenture</option>
                  <option value="Cognizant">Cognizant</option>
                  <option value="Capgemini">Capgemini</option>
                  <option value="Wipro">Wipro</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Graduation Year</label>
                <select
                  name="gradYear"
                  value={formData.gradYear}
                  onChange={handleChange}
                  className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                  <option value={2028}>2028</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">College / University</label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Skills (Comma-separated)</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="Data Structures, Python, Java, SQL, Aptitude"
                className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-medium mb-1">Bio / Placement Objective</label>
              <textarea
                rows={3}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating Profile...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Achievements & Past Assessment Reports */}
        <div className="lg:col-span-5 space-y-6">
          {/* Achievements */}
          <div className="bg-[#111726] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Unlocked Achievements
            </h2>

            <div className="space-y-3">
              {achievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-3.5 rounded-2xl bg-[#0d121f] border border-slate-800/80 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Submission Reports */}
          <div className="bg-[#111726] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" /> Assessment History
            </h2>

            {loadingHistory ? (
              <LoadingSpinner text="Loading test history..." />
            ) : testHistory.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No mock assessments taken yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {testHistory.map((sub) => (
                  <div
                    key={sub._id}
                    className="p-3.5 rounded-2xl bg-[#0d121f] border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-white text-xs">{sub.testTitle}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Score: <span className="text-emerald-400 font-semibold">{sub.score}/{sub.totalMarks}</span> • {sub.accuracy}% Accuracy
                      </p>
                    </div>

                    <Link
                      to={`/test-results/${sub._id}`}
                      className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-colors"
                      title="View AI Report"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

