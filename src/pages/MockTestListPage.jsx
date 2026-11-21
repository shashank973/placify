import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Clock,
  Award,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Play,
  HelpCircle,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import api from '../api';

export default function MockTestListPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('All');

  const companies = ['All', 'TCS', 'Infosys', 'Amazon', 'Accenture'];

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCompany !== 'All') params.company = selectedCompany;
        const { data } = await api.get('/tests', { params });
        if (data.success) {
          setTests(data.tests || []);
        }
      } catch (err) {
        console.error('Error fetching mock tests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, [selectedCompany]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
          <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Timed Assessment Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Company-Specific Mock Assessments
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Simulate the real on-campus test environment. Practice with negative marking, countdown timers, question palettes, and automated AI diagnostic analysis upon completion.
        </p>

        {/* Company Filter Tabs */}
        <div className="flex items-center gap-2 pt-2 overflow-x-auto">
          {companies.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCompany(c)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedCompany === c
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {c} {c !== 'All' ? 'Assessments' : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <LoadingSpinner text="Retrieving assessment papers..." />
      ) : tests.length === 0 ? (
        <div className="p-12 text-center bg-[#111726] border border-slate-800 rounded-3xl space-y-3">
          <FileCheck2 className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No mock assessments found for this filter</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tests.map((t) => (
            <div
              key={t._id}
              className="p-6 rounded-3xl bg-[#111726] border border-slate-800 hover:border-indigo-500/50 flex flex-col justify-between group transition-all shadow-xl space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {t.company} Assessment
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    {t.durationMinutes} Minutes
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {t.description}
                  </p>
                </div>

                {/* Section details */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Test Sections:</span>
                  <div className="flex flex-wrap gap-2">
                    {(t.sections || []).map((sec, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-[#0d121f] text-slate-300 border border-slate-800">
                        {sec.name} ({sec.questions?.length || 3} Qs)
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Total Marks: <strong className="text-white">{t.totalMarks}</strong></span>
                  <span className="text-xs text-slate-400 ml-3">Passing: <strong className="text-emerald-400">{t.passingMarks}</strong></span>
                </div>

                <Link
                  to={`/mock-tests/${t._id}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
                >
                  <Play className="w-3.5 h-3.5" /> Start Test
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

