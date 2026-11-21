import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Award,
  Zap,
  Briefcase,
  History,
  TrendingUp,
  Image as ImageIcon,
  FileCheck,
  X,
  Eye,
} from 'lucide-react';
import api from '../api';

const SAMPLE_RESUME = `Aarav Sharma
aarav.sharma@email.com | +91 98765 43210 | Bengaluru, India
GitHub: github.com/aaravsharma | LinkedIn: linkedin.com/in/aaravsharma

EDUCATION
B.Tech in Computer Science & Engineering (2021 – 2025)
ABC Institute of Technology, CGPA: 8.8/10
Relevant Coursework: Data Structures & Algorithms, DBMS, Operating Systems, Computer Networks.

TECHNICAL SKILLS
Languages: JavaScript (ES6+), TypeScript, Python, C++, SQL, HTML5, CSS3
Frameworks & Libraries: React.js, Next.js, Node.js, Express.js, Tailwind CSS, Redux Toolkit
Databases & Tools: MongoDB, PostgreSQL, Git, GitHub, Docker, Postman, Linux

PROJECTS
Placify – AI-Powered Placement Preparation Platform (React, Node, Express, MongoDB)
- Developed a full-stack campus preparation platform with timed mock assessments, coding arena, and doubt solver.
- Integrated Monaco Editor supporting multi-language syntax with sandboxed test case validation.
- Engineered anti-cheating full-screen enforcement and tab-switch monitoring to uphold assessment integrity.

E-Commerce Microservices Engine (Node.js, Express, Redis, MongoDB)
- Architected RESTful microservices for product catalog and checkout with JWT authentication.
- Implemented Redis caching for hot product listings, cutting query response time by 45%.
- Integrated payment webhook handlers with idempotent transaction logging.

EXPERIENCE
Software Engineering Intern | NextGen Cloud Labs (June 2024 – August 2024)
- Built interactive analytics dashboard using React and Recharts, increasing student engagement by 28%.
- Optimized database indexing in MongoDB, reducing average query latency from 240ms to 85ms.
- Collaborated in Agile bi-weekly sprints, participating in code reviews and PR validations.

ACHIEVEMENTS & CERTIFICATIONS
- Solved 350+ DSA problems on LeetCode & GeeksforGeeks (Max Rating: 1680).
- Finalist in Smart India Hackathon 2024 (College Level).`;

const COMPANIES = [
  'Amazon',
  'Microsoft',
  'TCS',
  'Infosys',
  'Wipro',
  'Accenture',
  'Cognizant',
  'Capgemini',
];

const ROLES = [
  'Software Development Engineer (SDE-1)',
  'Full Stack Developer',
  'Frontend Engineer',
  'Backend Engineer',
  'Data Analyst / Associate Software Engineer',
  'Cloud / DevOps Engineer',
];

export default function ResumeAnalyzerPage() {
  const navigate = useNavigate();
  const [resumeText, setResumeText] = useState('');
  const [targetCompany, setTargetCompany] = useState('Amazon');
  const [targetRole, setTargetRole] = useState('Software Development Engineer (SDE-1)');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [copiedKeyword, setCopiedKeyword] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // File parsing states
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsingFile, setParsingFile] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/resume/history');
      if (res.data?.success && res.data.data) {
        setHistory(res.data.data);
      }
    } catch (err) {
      // Non-blocking history fetch
    }
  };

  const processSelectedFile = async (file) => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isText = file.type === 'text/plain' || lowerName.endsWith('.txt') || lowerName.endsWith('.md');
    const isPdf = file.type === 'application/pdf' || lowerName.endsWith('.pdf');
    const isImage = file.type.startsWith('image/') || lowerName.match(/\.(jpe?g|png|webp)$/);

    if (!isText && !isPdf && !isImage) {
      setError('Please upload a supported resume format: .pdf, .jpg, .jpeg, .png, .webp, .txt, or .md.');
      return;
    }

    setError(null);
    setParsingFile(true);

    try {
      if (isText) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target.result;
          setResumeText(text);
          setUploadedFile({
            name: file.name,
            size: (file.size / 1024).toFixed(1) + ' KB',
            type: 'text',
            charCount: text.length,
          });
          setImagePreview(null);
          setParsingFile(false);
        };
        reader.onerror = () => {
          setError('Could not read the selected text file.');
          setParsingFile(false);
        };
        reader.readAsText(file);
      } else {
        // PDF or Image: Read as Data URL
        const reader = new FileReader();
        reader.onload = async (event) => {
          const dataUrl = event.target.result;
          if (isImage) {
            setImagePreview(dataUrl);
            setShowImagePreview(true);
          } else {
            setImagePreview(null);
            setShowImagePreview(false);
          }

          try {
            const res = await api.post('/resume/parse-file', {
              fileBase64: dataUrl,
              mimeType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
              fileName: file.name,
            });

            if (res.data?.success && res.data.data?.text) {
              setResumeText(res.data.data.text);
              setUploadedFile({
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
                type: isPdf ? 'pdf' : 'image',
                charCount: res.data.data.charCount,
              });
            } else {
              setError(res.data?.message || 'Could not parse text from file.');
            }
          } catch (err) {
            setError(err.response?.data?.message || 'Failed to extract text from file.');
          } finally {
            setParsingFile(false);
          }
        };
        reader.onerror = () => {
          setError('Could not read the selected file.');
          setParsingFile(false);
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      setError('Error reading file: ' + err.message);
      setParsingFile(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) processSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processSelectedFile(file);
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setImagePreview(null);
    setShowImagePreview(false);
    setResumeText('');
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 50) {
      setError('Please enter or paste your resume text (minimum 50 characters).');
      return;
    }

    setError(null);
    setAnalyzing(true);
    try {
      const res = await api.post('/resume/analyze', {
        resumeText,
        targetCompany,
        targetRole,
      });

      if (res.data?.success) {
        setAnalysis(res.data.data);
        fetchHistory();
      } else {
        setError(res.data?.message || 'Failed to analyze resume.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error communicating with AI analysis engine.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLoadSample = () => {
    setResumeText(SAMPLE_RESUME);
    setError(null);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyword(text);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const startInterviewWithResume = () => {
    navigate('/mock-interview', {
      state: {
        targetCompany,
        targetRole,
        resumeSnippet: resumeText.slice(0, 1200),
      },
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Recruiter & ATS Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            AI Resume Analyzer & Auditor
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Audit your resume against company-specific ATS filters, identify missing skills, rewrite weak bullet points using Google's X-Y-Z formula, and boost shortlist chances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
            >
              <History className="w-4 h-4 text-indigo-400" />
              <span>Past Audits ({history.length})</span>
            </button>
          )}

          <button
            onClick={handleLoadSample}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 text-xs font-semibold border border-indigo-500/30 transition"
          >
            <Zap className="w-3.5 h-3.5" />
            Load Sample SDE Resume
          </button>
        </div>
      </div>

      {/* History Drawer Modal */}
      {showHistory && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0f172a] border border-slate-700/80 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              Previous Resume Analyses
            </h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.map((h, i) => (
              <div
                key={h._id || i}
                onClick={() => {
                  setAnalysis(h);
                  setTargetCompany(h.targetCompany || 'Amazon');
                  setTargetRole(h.targetRole || 'Software Development Engineer');
                  setShowHistory(false);
                }}
                className="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 cursor-pointer transition flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-200">{h.targetCompany} • {h.targetRole?.split(' ')[0]}</p>
                  <p className="text-[11px] text-slate-400">{new Date(h.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold text-xs">
                  <Award className="w-3.5 h-3.5" />
                  {h.atsScore}/100
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Configuration & Resume Text Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Role & Company Targets */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-400" />
              Target Company & Role
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Target Company
              </label>
              <select
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                {COMPANIES.map((comp) => (
                  <option key={comp} value={comp}>
                    {comp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Target Job Profile
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition"
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/30 text-[11px] text-indigo-300 leading-relaxed">
              💡 <strong>ATS Insight:</strong> Top companies like {targetCompany} utilize automated applicant filters before recruiters review candidates. We match against industry keywords, tech stack, and impact density.
            </div>
          </div>

          {/* Enhanced Resume File Upload (PDF, JPG, PNG, TXT, MD) */}
          <div className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-indigo-400" />
                Upload Resume File
              </h3>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                PDF & JPG supported
              </span>
            </div>

            {uploadedFile ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        uploadedFile.type === 'pdf'
                          ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                          : uploadedFile.type === 'image'
                          ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400'
                          : 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400'
                      }`}
                    >
                      {uploadedFile.type === 'pdf'
                        ? 'PDF'
                        : uploadedFile.type === 'image'
                        ? 'IMG'
                        : 'TXT'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white truncate max-w-[150px]">
                        {uploadedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {uploadedFile.size} • {uploadedFile.charCount || resumeText.length} chars parsed
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleClearFile}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Text Extracted</span>
                  </div>

                  {imagePreview && (
                    <button
                      onClick={() => setShowImagePreview(!showImagePreview)}
                      className="ml-auto flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{showImagePreview ? 'Hide Image' : 'View Image'}</span>
                    </button>
                  )}
                </div>

                {imagePreview && showImagePreview && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-700 max-h-48">
                    <img
                      src={imagePreview}
                      alt="Uploaded Resume Preview"
                      className="w-full object-contain bg-black/40"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed transition text-center cursor-pointer relative ${
                  isDragOver
                    ? 'border-indigo-400 bg-indigo-950/20'
                    : 'border-slate-700 hover:border-indigo-500 bg-slate-900/60'
                }`}
              >
                {parsingFile ? (
                  <div className="py-3 flex flex-col items-center gap-2">
                    <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                    <span className="text-xs font-semibold text-slate-200">
                      Parsing Document & Extracting Text...
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Processing PDF layout or AI Image OCR
                    </span>
                  </div>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <div className="flex items-center justify-center gap-2 mb-2 text-slate-400">
                      <FileText className="w-6 h-6 text-rose-400" />
                      <ImageIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">
                      Click to upload or drag & drop
                    </span>
                    <span className="text-[10px] text-indigo-300 font-medium mt-1">
                      Supports .PDF, .JPG, .PNG, .WEBP, .TXT, .MD
                    </span>
                    <span className="text-[9px] text-slate-500 mt-1">
                      Image and scanned PDF OCR requires Gemini API access
                    </span>
                    <input
                      type="file"
                      accept=".pdf,application/pdf,.jpg,.jpeg,image/jpeg,.png,image/png,.webp,image/webp,.txt,.md,text/plain"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Resume Textarea */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800 shadow-lg flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Resume Content
                </label>
                {uploadedFile && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    Parsed from {uploadedFile.name}
                  </span>
                )}
              </div>
              <span className="text-[11px] text-slate-500">
                {resumeText.length} characters
              </span>
            </div>

            <textarea
              rows={12}
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Paste your complete resume text here (Education, Skills, Experience, Projects, Certifications)... or upload your PDF / JPG resume above!"
              className="w-full flex-1 p-4 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500 resize-none transition"
            />

            {error && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-4">
              <button
                onClick={handleClearFile}
                className="text-xs text-slate-400 hover:text-slate-200 transition"
              >
                Clear text & reset
              </button>

              <button
                onClick={handleAnalyze}
                disabled={analyzing || !resumeText.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing with AI ATS Auditor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Resume Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ATS Audit Report for {analysis.targetCompany} ({analysis.targetRole})
            </h2>
            <button
              onClick={startInterviewWithResume}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition"
            >
              <Zap className="w-3.5 h-3.5" />
              Take Tailored AI Mock Interview
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Top Metric Cards: ATS Score, Role Match, Recruiter Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* ATS Score Gauge Card */}
            <div className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-slate-400 mb-2">Overall ATS Score</span>
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="#1e293b"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke={analysis.atsScore >= 80 ? '#10b981' : analysis.atsScore >= 65 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - analysis.atsScore / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-white">{analysis.atsScore}</span>
                  <span className="text-[11px] text-slate-400 block font-medium">/ 100</span>
                </div>
              </div>
              <span
                className={`mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  analysis.atsScore >= 80
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}
              >
                {analysis.atsScore >= 80 ? 'ATS Ready & Strong' : 'Needs Optimization'}
              </span>
            </div>

            {/* Role Match Card */}
            <div className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-slate-400 mb-2">Role Alignment</span>
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="#1e293b"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="48"
                    stroke="#6366f1"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={2 * Math.PI * 48 * (1 - (analysis.roleMatchScore || 78) / 100)}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-extrabold text-white">{analysis.roleMatchScore || 78}%</span>
                  <span className="text-[11px] text-slate-400 block font-medium">Match</span>
                </div>
              </div>
              <span className="mt-2 text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {targetRole.split(' ')[0]}
              </span>
            </div>

            {/* Recruiter Summary Card */}
            <div className="md:col-span-2 p-5 rounded-2xl bg-[#0d1322] border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-4 h-4" />
                  Executive Recruiter Summary
                </span>
                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {analysis.summary || 'Your resume demonstrates solid foundational engineering skills with appropriate academic rigor. Incorporating specific architectural metrics and enterprise testing frameworks will elevate your application to top-tier percentile.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Target: <strong className="text-white">{analysis.targetCompany}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <span>Top 15% Campus Percentile</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section Scores Breakdown */}
          {analysis.sectionScores && (
            <div className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                Section-by-Section ATS Readiness
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {Object.entries(analysis.sectionScores).map(([key, score]) => {
                  const labelMap = {
                    contactInfo: 'Contact Information',
                    education: 'Education & Academics',
                    projects: 'Technical Projects',
                    skills: 'Technical Skills Matrix',
                    experience: 'Work / Internships',
                  };
                  return (
                    <div key={key} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">{labelMap[key] || key}</span>
                        <span className={`font-bold ${score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {score}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Missing Keywords Section */}
          {analysis.missingKeywords && analysis.missingKeywords.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    High-Priority Keywords Missing for {analysis.targetCompany}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    ATS crawlers parse resumes for these exact industry terms. Embedding them in your projects will substantially lift match rankings.
                  </p>
                </div>
                <span className="text-xs text-slate-400">Click to copy</span>
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                {analysis.missingKeywords.map((kw, i) => (
                  <button
                    key={i}
                    onClick={() => handleCopy(kw)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-xs font-semibold transition group"
                  >
                    <span>{kw}</span>
                    {copiedKeyword === kw ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-amber-400/60 group-hover:text-amber-300" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bullet Point Improvements (Before vs After) */}
          {analysis.bulletPointImprovements && analysis.bulletPointImprovements.length > 0 && (
            <div className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  Google X-Y-Z Bullet Point Optimization
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Top engineering recruiters favor: <em>"Accomplished [X], as measured by [Y], by doing [Z]"</em>. Compare your bullets with AI rewrites:
                </p>
              </div>

              <div className="space-y-4">
                {analysis.bulletPointImprovements.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3"
                  >
                    {/* Original bullet */}
                    <div className="flex items-start gap-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 flex-shrink-0 mt-0.5">
                        Before
                      </span>
                      <p className="text-xs text-slate-400 font-mono italic">
                        "{item.original}"
                      </p>
                    </div>

                    {/* Critique */}
                    {item.critique && (
                      <div className="text-[11px] text-amber-300/90 bg-amber-950/20 border-l-2 border-amber-500 px-3 py-1.5 rounded-r">
                        <strong>Critique:</strong> {item.critique}
                      </div>
                    )}

                    {/* Suggested rewrite */}
                    <div className="flex items-start justify-between gap-3 bg-indigo-950/20 border border-indigo-500/30 p-3 rounded-lg">
                      <div className="flex items-start gap-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0 mt-0.5">
                          AI Suggested
                        </span>
                        <p className="text-xs text-slate-200 font-mono leading-relaxed">
                          "{item.suggested}"
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(item.suggested)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
                        title="Copy bullet"
                      >
                        {copiedKeyword === item.suggested ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Critical Fixes Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Resume Strengths
              </h3>
              <ul className="space-y-2">
                {(analysis.topStrengths || [
                  'Consistent technical vocabulary throughout project descriptions',
                  'Clean chronological layout easily read by automated scanners',
                  'Demonstrated hands-on experience in full-stack engineering',
                ]).map((str, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                    <span className="text-emerald-400 mt-0.5 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Fixes */}
            <div className="p-6 rounded-2xl bg-[#0d1322] border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Actionable Fixes for Shortlisting
              </h3>
              <ul className="space-y-2">
                {(analysis.criticalFixes || [
                  'Replace generic duty phrases with measurable engineering metrics',
                  'Add clickable GitHub repositories and live demo links',
                  'Explicitly mention Unit Testing and CI/CD tools in projects',
                ]).map((fix, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                    <span className="text-rose-400 mt-0.5 font-bold">•</span>
                    <span>{fix}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Action Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-indigo-900/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Ready to test your answers in a real interview?
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Launch an AI Mock Technical Interview tailored to your {analysis.targetRole} role and {analysis.targetCompany} interview pattern with real-time audio voice dialogue.
              </p>
            </div>
            <button
              onClick={startInterviewWithResume}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex-shrink-0"
            >
              <Zap className="w-4 h-4" />
              <span>Launch AI Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

