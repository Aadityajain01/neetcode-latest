"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layouts/main-layout";
import { mcqApi, MCQ } from "@/lib/api-modules";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Code2, Terminal, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type LanguageMeta = {
  name: string;
  difficulties: Set<string>;
  tags: Set<string>;
};

export default function PracticeLanguagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [languages, setLanguages] = useState<LanguageMeta[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const data = await mcqApi.getMCQs({ limit: 1000 });
      const map = new Map<string, LanguageMeta>();

      (data.mcqs || []).forEach((mcq: MCQ) => {
        const lang = mcq.language.toLowerCase();
        if (!map.has(lang)) {
          map.set(lang, { name: lang, difficulties: new Set(), tags: new Set() });
        }
        map.get(lang)!.difficulties.add(mcq.difficulty);
        mcq.tags?.forEach((t) => map.get(lang)!.tags.add(t));
      });
      setLanguages(Array.from(map.values()));
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

  if (loading) return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-500" /></div>;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 p-8 md:p-12">
           <div className="absolute top-0 right-0 p-12 opacity-10"><Code2 className="w-64 h-64 text-emerald-500" /></div>
           <div className="relative z-10 max-w-2xl">
             <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Choose Your <span className="text-emerald-500">Weapon</span></h1>
             <p className="text-zinc-400 text-lg mb-8">Select a programming language to practice syntax, solve algorithms, and master interview questions.</p>
             
             <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search languages (e.g. Python, Java)..."
                  className="pl-12 h-14 bg-zinc-950/50 border-zinc-700 text-zinc-100 rounded-xl focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-lg"
                />
             </div>
           </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredLanguages.map((lang) => (
            <div
              key={lang.name}
              onClick={() => router.push(`/practice/module?lang=${lang.name}`)}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-emerald-500/50 hover:bg-zinc-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.3)]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-zinc-700 group-hover:border-emerald-500/30 group-hover:from-emerald-950/30 group-hover:to-emerald-900/10">
                   <Terminal className="h-6 w-6 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
                </div>
                {/* Random decorative badge if it has tags */}
                {lang.tags.size > 0 && <Sparkles className="h-4 w-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </div>
              
              <h3 className="text-xl font-bold text-white capitalize mb-2">{lang.name}</h3>
              <p className="text-sm text-zinc-500 mb-4">{lang.difficulties.size} Difficulty Levels Available</p>
              
              <div className="flex flex-wrap gap-2">
                {Array.from(lang.difficulties).slice(0, 3).map(d => (
                  <Badge key={d} variant="secondary" className="bg-zinc-950 border-zinc-800 text-zinc-400 text-[10px] uppercase tracking-wider">
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}