import React from 'react';
import Editor from '@monaco-editor/react';
import { Copy, RotateCcw, Check } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

export default function CodeEditor({
  code,
  onChange,
  language = 'javascript',
  onLanguageChange,
  onReset,
  height = '480px',
}) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const monacoLangMap = {
    javascript: 'javascript',
    python: 'python',
    cpp: 'cpp',
    java: 'java',
  };

  return (
    <div className="flex flex-col h-full bg-[#111726] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0d121f] border-b border-slate-800 text-xs">
        <div className="flex items-center gap-3">
          <label className="text-slate-400 font-medium">Language:</label>
          <select
            value={language}
            onChange={(e) => onLanguageChange && onLanguageChange(e.target.value)}
            className="bg-[#182238] border border-slate-700 text-white rounded-lg px-2.5 py-1 font-mono focus:outline-none focus:border-indigo-500"
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++ (GCC 14)</option>
            <option value="java">Java (OpenJDK 17)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-2.5 py-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Reset starter template"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor Pane */}
      <div className="flex-1 w-full min-h-[380px]">
        <Editor
          height={height}
          language={monacoLangMap[language] || 'javascript'}
          value={code}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onChange={(val) => onChange(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: 'Fira Code, Consolas, monospace',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
}

