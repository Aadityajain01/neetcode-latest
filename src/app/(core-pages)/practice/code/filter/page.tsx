"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layouts/main-layout";
import { problemApi, Problem } from "@/lib/api-modules";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Filter, Code2, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BackButton } from "@/components/BackButton"; // Import

function ProblemListContent() {
  const params = useSearchParams();
  const router = useRouter();
  const lang = params.get("lang");
  const [loading, setLoading] = useState(true);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");

  useEffect(() => {
    if (lang) fetchProblems();
  }, [lang]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const data = await problemApi.getProblems({ type: "practice", search: search || undefined, difficulty: difficulty !== "all" ? difficulty : undefined, limit: 100 });
      const filtered = (data.problems || []).filter((p: Problem) => p.languages?.some((l) => l.toLowerCase() === lang?.toLowerCase()));
      setProblems(filtered);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 🔹 ADDED BACK BUTTON */}
      <BackButton href={`/practice/module?lang=${lang}`} label="Back to Modules" />

      {/* Header Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{lang?.toUpperCase()} Problems</h1>
          <p className="text-zinc-400 text-sm">Select a challenge to solve.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchProblems()}
              placeholder="Search..."
              className="pl-9 bg-zinc-950 border-zinc-700 text-zinc-100 focus:ring-emerald-500/50"
            />
          </div>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-32 bg-zinc-950 border-zinc-700 text-zinc-100">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchProblems} className="bg-emerald-500 hover:bg-emerald-600 text-white"><Filter className="h-4 w-4" /></Button>
        </div>
      </div>

      {/* List (Unchanged logic, just truncated for brevity) */}
      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div> : 
       problems.length === 0 ? <div className="text-center text-zinc-500 py-20">No problems found.</div> : (
        <div className="grid grid-cols-1 gap-3">
          {problems.map((problem) => (
            <div
              key={problem._id}
              onClick={() => router.push(`/practice/${problem._id}`)}
              className="group flex items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-900 hover:border-emerald-500/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center border",
                  problem.difficulty === 'easy' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                  problem.difficulty === 'medium' ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" :
                  "bg-red-500/10 border-red-500/20 text-red-500"
                )}>
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">{problem.title}</h3>
                  <p className="text-sm text-zinc-500 line-clamp-1 max-w-md">{problem.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                 <Badge variant="outline" className={cn("capitalize border-0 bg-opacity-10",
                    problem.difficulty === 'easy' ? "bg-emerald-500 text-emerald-500" :
                    problem.difficulty === 'medium' ? "bg-yellow-500 text-yellow-500" :
                    "bg-red-500 text-red-500"
                 )}>{problem.difficulty}</Badge>
                 <ArrowRight className="h-5 w-5 text-zinc-600 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PracticeProblemSelectPage() {
  return (
    <MainLayout>
      <Suspense fallback={<div className="h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>}>
        <ProblemListContent />
      </Suspense>
    </MainLayout>
  );
}