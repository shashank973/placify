import React from 'react';
import Modal from '../common/Modal';
import { Lightbulb, Sparkles } from 'lucide-react';

export default function AIHintModal({ isOpen, onClose, hintText, loading, problemTitle }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`AI Code Review & Hint: ${problemTitle || ''}`}>
      <div className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            Hints guide your algorithmic thinking without giving away the complete solution, preserving your interview problem-solving muscles!
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-xs">
            <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
            <p>Analyzing your code syntax, invariants & time complexity...</p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#0d121f] border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans">
            {hintText || 'No hint generated yet.'}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
          >
            Got it, back to coding
          </button>
        </div>
      </div>
    </Modal>
  );
}

