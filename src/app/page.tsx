'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Code2, Trophy, Users, ArrowRight, BarChart3, 
  Terminal, Zap, Target, Activity, CheckCircle2,
  Menu, X, GitBranch, ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import logo from "../../public/logo.png";
import { AppRouteSkeleton } from '@/components/skeletons/site-skeletons';

// ─── INTERNAL COMPONENTS ───────────────────────────────────────────────────────

const FeatureBento = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={cn("bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-3xl p-8 relative overflow-hidden group", className)}>
    {children}
  </div>
);

// ─── MAIN LANDING PAGE ────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (initialized && isAuthenticated) {
      router.push('/dashboard');
    }
    
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initialized, isAuthenticated, router]);

  if (!initialized) return <AppRouteSkeleton />;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-emerald-500/30 font-sans overflow-y-scroll scrollbar-emerald">
      
      {/* ── NAVBAR ────────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-zinc-950/90 backdrop-blur-xl border-zinc-800 py-3' : 'bg-transparent border-transparent py-6'
      }`}>
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          
          <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className="rounded-lg p-1.5 shadow-lg inverted">
              <Image src={logo} width={40} height={40} alt="NeetCode Logo" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">NeetCode</span>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-8 text-[13px] font-bold tracking-wider uppercase text-zinc-500">
              <Link href="#features" className="hover:text-emerald-400 transition-colors">Platform</Link>
              <Link href="#community" className="hover:text-emerald-400 transition-colors">Communities</Link>
            </div>
            <div className="h-4 w-px bg-zinc-800"></div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-zinc-400 hover:text-white uppercase tracking-widest text-[11px] font-bold">Log In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest uppercase text-[11px] rounded-xl px-6 transition-all hover:scale-105">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          <button className="lg:hidden text-zinc-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-2">
            <Link href="#features" className="text-zinc-300 py-2 border-b border-zinc-900 text-xs font-bold uppercase tracking-widest" onClick={() => setMobileMenuOpen(false)}>Platform</Link>
            <Link href="#community" className="text-zinc-300 py-2 border-b border-zinc-900 text-xs font-bold uppercase tracking-widest" onClick={() => setMobileMenuOpen(false)}>Communities</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full border-zinc-800 text-xs font-bold uppercase tracking-widest">Log In</Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-emerald-600 text-xs font-bold uppercase tracking-widest">Get Started</Button>
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO SECTION ───────────────────────────────────────────────────── */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 ">
        {/* Authentic Premium Radial Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-5xl">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800/50 text-emerald-400 text-[10px] uppercase tracking-widest font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            The DSA Core Engine
          </div>

          <h1 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-[1.05] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Master Algorithms.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
              Own the Leaderboard.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            A comprehensive tracking platform for Data Structures and Algorithms. Practice DSA, solve dynamic MCQs, join private verified communities, and climb the live global and local leaderboards.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-sm uppercase tracking-widest bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] rounded-xl transition-all hover:-translate-y-1">
                Start Practicing <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/problems">
              <Button size="lg" variant="outline" className="h-14 px-8 text-sm uppercase tracking-widest border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white backdrop-blur-sm rounded-xl transition-all hover:-translate-y-1">
                View Problems
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── PLATFORM CAPABILITIES (Bento Grid) ─────────────────────────────────── */}
      <section id="features" className="py-24 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          
          <div className="text-center mb-16">
             <h2 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3">Core Engine</h2>
             <h3 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Everything you need to clear the interview.</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
             
             {/* 1. Roadmap & Problems (Large Left) */}
             <FeatureBento className="md:col-span-8 md:row-span-2">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400"><Code2 className="w-6 h-6" /></div>
                 <div>
                   <h3 className="text-xl font-bold text-white">Curated Problem Set</h3>
                   <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Structured DSA Practice</p>
                 </div>
               </div>
               <p className="text-zinc-400 leading-relaxed mb-8 max-w-md">
                 Follow the definitive roadmap. Track your progress through Arrays, Two Pointers, Dynamic Programming, and Graphs. Mark problems as solved, save notes, and never lose track of your prep.
               </p>
               <div className="flex gap-4">
                  <div className="flex-1 bg-zinc-950 border border-zinc-800 p-4 rounded-2xl">
                     <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Arrays & Hashing</div>
                     <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-2"><div className="w-full h-full bg-emerald-500 rounded-full"></div></div>
                     <div className="text-xs text-zinc-300 mt-2 font-mono flex items-center justify-between"><span>Completed</span> <CheckCircle2 className="w-3 h-3 text-emerald-500" /></div>
                  </div>
                  <div className="flex-1 bg-zinc-950 border border-zinc-800 p-4 rounded-2xl opacity-70">
                     <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Two Pointers</div>
                     <div className="w-full h-1.5 bg-zinc-800 rounded-full mb-2"><div className="w-[45%] h-full bg-amber-500 rounded-full"></div></div>
                     <div className="text-xs text-zinc-300 mt-2 font-mono flex items-center justify-between"><span>In Progress</span> <Activity className="w-3 h-3 text-amber-500" /></div>
                  </div>
               </div>
             </FeatureBento>

             {/* 2. MCQ Practice Engine (Small Right Top) */}
             <FeatureBento className="md:col-span-4">
               <div className="flex items-center justify-between mb-4">
                 <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400"><Zap className="w-5 h-5" /></div>
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest border border-zinc-800 px-2 py-1 rounded-md">Smart Queue</span>
               </div>
               <h3 className="text-lg font-bold text-white mb-2">Dynamic MCQ Batches</h3>
               <p className="text-sm text-zinc-400 leading-relaxed">
                 Test your core knowledge with rapid-fire MCQs. Our engine prioritizes unsolved questions first, ensuring you never waste time repeating known concepts.
               </p>
             </FeatureBento>

             {/* 3. Deep Analytics (Small Right Bottom) */}
             <FeatureBento className="md:col-span-4">
               <div className="flex items-center justify-between mb-4">
                 <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400"><BarChart3 className="w-5 h-5" /></div>
               </div>
               <h3 className="text-lg font-bold text-white mb-2">Proficiency Analytics</h3>
               <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                 Visualize your strengths in real-time with Recharts-powered Radar and Burst charts tracking Easy, Medium, and Hard proficiencies.
               </p>
               {/* Mini representation of the radar chart concept */}
               <div className="h-16 w-full flex items-end justify-between px-2 opacity-50">
                  <div className="w-3 h-10 bg-emerald-500 rounded-t-sm" />
                  <div className="w-3 h-14 bg-emerald-400 rounded-t-sm" />
                  <div className="w-3 h-8 bg-amber-500 rounded-t-sm" />
                  <div className="w-3 h-16 bg-purple-500 rounded-t-sm" />
                  <div className="w-3 h-6 bg-red-400 rounded-t-sm" />
                  <div className="w-3 h-12 bg-blue-500 rounded-t-sm" />
               </div>
             </FeatureBento>

             {/* 4. Global & Community Leaderboards (Full Width Bottom) */}
             <FeatureBento className="md:col-span-12">
               <div className="grid md:grid-cols-2 gap-12 items-center">
                 <div>
                   <div className="inline-flex items-center gap-2 text-[10px] font-bold text-yellow-500 border border-yellow-500/20 bg-yellow-500/10 px-3 py-1 rounded-full uppercase tracking-widest mb-6">
                     <Trophy className="w-3 h-3" /> Live Rankings
                   </div>
                   <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight mb-4">Compete Globally.<br />Dominate Locally.</h3>
                   <p className="text-zinc-400 leading-relaxed max-w-md">
                     Every problem solved and test completed earns you points. Climb the Glassmorphic Global Podium, or filter rankings specifically to your private Study Communities to see who the real top engineer in your batch is.
                   </p>
                 </div>
                 
                 {/* Visual Mockup of the Podium */}
                 <div className="flex items-end justify-center gap-2 sm:gap-4 h-48 mt-8 md:mt-0">
                    <div className="w-20 sm:w-24 bg-zinc-800/50 border border-zinc-700/50 p-2 rounded-t-xl flex flex-col items-center justify-end h-[60%] relative group">
                       <div className="w-8 h-8 rounded-full bg-zinc-700 absolute -top-4 border-2 border-zinc-900" />
                       <div className="text-2xl font-black text-zinc-500 opacity-50">2</div>
                    </div>
                    <div className="w-24 sm:w-28 bg-gradient-to-t from-emerald-600/40 to-emerald-500/10 border border-emerald-500/30 p-2 rounded-t-xl flex flex-col items-center justify-end h-[90%] relative shadow-[0_-10px_30px_rgba(16,185,129,0.15)]">
                       <div className="w-10 h-10 rounded-full bg-emerald-500 absolute -top-5 border-2 border-zinc-900 shadow-lg text-white font-bold flex items-center justify-center text-xs">A</div>
                       <Trophy className="w-4 h-4 text-emerald-400 absolute top-6" />
                       <div className="text-4xl font-black text-emerald-500 opacity-80 mt-auto">1</div>
                    </div>
                    <div className="w-20 sm:w-24 bg-zinc-800/50 border border-zinc-700/50 p-2 rounded-t-xl flex flex-col items-center justify-end h-[45%] relative">
                       <div className="w-8 h-8 rounded-full bg-zinc-700 absolute -top-4 border-2 border-zinc-900" />
                       <div className="text-2xl font-black text-zinc-500 opacity-50">3</div>
                    </div>
                 </div>
               </div>
             </FeatureBento>

          </div>
        </div>
      </section>

      {/* ── COMMUNITIES FEATURE ──────────────────────────────────────────────── */}
      <section id="community" className="py-24 relative overflow-hidden bg-zinc-950 border-t border-zinc-900">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
        
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold text-blue-500 border border-blue-500/20 bg-blue-500/10 px-3 py-1 rounded-full uppercase tracking-widest">
                <Users className="w-3 h-3" /> Private Networks
              </div>
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tighter">
                Isolate the noise.<br />Focus on your squad.
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Join or create Private Communities. Chat with peers in WhatsApp-style live feeds, assign custom tests to your members, and track real-time analytics for your specific study group.
              </p>
              
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-4 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50">
                  <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Terminal className="w-4 h-4" /></div>
                  <div className="text-sm text-zinc-300 font-bold tracking-wide">Custom Automated Tests</div>
                </li>
                <li className="flex items-center gap-4 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Menu className="w-4 h-4" /></div>
                  <div className="text-sm text-zinc-300 font-bold tracking-wide">Real-time Group Chat Hubs</div>
                </li>
                <li className="flex items-center gap-4 bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/50">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><Target className="w-4 h-4" /></div>
                  <div className="text-sm text-zinc-300 font-bold tracking-wide">Community-Isolated Leaderboards</div>
                </li>
              </ul>
            </div>

            <div className="flex-1 w-full bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md rotate-2 hover:rotate-0 transition-transform duration-500">
               <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white"><Users size={20} /></div>
                  <div>
                    <h4 className="text-white font-bold tracking-wide">Hackathon Prep Group</h4>
                    <p className="text-xs text-zinc-500 font-mono">14 Members • 3 Active Tests</p>
                  </div>
               </div>
               <div className="space-y-3">
                  <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Test</span>
                       <span className="text-xs text-zinc-500 font-mono">Ends in 2h</span>
                    </div>
                    <div className="text-sm text-zinc-300 font-semibold">Graph Theory Speedrun</div>
                  </div>
                  <div className="flex items-end gap-2 mt-6">
                     <div className="w-6 h-6 rounded-full bg-blue-500 shrinks-0" />
                     <div className="bg-blue-600/20 border border-blue-500/30 text-blue-100 text-xs py-2 px-3 rounded-2xl rounded-bl-sm">
                       Just assigned the tree traversal practice!
                     </div>
                  </div>
                   <div className="flex items-end gap-2 justify-end mt-2">
                     <div className="bg-zinc-800 text-zinc-300 text-xs py-2 px-3 rounded-2xl rounded-br-sm">
                       On it. Need those points 🏆
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA SECTION ──────────────────────────────────────────────────────── */}
      <section className="py-32 border-t border-zinc-900 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950 to-zinc-950 pointer-events-none" />
        
        <div className="container mx-auto px-6 text-center relative z-10 max-w-3xl">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-8 text-emerald-500">
            <Code2 size={32} />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter">
            Stop grinding in the dark.
          </h2>
          <p className="text-lg text-zinc-400 mb-10 leading-relaxed">
            Create your account today. Access the curated roadmap, join communities, track your rigorous analytics, and start climbing the ranks.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-sm uppercase tracking-widest bg-white text-zinc-950 hover:bg-zinc-200 font-bold rounded-xl shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="py-12 border-t border-zinc-900 bg-zinc-950 text-zinc-500 text-sm">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
             <Image src={logo} width={24} height={24} alt="Logo" className="inverted" /> NeetCode
          </div>
          <div className="flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest">
            <Link href="/problems" className="hover:text-white transition-colors">Problems</Link>
            <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
            <Link href="/communities" className="hover:text-white transition-colors">Communities</Link>
          </div>
          <div className="text-[11px] tracking-widest uppercase">
            &copy; {new Date().getFullYear()} NeetCode
          </div>
        </div>
      </footer>

    </div>
  );
}