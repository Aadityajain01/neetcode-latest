"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { mcqApi, problemApi, MCQ, Problem } from "@/lib/api-modules";
import { useAuthStore } from "@/store/auth-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Code2, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PracticeTableSkeleton } from "@/components/skeletons/inline-skeletons";
import { toast } from "sonner";

type LanguageMeta = { name: string; difficulties: Set<string>; tags: Set<string>; };
const ITEMS_PER_PAGE = 5;

function normalizeLanguage(value?: string | null): string {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

export default function PracticeLanguagePage() {
  const router = useRouter();
  const { initialized, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const isAuthReady = initialized && !authLoading;
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState<LanguageMeta[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"mcq" | "programming">("mcq");
  const [page, setPage] = useState(1);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthReady) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    fetchLanguages();
  }, [isAuthReady, isAuthenticated, router]);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const [mcqMetaRes, mcqListRes, dsaProblemsRes, practiceProblemsRes] = await Promise.allSettled([
        mcqApi.getMeta(), mcqApi.getMCQs({ limit: 2000 }),
        problemApi.getProblems({ type: "dsa", limit: 2000 }), problemApi.getProblems({ type: "practice", limit: 2000 }),
      ]);
      const map = new Map<string, LanguageMeta>();
      const ensureLanguage = (lang: string) => {
        const normalized = normalizeLanguage(lang);
        if (!normalized) return;
        if (!map.has(normalized)) map.set(normalized, { name: normalized, difficulties: new Set(), tags: new Set() });
      };
      if (mcqMetaRes.status === "fulfilled") (mcqMetaRes.value.data.languages || []).forEach((lang) => ensureLanguage(lang));
      if (mcqListRes.status === "fulfilled") {
        (mcqListRes.value.mcqs || []).forEach((mcq: MCQ) => {
          const lang = normalizeLanguage(mcq.language);
          if (!lang) return;
          if (!map.has(lang)) map.set(lang, { name: lang, difficulties: new Set(), tags: new Set() });
          if (mcq.difficulty) map.get(lang)!.difficulties.add(mcq.difficulty);
          mcq.tags?.forEach((t) => map.get(lang)!.tags.add(t));
        });
      }
      const addProblemLanguages = (problem: Problem) => { (problem.languages || []).forEach((lang) => ensureLanguage(lang)); };
      if (dsaProblemsRes.status === "fulfilled") (dsaProblemsRes.value.problems || []).forEach(addProblemLanguages);
      if (practiceProblemsRes.status === "fulfilled") (practiceProblemsRes.value.problems || []).forEach(addProblemLanguages);
      const failures = [mcqMetaRes, mcqListRes, dsaProblemsRes, practiceProblemsRes].filter((r) => r.status === "rejected").length;
      if (failures > 0 && map.size > 0) toast.warning("Some language sources failed to load. Showing available results.");
      const langs = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
      if (langs.length === 0) throw new Error("No language data available.");
      setLanguages(langs);
      const initialDiffs: Record<string, string> = {};
      langs.forEach(l => { initialDiffs[l.name] = "all"; });
      setSelectedDifficulties(initialDiffs);
    } catch (e) { console.error(e); toast.error("Failed to load languages."); }
    finally { setLoading(false); }
  };

  const filteredLanguages = useMemo(() => languages.filter((l) => l.name.toLowerCase().includes(search.toLowerCase())), [languages, search]);
  const totalPages = Math.ceil(filteredLanguages.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const visibleLanguages = filteredLanguages.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [search]);

  const handleDifficultyChange = (langName: string, value: string) => { setSelectedDifficulties(prev => ({ ...prev, [langName]: value })); };

  const handleEnterClick = (langName: string) => {
    const diff = selectedDifficulties[langName] || "all";
    if (activeTab === "mcq") {
      router.push(diff === "all" ? `/practice/mcq/session?lang=${langName}` : `/practice/mcq/session?lang=${langName}&difficulty=${diff}`);
    } else {
      router.push(diff === "all" ? `/practice/code/filter?lang=${langName}` : `/practice/code/filter?lang=${langName}&difficulty=${diff}`);
    }
  };

  if (!isAuthReady) return null;

  return (
    <>
      <div className="h-auto lg:h-full overflow-x-hidden overflow-y-auto lg:overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 relative flex flex-col items-center">
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        <div className={cn("absolute -top-[500px] left-[50%] -translate-x-1/2 w-[1000px] h-[500px] opacity-10 pointer-events-none blur-3xl transition-colors duration-1000", activeTab === 'mcq' ? "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500 via-transparent to-transparent" : "bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent")} />
        
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-5 relative z-10 flex flex-col flex-1 min-h-0 overflow-visible lg:overflow-hidden">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-2 mb-4 shrink-0">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-sm">Practice Area</h1>
            <p className="text-zinc-400 text-sm font-medium max-w-lg">Select your domain, choose a language, and hone your engineering skills.</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4 shrink-0 w-full max-w-5xl mx-auto">
            <div className="flex bg-zinc-900/40 backdrop-blur-md rounded-2xl p-1.5 border border-zinc-800/80 shadow-sm w-full md:w-auto shrink-0">
               <button onClick={() => { setActiveTab('mcq'); setPage(1); }} className={cn("flex-1 md:w-40 py-2.5 text-center font-bold text-sm rounded-xl transition-all duration-300", activeTab === 'mcq' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent")}>Multiple Choice</button>
               <button onClick={() => { setActiveTab('programming'); setPage(1); }} className={cn("flex-1 md:w-48 py-2.5 text-center font-bold text-sm rounded-xl transition-all duration-300", activeTab === 'programming' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 border border-transparent")}>Programming</button>
            </div>
            <div className="relative w-full md:w-96 group">
              <Search className={cn("absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors", activeTab === 'mcq' ? "group-focus-within:text-emerald-500 text-zinc-500" : "group-focus-within:text-blue-500 text-zinc-500")} />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search languages..." className="pl-12 h-12 bg-zinc-900/40 backdrop-blur-md border-zinc-800/80 text-zinc-100 rounded-2xl focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 transition-all text-base shadow-sm placeholder:text-zinc-600" />
            </div>
          </div>

          {/* Language Table — fills remaining space */}
          <div className="w-full max-w-5xl mx-auto flex-1 min-h-0 flex flex-col bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/60 rounded-[1.5rem] shadow-xl overflow-hidden relative">
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 text-[9px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-950/80 border-b border-zinc-800/60 shrink-0 z-20">
              <div className="col-span-5 flex items-center">Language Domain</div>
              <div className="col-span-7 flex items-center justify-end pr-2">Actions</div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              {loading ? (
                <PracticeTableSkeleton />
              ) : visibleLanguages.length > 0 ? (
                <div className="divide-y divide-zinc-800/40">
                  {visibleLanguages.map((lang) => (
                    <div key={lang.name} className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-3 md:px-6 hover:bg-zinc-800/40 transition-all duration-300 gap-3 sm:gap-0">
                      <div className={cn("absolute inset-y-0 left-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none", activeTab === 'mcq' ? "bg-emerald-500" : "bg-blue-500")} />
                      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-800/80 shadow-inner group-hover:scale-105 transition-transform">
                          <Code2 className="h-5 w-5 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
                        </div>
                        <h3 className="text-base font-bold text-white capitalize truncate">{lang.name}</h3>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 relative z-10 w-full sm:w-auto">
                        <Select value={selectedDifficulties[lang.name] || "all"} onValueChange={(val) => handleDifficultyChange(lang.name, val)}>
                          <SelectTrigger className="w-full sm:w-[130px] bg-zinc-950/80 border-zinc-800/80 text-zinc-300 rounded-lg h-9 hover:bg-zinc-900 transition-colors focus:ring-1 shadow-none text-xs"><SelectValue placeholder="Difficulty" /></SelectTrigger>
                          <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100 rounded-lg shadow-2xl">
                            <SelectItem value="all" className="focus:bg-zinc-900 focus:text-white rounded-md text-xs">All (Shuffled)</SelectItem>
                            <SelectItem value="easy" className="text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-400 rounded-md text-xs">Easy</SelectItem>
                            <SelectItem value="medium" className="text-amber-400 focus:bg-amber-500/10 focus:text-amber-400 rounded-md text-xs">Medium</SelectItem>
                            <SelectItem value="hard" className="text-red-400 focus:bg-red-500/10 focus:text-red-400 rounded-md text-xs">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={() => handleEnterClick(lang.name)} className={cn("h-9 px-4 rounded-lg font-bold text-xs transition-all hover:scale-[1.02] shadow-sm w-full sm:w-auto", activeTab === 'mcq' ? "bg-emerald-500 hover:bg-emerald-400 text-emerald-950" : "bg-blue-500 hover:bg-blue-400 text-blue-950")}>Start Session</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 bg-zinc-900/20 backdrop-blur-sm w-full">
                  <Code2 className="h-12 w-12 text-zinc-700 mb-3 opacity-50" />
                  <p className="text-zinc-500 text-sm font-medium">No languages found matching &quot;{search}&quot;.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center p-3 gap-3 bg-zinc-950/80 border-t border-zinc-800/60 shrink-0 z-20 backdrop-blur-md">
                 <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="flex items-center justify-center h-9 w-9 bg-zinc-900/80 border border-zinc-800/60 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 transition-all rounded-lg disabled:opacity-30 disabled:cursor-not-allowed group shadow-sm">
                    <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                 </button>
                 <div className="flex items-center gap-1.5 bg-zinc-900/40 px-4 py-1.5 rounded-lg border border-zinc-800/50 backdrop-blur-sm">
                    <span className={cn("text-xs font-bold", activeTab === 'mcq' ? "text-emerald-400" : "text-blue-400")}>{page}</span>
                    <span className="text-zinc-600 font-medium text-xs">/</span>
                    <span className="text-xs text-zinc-400 font-bold">{totalPages}</span>
                 </div>
                 <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="flex items-center justify-center h-9 w-9 bg-zinc-900/80 border border-zinc-800/60 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 transition-all rounded-lg disabled:opacity-30 disabled:cursor-not-allowed group shadow-sm">
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}