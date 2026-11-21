import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Terminal,
  Zap,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import api from '../api';

export default function CodingPracticeListPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  const companies = ['All', 'Amazon', 'Microsoft', 'TCS', 'Infosys', 'Accenture', 'Cognizant', 'Capgemini', 'Wipro'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const categories = ['All', 'Arrays & Hashing', 'Stacks', 'Dynamic Programming', 'Arrays', 'Strings', 'Data Structures'];

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCompany !== 'All') params.company = selectedCompany;
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const { data } = await api.get('/coding', { params });
      if (data.success) {
        setProblems(data.problems || []);
      }
    } catch (err) {
      console.error('Error fetching coding problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [selectedCompany, selectedDifficulty, selectedCategory]);

  const filtered = problems.filter((p) =>
    search ? p.title.toLowerCase().includes(search.toLowerCase()) || p.company.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/20">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>Monaco Coding Arena</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Placement Coding Practice
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Solve standard algorithmic problems asked in on-campus technical rounds. Code in Python, JavaScript, C++, or Java with automated test case evaluation and AI hints!
        </p>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problem title..."
              className="w-full bg-[#182238] border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
          >
            {companies.map((c) => (
              <option key={c} value={c}>Company: {c}</option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
          >
            {difficulties.map((d) => (
              <option key={d} value={d}>Difficulty: {d}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>Topic: {cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Problems List */}
      {loading ? (
        <LoadingSpinner text="Loading coding challenges..." />
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-[#111726] border border-slate-800 rounded-3xl space-y-3">
          <Code2 className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No coding problems found</h3>
          <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((prob) => (
            <div
              key={prob._id}
              className="p-5 rounded-2xl bg-[#111726] border border-slate-800 hover:border-indigo-500/50 flex flex-col justify-between group transition-all shadow-lg space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {prob.company}
                  </span>
                  <Badge variant={prob.difficulty === 'Hard' ? 'rose' : prob.difficulty === 'Medium' ? 'amber' : 'emerald'}>
                    {prob.difficulty}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {prob.title}
                  </h3>
                  <span className="text-[11px] text-slate-400 block mt-0.5">{prob.category}</span>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                    {prob.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  {prob.difficulty === 'Hard' ? '30 pts' : prob.difficulty === 'Medium' ? '20 pts' : '10 pts'}
                </span>

                <Link
                  to={`/coding/${prob.slug}`}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
                >
                  <span>Solve Code</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

