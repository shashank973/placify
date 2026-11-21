import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquareText,
  Send,
  Sparkles,
  Bot,
  User,
  Code2,
  Trash2,
  Copy,
  Check,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { getUserDisplayIdentity } from '../utils/userIdentity';

export default function AIDoubtSolverPage() {
  const { user } = useAuth();
  const displayIdentity = getUserDisplayIdentity(user);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);

  const samplePrompts = [
    'How do I solve Time & Work problems quickly using LCM method?',
    'Explain the two-pointer technique for Two Sum in O(N)',
    'What are the 4 core OOPs principles with real-life examples?',
    'Explain ACID properties in DBMS for technical interviews',
    'How do I answer Amazon Leadership Principles using STAR method?',
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/ai/doubt-history');
        if (data.success && data.messages?.length > 0) {
          setMessages(data.messages);
        } else {
          // Default greeting
          setMessages([
            {
              sender: 'ai',
              text: `Hello ${displayIdentity.name || 'there'}! 👋 I am **Placify AI**, your dedicated 24/7 Campus Placement Mentor.\n\nI can help you with:\n- **Aptitude & Reasoning shortcuts** for TCS NQT, Infosys, and Accenture.\n- **Data Structures & Algorithms** optimization for Amazon and Microsoft.\n- **Core CS subjects** (OS, DBMS, OOPs, Computer Networks).\n- **HR & Behavioral interview strategies**.\n\nAsk me any question or pick a prompt below to get started!`,
            },
          ]);
        }
      } catch (err) {
        setMessages([
          {
            sender: 'ai',
            text: `Hello! I am **Placify AI**, your dedicated Campus Placement Mentor. Ask me any aptitude question, code debugging query, or technical interview concept!`,
          },
        ]);
      }
    };

    fetchHistory();
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend = inputMessage) => {
    if (!textToSend.trim() && !codeSnippet.trim()) return;

    const userMsg = {
      sender: 'user',
      text: textToSend,
      code: codeSnippet || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    const snippetToSend = codeSnippet;
    setCodeSnippet('');
    setShowCodeInput(false);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/doubt-solver', {
        message: textToSend,
        topic: 'Campus Placement Prep',
        codeSnippet: snippetToSend,
      });

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { sender: 'ai', text: data.reply },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'I encountered an issue processing your question. Please try again or rephrase your doubt.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: `Chat cleared! How can I assist your placement preparation today?`,
      },
    ]);
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto h-[calc(100vh-130px)] flex flex-col justify-between">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-[#111726] border border-slate-800 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">Placify AI Doubt Solver & Mentor</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Gemini
              </span>
            </div>
            <p className="text-xs text-slate-400">Step-by-step assistance for Aptitude, Coding & Technical Interviews</p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#0d121f] border border-slate-800/80 rounded-3xl space-y-4 shadow-inner">
        {messages.map((msg, idx) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isAI
                    ? 'bg-[#111726] border border-slate-800 text-slate-200'
                    : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                }`}
              >
                {/* Code snippet if attached to message */}
                {msg.code && (
                  <pre className="p-3 mb-2 rounded-xl bg-black/40 border border-white/10 text-slate-200 font-mono text-xs overflow-x-auto">
                    <code>{msg.code}</code>
                  </pre>
                )}

                <div className="whitespace-pre-wrap font-sans leading-relaxed">
                  {msg.text}
                </div>

                {isAI && (
                  <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-indigo-400" /> Placify Placement Intelligence
                    </span>
                    <button
                      onClick={() => handleCopy(msg.text, idx)}
                      className="hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {!isAI && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-1 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-[#111726] border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Placify AI is formulating step-by-step guidance...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Pre-canned Prompt Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 text-xs shrink-0">
        <span className="text-slate-500 font-bold shrink-0 text-[11px] uppercase tracking-wider flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Quick Doubts:
        </span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1 rounded-full bg-[#111726] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-colors shrink-0 text-[11px]"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#111726] border border-slate-800 rounded-3xl space-y-2 shrink-0 shadow-xl">
        {showCodeInput && (
          <div className="p-2 rounded-xl bg-[#0a0d14] border border-slate-800">
            <div className="flex items-center justify-between pb-1 text-[11px] text-slate-400 font-medium">
              <span>Paste Code to Debug / Analyze:</span>
              <button onClick={() => setShowCodeInput(false)} className="hover:text-white">✕ Close</button>
            </div>
            <textarea
              rows={4}
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              placeholder="def solve(nums): ..."
              className="w-full bg-transparent text-xs text-white font-mono placeholder-slate-600 focus:outline-none resize-none"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCodeInput(!showCodeInput)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all ${
              showCodeInput
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500'
                : 'bg-[#182238] text-slate-400 hover:text-white border-slate-700'
            }`}
            title="Attach code snippet"
          >
            <Code2 className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Ask about formulas, aptitude tricks, coding bugs, interview rounds..."
            className="flex-1 bg-[#182238] border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={loading || (!inputMessage.trim() && !codeSnippet.trim())}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

