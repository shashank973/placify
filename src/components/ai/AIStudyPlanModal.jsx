import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, Target, ArrowRight, CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import api from '../../api';

export default function AIStudyPlanModal({ isOpen, onClose, initialCompany = 'Amazon' }) {
  const [targetCompany, setTargetCompany] = useState(initialCompany);
  const [timelineWeeks, setTimelineWeeks] = useState(4);
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [currentLevel, setCurrentLevel] = useState('Intermediate');
  const [loading, setLoading] = useState(false);
  const [planResult, setPlanResult] = useState(null);
  const [activeWeek, setActiveWeek] = useState(1);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/ai/study-plan', {
        targetCompany,
        timelineWeeks: Number(timelineWeeks),
        hoursPerDay: Number(hoursPerDay),
        currentLevel,
      });
      if (data.success) {
        setPlanResult(data.plan);
        setActiveWeek(1);
      }
    } catch (err) {
      console.error('Failed to generate study plan:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setPlanResult(null);
      }}
      title="AI Personalized Placement Study Plan"
      maxWidth="max-w-3xl"
    >
      {!planResult ? (
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              Our Gemini AI engine analyzes company-specific hiring blueprints (TCS, Infosys, Amazon, Microsoft) and structures a high-yield study schedule optimized for your remaining preparation timeline.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Company</label>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Amazon">Amazon (SDE-1)</option>
                <option value="Microsoft">Microsoft (SWE)</option>
                <option value="TCS">TCS (NQT Ninja / Digital / Prime)</option>
                <option value="Infosys">Infosys (SP / DSE)</option>
                <option value="Accenture">Accenture (ASE / FSE)</option>
                <option value="Cognizant">Cognizant (GenC Next)</option>
                <option value="Capgemini">Capgemini (Exceller)</option>
                <option value="Wipro">Wipro (Elite NTH)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Timeline (Weeks to Exam)</label>
              <select
                value={timelineWeeks}
                onChange={(e) => setTimelineWeeks(e.target.value)}
                className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value={2}>2 Weeks (Crash Revision)</option>
                <option value={4}>4 Weeks (Standard Sprint)</option>
                <option value={6}>6 Weeks (Deep Dive)</option>
                <option value={8}>8 Weeks (Mastery Bootcamp)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Daily Study Commitment</label>
              <select
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
                className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value={2}>2 Hours / day</option>
                <option value={3}>3 Hours / day</option>
                <option value={4}>4 Hours / day</option>
                <option value={6}>6 Hours / day (Intensive)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Confidence Level</label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                className="w-full bg-[#182238] border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Beginner">Beginner (Need aptitude + basic syntax)</option>
                <option value="Intermediate">Intermediate (Know basics, need problem-solving)</option>
                <option value="Advanced">Advanced (Targeting top CTC & competitive rounds)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <LoadingSpinner text="Generating Personalized Plan with Gemini AI..." />
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Generate AI Study Plan
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Summary Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30">
            <h4 className="font-bold text-white text-sm mb-1">
              {targetCompany} Preparation Roadmap ({timelineWeeks} Weeks)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">{planResult.summary}</p>
          </div>

          {/* Week Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {(planResult.weeks || []).map((w) => (
              <button
                key={w.weekNumber}
                onClick={() => setActiveWeek(w.weekNumber)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  activeWeek === w.weekNumber
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Week {w.weekNumber}
              </button>
            ))}
          </div>

          {/* Active Week Content */}
          {planResult.weeks && planResult.weeks[activeWeek - 1] && (
            <div className="p-4 rounded-xl bg-[#0d121f] border border-slate-800 space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Week Focus</span>
                <h5 className="text-sm font-bold text-white">
                  {planResult.weeks[activeWeek - 1].focusTheme}
                </h5>
              </div>

              {/* Goals */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Key Milestones</span>
                <ul className="mt-1 space-y-1">
                  {(planResult.weeks[activeWeek - 1].goals || []).map((g, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Daily Schedule */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Daily Execution Plan</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(planResult.weeks[activeWeek - 1].dailySchedule || []).map((dayItem, dIdx) => (
                    <div key={dIdx} className="p-3 rounded-lg bg-[#111726] border border-slate-800/80">
                      <span className="text-xs font-bold text-indigo-400">{dayItem.day}</span>
                      <p className="text-xs text-white font-medium mt-0.5">{dayItem.topics?.join(', ')}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800">
                        <span>🎯 {dayItem.codingTarget || 'Practice PYQs'}</span>
                        <span>{dayItem.practiceQuestionsCount || 20} Qs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Strategy Tips */}
          {planResult.strategyTips && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
              <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px] block mb-1">
                Placement Mentor Strategy Tips
              </span>
              <ul className="list-disc list-inside text-amber-200/90 space-y-0.5">
                {planResult.strategyTips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => setPlanResult(null)}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Adjust Parameters & Generate Another Plan
          </button>
        </div>
      )}
    </Modal>
  );
}

