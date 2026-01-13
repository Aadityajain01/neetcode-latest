"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import MainLayout from "@/components/layouts/main-layout";
import { premiumApi } from "@/lib/api-modules/premium-questions.api";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { CheckCircle2, Circle, Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Neetcode150Page() {
  const { isAuthenticated, initialized } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<any[]>([]);
  const [totalProgress, setTotalProgress] = useState({ solved: 0, total: 0 });

  useEffect(() => {
    if (!initialized) return;
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const data = await premiumApi.getRoadmap();
        setRoadmap(data);

        // Calculate global stats
        let solved = 0;
        let total = 0;
        data.forEach((cat: any) => {
          solved += cat.solvedCount;
          total += cat.total;
        });
        setTotalProgress({ solved, total });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load roadmap.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialized, isAuthenticated, router]);

  if (loading || !initialized) {
    return (
      <MainLayout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-zinc-950 p-6 md:p-12 font-sans text-zinc-200">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-zinc-800 pb-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                  NeetCode 150
                </span>
              </h1>
              <p className="text-zinc-400 text-lg max-w-2xl">
                The ultimate structured path to crack coding interviews.
              </p>
            </div>

            {/* Total Progress Card */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center gap-6 shadow-xl">
              <div className="p-3 bg-emerald-500/10 rounded-full">
                <Trophy className="w-8 h-8 text-emerald-500" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">
                  {totalProgress.solved} <span className="text-zinc-500 text-lg">/ {totalProgress.total}</span>
                </div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Problems Solved</div>
              </div>
            </div>
          </div>

          {/* ROADMAP ACCORDION */}
          <div className="space-y-4">
            <Accordion type="multiple" className="w-full space-y-4">
              {roadmap.map((category, idx) => (
                <AccordionItem 
                  key={idx} 
                  value={`item-${idx}`} 
                  className="border border-zinc-800 bg-zinc-900/30 rounded-xl overflow-hidden px-2 data-[state=open]:bg-zinc-900/50 transition-all"
                >
                  <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-zinc-900/50 rounded-xl group">
                    <div className="flex items-center justify-between w-full pr-4">
                      
                      {/* Category Title */}
                      <span className="text-xl font-bold text-zinc-200 group-hover:text-white transition-colors">
                        {category.title}
                      </span>

                      {/* Right Side: Progress Bar */}
                      <div className="flex items-center gap-4 min-w-[150px]">
                        {/* Custom Progress Bar */}
                        <div className="h-2 w-32 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-500" 
                            style={{ width: `${(category.solvedCount / category.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-mono text-zinc-500 whitespace-nowrap w-12 text-right">
                          {category.solvedCount} / {category.total}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="px-6 pb-6 pt-2">
                    <div className="grid gap-2">
                      {category.problems.map((prob: any) => (
                        <Link 
                          key={prob._id} 
                          href={`/practice/${prob.id}`} // Or /premium/${prob.id}
                          className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800 transition-colors group/item border border-transparent hover:border-zinc-700"
                        >
                          <div className="flex items-center gap-4">
                            {/* Status Icon */}
                            {prob.isSolved ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-zinc-700 group-hover/item:text-zinc-500 transition-colors shrink-0" />
                            )}
                            <span className={cn("text-base font-medium", prob.isSolved ? "text-zinc-400" : "text-zinc-200 group-hover/item:text-white")}>
                              {prob.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-4">
                            <span className={cn(
                              "text-xs font-bold px-2 py-1 rounded border",
                              prob.difficulty === 'Easy' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                              prob.difficulty === 'Medium' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                              "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                              {prob.difficulty}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}