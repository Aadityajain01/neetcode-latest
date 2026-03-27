"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layouts/main-layout";
import { mcqApi, problemApi, MCQ, Problem } from "@/lib/api-modules";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Code2, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ProblemsPageSkeleton } from "@/components/skeletons/site-skeletons";

type LanguageMeta = {
  name: string;
  difficulties: Set<string>;
  tags: Set<string>;
};

const ITEMS_PER_PAGE = 5;

function normalizeLanguage(value: string): string {
  return value.trim().toLowerCase();
}

export default function PracticeLanguagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState<LanguageMeta[]>([]);
  const [search, setSearch] = useState("");
  
  // New state for single-step UI
  const [activeTab, setActiveTab] = useState<"mcq" | "programming">("mcq");
  const [page, setPage] = useState(1);
  const [selectedDifficulties, setSelectedDifficulties] = useState<Record<string, string>>({}); // { langName: difficulty }

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const [mcqMetaRes, mcqListRes, dsaProblemsRes, practiceProblemsRes] = await Promise.all([
        mcqApi.getMeta(),
        mcqApi.getMCQs({ limit: 2000 }),
        problemApi.getProblems({ type: "dsa", limit: 2000 }),
        problemApi.getProblems({ type: "practice", limit: 2000 }),
      ]);

      const map = new Map<string, LanguageMeta>();

      const ensureLanguage = (lang: string) => {
        const normalized = normalizeLanguage(lang);
        if (!normalized) return;

        if (!map.has(normalized)) {
          map.set(normalized, {
            name: normalized,
            difficulties: new Set(),
            tags: new Set(),
          });
        }
      };

      (mcqMetaRes.data.languages || []).forEach((lang) => {
        ensureLanguage(lang);
      });

      (mcqListRes.mcqs || []).forEach((mcq: MCQ) => {
        const lang = normalizeLanguage(mcq.language);
        if (!map.has(lang)) {
          map.set(lang, { name: lang, difficulties: new Set(), tags: new Set() });
        }
        map.get(lang)!.difficulties.add(mcq.difficulty);
        mcq.tags?.forEach((t) => map.get(lang)!.tags.add(t));
      });

      const addProblemLanguages = (problem: Problem) => {
        (problem.languages || []).forEach((lang) => {
          ensureLanguage(lang);
        });
      };

      (dsaProblemsRes.problems || []).forEach(addProblemLanguages);
      (practiceProblemsRes.problems || []).forEach(addProblemLanguages);
      
      const langs = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
      setLanguages(langs);
      
      // Initialize default difficulty 'all' for each language
      const initialDiffs: Record<string, string> = {};
      langs.forEach(l => {
        initialDiffs[l.name] = "all";
      });
      setSelectedDifficulties(initialDiffs);
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLanguages = useMemo(() => {
    return languages.filter((l) =>
      l.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [languages, search]);

  // Pagination logic
  const totalPages = Math.ceil(filteredLanguages.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const visibleLanguages = filteredLanguages.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    // Reset to page 1 when search changes
    setPage(1);
  }, [search]);

  const handleDifficultyChange = (langName: string, value: string) => {
    setSelectedDifficulties(prev => ({
      ...prev,
      [langName]: value
    }));
  };

  const handleEnterClick = (langName: string) => {
    const diff = selectedDifficulties[langName] || "all";
    if (activeTab === "mcq") {
      if (diff === "all") {
        router.push(`/practice/mcq/session?lang=${langName}`);
      } else {
        router.push(`/practice/mcq/session?lang=${langName}&difficulty=${diff}`);
      }
    } else {
      // Programming Questions
      if (diff === "all") {
        router.push(`/practice/code/filter?lang=${langName}`);
      } else {
        router.push(`/practice/code/filter?lang=${langName}&difficulty=${diff}`);
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <ProblemsPageSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Tabs Area */}
        <div className="flex bg-zinc-900/50 rounded-2xl p-2 border border-zinc-800">
           <button 
             onClick={() => setActiveTab('mcq')}
             className={cn(
               "flex-1 py-4 text-center font-bold text-lg rounded-xl transition-all duration-300",
               activeTab === 'mcq' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
             )}
           >
             MCQ
           </button>
           <button 
             onClick={() => setActiveTab('programming')}
             className={cn(
               "flex-1 py-4 text-center font-bold text-lg rounded-xl transition-all duration-300",
               activeTab === 'programming' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
             )}
           >
             Programming Questions
           </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search languages"
            className="pl-12 h-14 bg-zinc-900/60 border-zinc-800 text-zinc-100 rounded-2xl focus:ring-zinc-600 focus:border-zinc-600 transition-all text-lg"
          />
        </div>

        {/* List Layout */}
        <div className="space-y-4">
          {visibleLanguages.map((lang) => (
            <div
              key={lang.name}
                className="group flex flex-col md:flex-row items-center justify-between p-6 bg-zinc-900/45 border border-zinc-800/70 rounded-2xl hover:bg-zinc-900/70 hover:border-zinc-700 transition-all gap-4"
            >
              <div className="flex items-center gap-4 w-full md:w-1/3">
                  <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-zinc-900/90 flex items-center justify-center border border-zinc-700">
                    <Code2 className="h-5 w-5 text-zinc-400 transition-colors" />
                 </div>
                 <h3 className="text-xl font-bold text-white capitalize">{lang.name}</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-2/3 md:justify-end">
                <Select 
                  value={selectedDifficulties[lang.name] || "all"} 
                  onValueChange={(val) => handleDifficultyChange(lang.name, val)}
                >
                  <SelectTrigger className="w-full sm:w-48 bg-zinc-950 border-zinc-800 text-zinc-100 rounded-xl h-12">
                    <SelectValue placeholder="Select Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                    <SelectItem value="all">All (Shuffled)</SelectItem>
                    {/* Optionally, you could dynamically list difficulties based on lang.difficulties */}
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                   onClick={() => handleEnterClick(lang.name)}
                   className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-zinc-900 h-12 px-8 rounded-xl font-bold transition-all hover:scale-105"
                >
                   Enter
                </Button>
              </div>
            </div>
          ))}

          {visibleLanguages.length === 0 && (
             <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
               <p className="text-zinc-500 text-lg">No languages found.</p>
             </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center pt-8 gap-4">
             <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors rounded-xl h-10 w-10 p-0"
             >
                <ChevronLeft className="h-5 w-5" />
             </Button>
             
             <span className="text-zinc-400 font-medium">
               {page} <span className="mx-1">..</span> <span className="text-white cursor-pointer hover:text-emerald-400 transition-colors" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>next page &gt;</span>
             </span>
             
             <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
                className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors rounded-xl h-10 w-10 p-0"
             >
                <ChevronRight className="h-5 w-5" />
             </Button>
          </div>
        )}

      </div>
    </MainLayout>
  );
}