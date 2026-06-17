'use client';

import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { mcqApi, MCQ, SubmissionResult, problemApi, Problem } from '@/lib/api-modules';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Search, Code2, CheckCircle2, Circle, ChevronLeft, ChevronRight, HelpCircle, XCircle, BrainCircuit, Play, Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PracticeTableSkeleton } from '@/components/skeletons/inline-skeletons';

const ITEMS_PER_PAGE = 8;

// ── CIRCULAR PROGRESS GAUGE ───────────────────────────────────────────────────
const CircularProgress = ({ solved, total }: { solved: number; total: number }) => {
  const percentage = total > 0 ? Math.min(100, Math.round((solved / total) * 100)) : 0;
  const radius = 32;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="40" cy="40" r={radius} className="stroke-zinc-800 fill-none" strokeWidth={strokeWidth} />
        {total > 0 && (
          <circle
            cx="40"
            cy="40"
            r={radius}
            className="stroke-emerald-500 transition-all duration-500 ease-out fill-none"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[13px] font-black text-white leading-none">{solved}/{total}</span>
        <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">Solved</span>
      </div>
    </div>
  );
};

export default function PracticePage() {
  const router = useRouter();
  const { initialized, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const isAuthReady = initialized && !authLoading;

  // Raw data states
  const [loading, setLoading] = useState(true);
  const [allMcqs, setAllMcqs] = useState<MCQ[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  
  // Solved IDs
  const [solvedMcqs, setSolvedMcqs] = useState<Set<string>>(new Set());

  // MCQ Stats
  const [mcqCounts, setMcqCounts] = useState<{ easy: number; medium: number; hard: number; total: number }>({ easy: 0, medium: 0, hard: 0, total: 0 });
  const [mcqStats, setMcqStats] = useState<any>(null);

  // Filter States
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>('javascript');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal / Solving States for MCQ
  const [selectedMcq, setSelectedMcq] = useState<MCQ | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // Start Session Modal States
  const [isStartSessionOpen, setIsStartSessionOpen] = useState(false);
  const [sessionLang, setSessionLang] = useState<string>('javascript');
  const [sessionDifficulty, setSessionDifficulty] = useState<string>('all');
  const [sessionLimit, setSessionLimit] = useState<number>(20);
  const [sessionUnsolvedOnly, setSessionUnsolvedOnly] = useState<boolean>(true);

  const handleOpenStartSession = () => {
    setSessionLang(selectedLanguage || languages[0] || 'javascript');
    setSessionDifficulty('all');
    setSessionLimit(20);
    setSessionUnsolvedOnly(true);
    setIsStartSessionOpen(true);
  };

  const handleStartSession = () => {
    setIsStartSessionOpen(false);
    router.push(
      `/practice/mcq/session?lang=${encodeURIComponent(sessionLang)}&difficulty=${sessionDifficulty}&limit=${sessionLimit}&unsolvedOnly=${sessionUnsolvedOnly}`
    );
  };

  const sessionLanguageOptions = useMemo(() => {
    const options = languages.length > 0 ? languages : ['javascript'];
    return options.includes(sessionLang) ? options : [sessionLang, ...options];
  }, [languages, sessionLang]);

  useEffect(() => {
    if (!isStartSessionOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsStartSessionOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStartSessionOpen]);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchData();
  }, [isAuthReady, isAuthenticated, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metaRes, mcqsRes, statsRes, countsRes, attemptsRes] = await Promise.all([
        mcqApi.getMeta(),
        mcqApi.getMCQs({ limit: 1000 }),
        api.get('/mcqs/stats'),
        mcqApi.getCounts(),
        mcqApi.getMyAttempts({ limit: 1000 }),
      ]);

      if (metaRes?.data?.languages) {
        setLanguages(metaRes.data.languages);
      }
      if (mcqsRes?.mcqs) {
        setAllMcqs(mcqsRes.mcqs);
      }
      if (statsRes?.data?.stats) {
        setMcqStats(statsRes.data.stats);
      }
      if (countsRes) {
        setMcqCounts(countsRes);
      }

      // Solved MCQs Set
      const solvedMcqSet = new Set<string>();
      if (attemptsRes?.submissions) {
        attemptsRes.submissions.forEach((sub: any) => {
          if (sub.status === 'accepted' && sub.mcqId?._id) {
            solvedMcqSet.add(sub.mcqId._id);
          }
        });
      }
      setSolvedMcqs(solvedMcqSet);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load practice details');
    } finally {
      setLoading(false);
    }
  };

  // Filter list by options
  const filteredItems = useMemo(() => {
    let result = [...allMcqs];

    if (selectedLanguage) {
      result = result.filter((m) => m.language.toLowerCase() === selectedLanguage.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((m) => m.question.toLowerCase().includes(q));
    }

    return result;
  }, [allMcqs, selectedLanguage, searchQuery]);

  // Paginated Items
  const totalItems = filteredItems.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  // Reset page on filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLanguage, searchQuery]);

  // Open solving modal for MCQ
  const handleOpenMcq = (mcq: MCQ) => {
    setSelectedMcq(mcq);
    setSelectedAnswer(null);
    setIsSubmitted(false);
    setSubmissionResult(null);
  };

  // Submit in-place answer for MCQ
  const handleSubmitAnswer = async () => {
    if (!selectedMcq || selectedAnswer === null) return;
    try {
      setSubmitting(true);
      const res = await mcqApi.submitAnswer({
        mcqId: selectedMcq._id,
        answer: selectedAnswer,
      });
      setSubmissionResult(res);
      setIsSubmitted(true);

      if (res.isCorrect) {
        setSolvedMcqs((prev) => {
          const next = new Set(prev);
          next.add(selectedMcq._id);
          return next;
        });

        // Dynamic stats update:
        setMcqStats((prev: any) => {
          if (!prev) return prev;
          const updatedByDifficulty = { ...prev.byDifficulty };
          const difficultyKey = selectedMcq.difficulty as 'easy' | 'medium' | 'hard';
          const isNewSolve = !solvedMcqs.has(selectedMcq._id);
          
          if (isNewSolve) {
            updatedByDifficulty[difficultyKey] = (updatedByDifficulty[difficultyKey] || 0) + 1;
          }

          const nextAttempts = prev.totalAttempts + 1;
          const nextCorrect = prev.correctAttempts + (isNewSolve ? 1 : 0);

          return {
            ...prev,
            totalAttempts: nextAttempts,
            correctAttempts: nextCorrect,
            accuracy: nextAttempts > 0 ? (nextCorrect / nextAttempts) * 100 : 0,
            byDifficulty: updatedByDifficulty,
          };
        });
      } else {
        setMcqStats((prev: any) => {
          if (!prev) return prev;
          const nextAttempts = prev.totalAttempts + 1;
          return {
            ...prev,
            totalAttempts: nextAttempts,
            accuracy: nextAttempts > 0 ? (prev.correctAttempts / nextAttempts) * 100 : 0,
          };
        });
      }
    } catch {
      toast.error('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  // MCQ Stats metrics
  const mcqsSolvedCount = mcqStats?.correctAttempts || 0;
  const easyMcqSolved = mcqStats?.byDifficulty?.easy || 0;
  const medMcqSolved = mcqStats?.byDifficulty?.medium || 0;
  const hardMcqSolved = mcqStats?.byDifficulty?.hard || 0;

  if (!isAuthReady) return null;

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 p-4 md:p-6 min-h-0 overflow-y-auto lg:overflow-hidden font-sans text-zinc-100">
      
      {/* ── LEFT MAIN CONTENT COLUMN ────────────────────────────────────────── */}
      <div className="flex-1 h-full flex flex-col gap-4 min-w-0">
        
        {/* Header & selectors */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight leading-none">Practise arena</h1>
            <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mt-1.5">
              Hone your skills with curated exercises
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Language Dropdown */}
            <Select value={selectedLanguage || 'all'} onValueChange={(val) => setSelectedLanguage(val === 'all' ? null : val)}>
              <SelectTrigger className="w-[120px] bg-zinc-900 border-0 text-zinc-300 rounded-xl hover:bg-zinc-800 transition-colors text-xs shadow-none">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100 rounded-xl">
                <SelectItem value="all" className="focus:bg-zinc-900 focus:text-white rounded-lg text-xs">All Languages</SelectItem>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang} className="capitalize rounded-lg text-xs">
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Action Session Button (Starts MCQ session) */}
            <Button
              onClick={handleOpenStartSession}
              className="bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs font-bold px-3 h-9 rounded-xl flex items-center gap-1 hover:scale-[1.02] transition-all"
            >
              <Play className="h-3.5 w-3.5 fill-emerald-950" /> Start Session
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 max-w-sm w-full p-1 bg-zinc-900/40 rounded-2xl shrink-0">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-white transition-colors" />
            <Input
              placeholder="Search MCQ questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 text-zinc-100 pl-9 pr-3 h-8 text-xs focus-visible:ring-0 shadow-none placeholder:text-zinc-650 w-full"
            />
          </div>
        </div>

        {/* Cards list - borderless */}
        <div className="flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar py-1">
            {loading ? (
              <PracticeTableSkeleton />
            ) : filteredItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-zinc-900/10 rounded-3xl">
                <BrainCircuit className="h-8 w-8 text-zinc-700 mb-3" />
                <p className="text-zinc-500 text-sm font-semibold">No exercises found</p>
                <p className="text-zinc-600 text-xs mt-1">Try relaxing filters or changing language</p>
              </div>
            ) : (
              <div className="space-y-2">
                {paginatedItems.map((mcq) => {
                  const isSolved = solvedMcqs.has(mcq._id);

                  return (
                    <div
                      key={mcq._id}
                      onClick={() => handleOpenMcq(mcq)}
                      className="group relative flex items-center justify-between p-4 bg-zinc-900/20 hover:bg-zinc-900/40 rounded-2xl transition-all duration-300 gap-4 cursor-pointer"
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="shrink-0 mt-0.5">
                          {isSolved ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 bg-emerald-500/10 rounded-lg p-0.5" />
                          ) : (
                            <Circle className="h-5 w-5 text-zinc-800 group-hover:text-zinc-600 transition-colors" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-semibold text-zinc-350 group-hover:text-white transition-colors line-clamp-2 leading-relaxed">
                            {mcq.question}
                          </h4>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <span className={cn(
                              'text-[9px] font-black uppercase tracking-wider',
                              mcq.difficulty === 'easy' ? 'text-emerald-500' :
                              mcq.difficulty === 'medium' ? 'text-amber-500' : 'text-red-500'
                            )}>
                              {mcq.difficulty}
                            </span>
                            <span className="text-[10px] text-zinc-850 font-bold">•</span>
                            <span className="text-[9px] bg-zinc-950 text-zinc-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              {mcq.language}
                            </span>
                            {mcq.tags && mcq.tags.length > 0 && (
                              <>
                                <span className="text-[10px] text-zinc-850 font-bold">•</span>
                                <div className="flex flex-wrap gap-1">
                                  {mcq.tags.slice(0, 2).map((tag) => (
                                    <span key={tag} className="text-[8px] bg-zinc-950/60 text-zinc-650 px-1.5 py-0.5 rounded font-medium">
                                      {tag.replace('-', ' ')}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-700 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          {totalItems > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between gap-3 p-4 shrink-0 bg-zinc-950/20 rounded-2xl mt-2">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Showing <span className="text-zinc-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> -{' '}
                <span className="text-zinc-300">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> of{' '}
                <span className="text-emerald-400">{totalItems}</span> exercises
              </p>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  className="h-7 w-7 bg-zinc-900/60 border-0 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-lg active:scale-95 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center justify-center min-w-[3rem] px-2 h-7 bg-zinc-900/60 rounded-lg text-xs font-bold">
                  <span className="text-white">{currentPage}</span>
                  <span className="text-zinc-650 mx-1">/</span>
                  <span className="text-zinc-500">{totalPages}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="h-7 w-7 bg-zinc-900/60 border-0 text-zinc-400 hover:bg-zinc-800 hover:text-white rounded-lg active:scale-95 transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT DETAILS SIDEBAR ────────────────────────────────────────────── */}
      <div className="w-full lg:w-[320px] shrink-0 h-full flex flex-col gap-4 overflow-y-auto lg:overflow-hidden pr-1 pb-4 lg:pb-0">
        
        {/* Profile spacing offset */}
        <div className="hidden lg:block h-16 shrink-0" />

        {/* solved progress chart card */}
        <div className="bg-zinc-900/20 backdrop-blur-md rounded-3xl p-5 flex flex-col gap-4 shrink-0">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              MCQ solved chart
            </h4>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between text-xs pr-2">
                <span className="flex items-center gap-1.5 font-bold text-emerald-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Easy
                </span>
                <span className="font-mono text-zinc-350">
                  {easyMcqSolved}/{mcqCounts.easy || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pr-2">
                <span className="flex items-center gap-1.5 font-bold text-amber-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Medium
                </span>
                <span className="font-mono text-zinc-350">
                  {medMcqSolved}/{mcqCounts.medium || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pr-2">
                <span className="flex items-center gap-1.5 font-bold text-red-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Hard
                </span>
                <span className="font-mono text-zinc-350">
                  {hardMcqSolved}/{mcqCounts.hard || 0}
                </span>
              </div>
            </div>

            <CircularProgress
              solved={mcqsSolvedCount}
              total={mcqCounts.total || 0}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1 border-t border-zinc-900/40 pt-4">
            <div className="bg-zinc-900/10 p-3 rounded-2xl text-center">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Accuracy</span>
              <p className="text-sm font-black text-white mt-0.5">
                {mcqStats?.accuracy ? Math.round(mcqStats.accuracy) : 0}%
              </p>
            </div>
            <div className="bg-zinc-900/10 p-3 rounded-2xl text-center">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Attempts</span>
              <p className="text-sm font-black text-white mt-0.5">
                {mcqStats?.totalAttempts || 0}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ── START MCQ SESSION CONFIG MODAL ─────────────────────────────────── */}
      {isStartSessionOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
          onMouseDown={() => setIsStartSessionOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="start-session-title"
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl shadow-black/70"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute left-1/4 right-1/4 top-0 h-[2px] bg-emerald-400" />
            <button
              type="button"
              aria-label="Close start session modal"
              onClick={() => setIsStartSessionOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 pr-10">
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-1.5">
                <Zap className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <h2 id="start-session-title" className="text-lg font-black tracking-tight text-white">
                  Configure Practice Session
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Select your parameters to begin a focused practice session.
                </p>
              </div>
            </div>

            <div className="my-5 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="session-language" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Language
                </label>
                <select
                  id="session-language"
                  value={sessionLang}
                  onChange={(event) => setSessionLang(event.target.value)}
                  className="h-10 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-xs font-semibold text-zinc-200 outline-none transition-colors hover:border-zinc-700 focus:border-emerald-500/60"
                >
                  {sessionLanguageOptions.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Difficulty
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {['all', 'easy', 'medium', 'hard'].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSessionDifficulty(diff)}
                      className={cn(
                        'h-9 rounded-xl border text-xs font-bold capitalize transition-all',
                        sessionDifficulty === diff
                          ? diff === 'easy'
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                            : diff === 'medium'
                              ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                              : diff === 'hard'
                                ? 'border-rose-500/40 bg-rose-500/10 text-rose-400'
                                : 'border-sky-500/40 bg-sky-500/10 text-sky-400'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      )}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Questions Count
                </p>
                <div className="grid grid-cols-5 gap-1.5">
                  {[10, 20, 30, 50, 100].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSessionLimit(size)}
                      className={cn(
                        'h-9 rounded-xl border text-xs font-bold transition-all',
                        sessionLimit === size
                          ? 'border-emerald-500 bg-emerald-500 text-zinc-950'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSessionUnsolvedOnly(!sessionUnsolvedOnly)}
                className={cn(
                  'flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all',
                  sessionUnsolvedOnly
                    ? 'border-emerald-500/30 bg-emerald-500/[0.03]'
                    : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border',
                    sessionUnsolvedOnly
                      ? 'border-emerald-500 bg-emerald-500 text-zinc-950'
                      : 'border-zinc-700 bg-zinc-950'
                  )}
                >
                  {sessionUnsolvedOnly && (
                    <svg className="h-3.5 w-3.5 stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                <span>
                  <span className="block text-xs font-bold text-zinc-200">Only Unsolved Questions</span>
                  <span className="mt-0.5 block text-[10px] text-zinc-500">Filter out questions you have already answered correctly.</span>
                </span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-zinc-900 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsStartSessionOpen(false)}
                className="h-10 rounded-xl px-4 text-xs font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-900 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleStartSession}
                className="h-10 rounded-xl bg-emerald-500 px-6 text-xs font-black uppercase tracking-widest text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95"
              >
                Start Session
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* ── INTERACTIVE MCQ SOLVE MODAL ─────────────────────────────────────── */}
      {selectedMcq && (
        <Dialog open={!!selectedMcq} onOpenChange={(open) => !open && setSelectedMcq(null)}>
          <DialogContent className="max-w-xl bg-gradient-to-b from-zinc-900/95 to-zinc-955/98 border border-zinc-800/80 text-zinc-100 rounded-3xl p-6 shadow-2xl backdrop-blur-md z-[200] overflow-hidden relative before:absolute before:top-0 before:left-1/4 before:right-1/4 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-emerald-500/80 before:to-transparent before:filter before:blur-[1px]">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[9px] bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                  {selectedMcq.language}
                </span>
                <span className={cn(
                  'text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900/40',
                  selectedMcq.difficulty === 'easy' ? 'text-emerald-400 border border-emerald-500/20' :
                  selectedMcq.difficulty === 'medium' ? 'text-amber-400 border border-amber-500/20' : 'text-red-400 border border-red-500/20'
                )}>
                  {selectedMcq.difficulty}
                </span>
              </div>
              <DialogTitle className="text-lg font-bold text-white text-left leading-relaxed">
                {selectedMcq.question}
              </DialogTitle>
              <DialogDescription className="hidden" />
            </DialogHeader>

            <div className="space-y-2.5 my-4">
              {selectedMcq.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const correctAnswer = typeof submissionResult?.correctAnswer === 'string'
                  ? parseInt(submissionResult.correctAnswer)
                  : submissionResult?.correctAnswer;
                const isCorrect = isSubmitted && idx === correctAnswer;
                const isWrong = isSubmitted && isSelected && !submissionResult?.isCorrect;

                let optionStyle = "bg-zinc-900/40 border border-zinc-800/60 hover:bg-zinc-850 hover:text-zinc-200 hover:border-zinc-700/80 text-zinc-300";
                if (isSelected && !isSubmitted) {
                  optionStyle = "bg-emerald-500/5 text-white border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.1)]";
                } else if (isSubmitted) {
                  if (isCorrect) {
                    optionStyle = "bg-emerald-500/10 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]";
                  } else if (isWrong) {
                    optionStyle = "bg-red-500/10 text-red-400 border border-red-500/40 shadow-[0_0_12px_rgba(244,63,94,0.15)]";
                  } else {
                    optionStyle = "bg-zinc-950/50 opacity-40 border border-zinc-900/40 text-zinc-550";
                  }
                }

                return (
                  <div
                    key={idx}
                    onClick={() => !isSubmitted && setSelectedAnswer(idx)}
                    className={cn(
                      'relative flex items-center p-3.5 rounded-2xl transition-all duration-200 cursor-pointer select-none border',
                      optionStyle
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-center w-7 h-7 rounded-lg border text-xs font-black mr-3.5 transition-all',
                      isSelected ? 'border-emerald-500 bg-gradient-to-br from-emerald-500 to-teal-500 text-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.2)]' : 'border-zinc-850 bg-zinc-900/60 text-zinc-500'
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-sm font-medium">{option}</span>
                    {isCorrect && <CheckCircle2 className="absolute right-4 h-4.5 w-4.5 text-emerald-400 fill-emerald-450/10" />}
                    {isWrong && <XCircle className="absolute right-4 h-4.5 w-4.5 text-red-400 fill-red-450/10" />}
                  </div>
                );
              })}
            </div>

            {/* Answer Explanation */}
            {isSubmitted && submissionResult?.explanation && (
              <div className="bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl p-4 mb-4 text-left animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                  <HelpCircle className="h-3.5 w-3.5" /> Explanation
                </div>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  {submissionResult.explanation}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-zinc-900/80 pt-4">
              {!isSubmitted ? (
                <>
                  <DialogClose asChild>
                    <Button variant="ghost" className="text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-widest hover:bg-zinc-900/50 rounded-xl px-4 h-10">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null || submitting}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-black tracking-widest uppercase rounded-xl px-6 h-10 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Submit Answer
                  </Button>
                </>
              ) : (
                <DialogClose asChild>
                  <Button className="bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-black tracking-widest uppercase rounded-xl px-6 h-10 hover:scale-[1.02] active:scale-95 transition-all">
                    Done
                  </Button>
                </DialogClose>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
