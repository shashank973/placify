import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Flame,
  Search,
  Filter,
  School,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [collegeFilter, setCollegeFilter] = useState('All');

  const colleges = [
    'All',
    'Indian Institute of Technology, Delhi',
    'BITS Pilani',
    'NIT Trichy',
    'IIT Bombay',
    'VIT Vellore',
    'SRM University',
    'DTU Delhi',
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const params = {};
        if (collegeFilter !== 'All') params.college = collegeFilter;
        const { data } = await api.get('/leaderboard', { params });
        if (data.success) {
          setLeaderboard(data.leaderboard || []);
          setMyRank(data.myRank);
          setTotalStudents(data.totalStudents || 0);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [collegeFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold border border-amber-500/20">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Campus Placement Rankings</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Student Leaderboard & Standings
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
          Compare your placement preparation score, mock test performance, and streak consistency with peers across India's top engineering universities.
        </p>

        {/* College Filter */}
        <div className="flex items-center gap-2 pt-2 overflow-x-auto text-xs">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <School className="w-3.5 h-3.5" /> University:
          </span>
          <select
            value={collegeFilter}
            onChange={(e) => setCollegeFilter(e.target.value)}
            className="bg-[#182238] border border-slate-700 text-white rounded-xl px-3 py-1.5 focus:outline-none"
          >
            {colleges.map((col) => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Current User Standing Banner */}
      {myRank && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-[#111726] border border-indigo-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-extrabold text-xl">
              #{myRank.rank}
            </div>
            <div>
              <p className="text-xs text-indigo-300 font-semibold">Your Current Standing</p>
              <h3 className="text-sm sm:text-base font-bold text-white">
                You are in the top {myRank.percentile}% of aspirants!
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Points</span>
              <span className="text-base font-bold text-amber-400">{myRank.points} pts</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Daily Streak</span>
              <span className="text-base font-bold text-amber-500 flex items-center gap-1">
                <Flame className="w-4 h-4 fill-amber-400" /> {user?.streakDays || 1} Days
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      {loading ? (
        <LoadingSpinner text="Computing student ranks and percentiles..." />
      ) : (
        <div className="bg-[#111726] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0d121f] text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4 text-center w-16">Rank</th>
                  <th className="py-3.5 px-4">Student Aspirant</th>
                  <th className="py-3.5 px-4">College / University</th>
                  <th className="py-3.5 px-4">Target Company</th>
                  <th className="py-3.5 px-4 text-center">Streak</th>
                  <th className="py-3.5 px-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-sans">
                {leaderboard.map((student) => {
                  const isTop1 = student.rank === 1;
                  const isTop2 = student.rank === 2;
                  const isTop3 = student.rank === 3;
                  const isCurrentUser = user?._id && String(student._id) === String(user._id);

                  return (
                    <tr
                      key={student._id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isCurrentUser ? 'bg-indigo-600/10 font-medium' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-4 px-4 text-center">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40">
                            🥇
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-400/20 text-slate-300 font-bold border border-slate-400/40">
                            🥈
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-600 font-bold border border-amber-700/40">
                            🥉
                          </span>
                        ) : (
                          <span className="font-bold text-slate-400 text-xs">#{student.rank}</span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-300 font-bold flex items-center justify-center text-xs">
                            {student.name[0]}
                          </div>
                          <div>
                            <span className="text-white font-semibold block">
                              {student.name} {isCurrentUser && <span className="text-[10px] text-indigo-400 font-bold">(You)</span>}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {student.achievementsCount || 1} Badges Unlocked
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* College */}
                      <td className="py-4 px-4 text-slate-400 text-xs">
                        {student.college}
                      </td>

                      {/* Target Company */}
                      <td className="py-4 px-4">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#0d121f] text-indigo-400 border border-slate-800">
                          {student.targetCompany || 'Amazon'}
                        </span>
                      </td>

                      {/* Streak */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                          <Flame className="w-3.5 h-3.5 fill-amber-400" />
                          {student.streakDays}d
                        </span>
                      </td>

                      {/* Points */}
                      <td className="py-4 px-4 text-right">
                        <span className="text-sm font-bold text-white tracking-tight">
                          {student.points} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

