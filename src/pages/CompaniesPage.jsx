import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, ShieldCheck, BookOpen, FileCheck2, Award, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import api from '../api';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDifficulty, setFilterDifficulty] = useState('All');

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/companies');
        if (data.success) {
          setCompanies(data.companies);
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filteredCompanies = filterDifficulty === 'All'
    ? companies
    : companies.filter((c) => c.difficulty === filterDifficulty);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>8 Top Tech & IT Recruiters</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Company-Wise Placement Blueprints
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Master the exact recruitment syllabus, test duration, negative marking policies, and previous year patterns for India's leading campus hiring companies.
        </p>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 pt-2">
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setFilterDifficulty(diff)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterDifficulty === diff
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {diff} {diff !== 'All' ? 'Difficulty' : 'Companies'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading company blueprints..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredCompanies.map((c) => (
            <div
              key={c.slug}
              className="p-5 rounded-2xl bg-[#111726] border border-slate-800 hover:border-indigo-500/50 flex flex-col justify-between group transition-all shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-base shadow-md">
                    {c.name.slice(0, 3)}
                  </div>
                  <Badge variant={c.difficulty === 'Hard' ? 'rose' : c.difficulty === 'Medium' ? 'amber' : 'emerald'}>
                    {c.difficulty}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs text-indigo-400 font-semibold mt-0.5">{c.packageRange}</p>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> {c.questionCount || 20}+ PYQs
                  </span>
                  <span className="flex items-center gap-1">
                    <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> Mock Tests
                  </span>
                </div>
              </div>

              <Link
                to={`/companies/${c.slug}`}
                className="mt-5 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/20 text-xs font-semibold transition-all group-hover:bg-indigo-600 group-hover:text-white"
              >
                <span>View Full Roadmap</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

