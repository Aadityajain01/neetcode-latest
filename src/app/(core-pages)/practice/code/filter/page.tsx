"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layouts/main-layout";
import { problemApi, Problem } from "@/lib/api-modules";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Code2, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/BackButton";

const ITEMS_PER_PAGE = 8; // ✅ Exact limit requested

function ProblemListContent() {
  const params = useSearchParams();
  const router = useRouter();
  const lang = params.get("lang");
  
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  
  // "allProblems" stores the full filtered list (Language + Search + Difficulty)
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  // "visibleProblems" stores only the 8 items for the current page
  const [visibleProblems, setVisibleProblems] = useState<Problem[]>([]);
  
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- INITIAL LOAD ---
  useEffect(() => {
    if (lang) {
        fetchAllAndFilter();
    }
  }, [lang, difficulty]); // Re-fetch only when major filters change

  // --- RE-CALCULATE ON SEARCH/PAGE CHANGE ---
  useEffect(() => {
    applyClientSideFilters();
  }, [search, page, allProblems]);

  // --- 1. FETCH ALL RELEVANT DATA ---
  const fetchAllAndFilter = async () => {
    setLoading(true);
    try {
      // Fetch a large batch (e.g., 500) to handle pagination on the client side
      // This ensures "Language Filtering" doesn't break the page size
      const data = await problemApi.getProblems({ 
          type: "practice", 
          difficulty: difficulty !== "all" ? difficulty : undefined, 
          limit: 500 // Fetching all to filter locally
      });

      // Filter by Language immediately
      let filtered = (data.problems || []);
      if (lang) {
          filtered = filtered.filter((p: Problem) => 
            p.languages?.some((l) => l.toLowerCase() === lang?.toLowerCase())
          );
      }

      setAllProblems(filtered);
      setPage(1); // Reset to page 1 on new fetch
    } catch (err) { 
        console.error(err); 
    } finally { 
        setLoading(false); 
    }
  };

  // --- 2. APPLY SEARCH & PAGINATION LOCALLY ---
  const applyClientSideFilters = () => {
    let result = allProblems;

    // Apply Search
    if (search.trim()) {
        const query = search.toLowerCase();
        result = result.filter(p => p.title.toLowerCase().includes(query));
    }

    // Calculate Total Pages
    const total = Math.ceil(result.length / ITEMS_PER_PAGE);
    setTotalPages(total > 0 ? total : 1);

    // Apply Pagination (Slice the array)
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const sliced = result.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    setVisibleProblems(sliced);
  };

  const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= totalPages) {
          setPage(newPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <BackButton href={`/practice/module?lang=${lang}`} label="Back to Modules" />

      {/* Header Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
            <span className="capitalize text-emerald-500">{lang}</span> Problems
          </h1>
          <p className="text-zinc-400 text-sm">Select a challenge to refine your skills.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} // Reset page on search
              placeholder="Search problems..."
              className="pl-9 bg-zinc-950 border-zinc-800 text-zinc-100 focus:ring-emerald-500/20 focus:border-emerald-500/50 rounded-lg"
            />
          </div>
          <Select value={difficulty} onValueChange={(val) => { setDifficulty(val); setPage(1); }}>
            <SelectTrigger className="w-32 bg-zinc-950 border-zinc-800 text-zinc-100 rounded-lg">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Problem List */}
      {loading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : visibleProblems.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
            <Code2 className="h-10 w-10 text-zinc-600 mx-auto mb-3 opacity-50" />
            <p className="text-zinc-500">No problems found.</p>
            <Button variant="link" onClick={() => {setSearch(""); setDifficulty("all");}} className="text-emerald-500">Clear filters</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {visibleProblems.map((problem) => (
              <div
                key={problem._id}
                onClick={() => router.push(`/practice/${problem._id}`)}
                className="group flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-900 hover:border-zinc-700 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center bg-zinc-950 border border-zinc-800 group-hover:border-emerald-500/30 transition-colors")}>
                    <Code2 className="h-5 w-5 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-200 group-hover:text-white transition-colors">{problem.title}</h3>
                    <div className="flex gap-2 mt-1">
                        {problem.tags && problem.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">{tag}</span>
                        ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                   <Badge variant="outline" className={cn("capitalize border px-3 py-1 font-medium",
                      problem.difficulty === 'easy' ? "bg-emerald-950/30 text-emerald-400 border-emerald-900/50" :
                      problem.difficulty === 'medium' ? "bg-yellow-950/30 text-yellow-400 border-yellow-900/50" :
                      "bg-red-950/30 text-red-400 border-red-900/50"
                   )}>
                      {problem.difficulty}
                   </Badge>
                   <ArrowRight className="h-5 w-5 text-zinc-700 group-hover:text-zinc-300 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>

          {/* ✅ PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-zinc-800 animate-in fade-in">
                <p className="text-sm text-zinc-500">
                    Page <span className="text-white font-medium">{page}</span> of <span className="text-white font-medium">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePageChange(page - 1)} 
                        disabled={page === 1}
                        className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handlePageChange(page + 1)} 
                        disabled={page === totalPages}
                        className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-300 transition-colors"
                    >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PracticeProblemSelectPage() {
  return (
    <MainLayout>
      <div className="min-h-screen p-6 md:p-12">
        <Suspense fallback={<div className="h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>}>
            <ProblemListContent />
        </Suspense>
      </div>
    </MainLayout>
  );
}