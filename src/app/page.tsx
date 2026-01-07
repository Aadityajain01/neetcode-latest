'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Code2, 
  Trophy, 
  Users, 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  Terminal, 
  Cpu, 
  Zap,
  Play,
  GitBranch
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (initialized && isAuthenticated) {
      router.push('/dashboard');
    }
    
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [initialized, isAuthenticated]);

  if (!initialized) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/30">
      
      {/* 1. NAVBAR - Floating Glass */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-[#020617]/80 backdrop-blur-xl border-slate-800 py-3' : 'bg-transparent border-transparent py-6'
      }`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-xl">
            <div className="bg-emerald-500 rounded p-1"><Code2 className="h-5 w-5 text-[#020617]" /></div>
            NeetCode
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
              <Link href="#features" className="hover:text-emerald-400 transition-colors">Features</Link>
              <Link href="#roadmap" className="hover:text-emerald-400 transition-colors">Roadmap</Link>
              <Link href="#community" className="hover:text-emerald-400 transition-colors">Community</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION - The "Hook" */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            New: System Design Course Available
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight mb-8 max-w-4xl mx-auto">
            Stop grinding blindly. <br />
            Start <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">interviewing.</span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            The most structured platform to master Data Structures & Algorithms. 
            We don't just give you 2,000 problems; we give you the <span className="text-white font-semibold">right 150</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/register">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white h-12 px-8 text-base shadow-[0_0_30px_-10px_rgba(16,185,129,0.5)]">
                Start Your Journey <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800 hover:text-white h-12 px-8 text-base backdrop-blur-sm">
                <Play className="mr-2 h-4 w-4 fill-current" /> View Demo
              </Button>
            </Link>
          </div>

          {/* Social Proof Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto border-t border-slate-800 pt-8">
            {[
              { label: 'Users Placed', value: '10,000+' },
              { label: 'Problems Solved', value: '2.5M+' },
              { label: 'Completion Rate', value: '94%' },
              { label: 'Offer Rate', value: '~15%' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE PROBLEM vs SOLUTION - The "Why" */}
      <section className="py-24 bg-slate-950">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Why another coding platform?</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Because LeetCode is a library, not a roadmap. You need a guide, not just a list.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* The "Old Way" Card */}
            <div className="bg-[#0f111a] p-8 rounded-2xl border border-red-900/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 bg-red-500/10 rounded-bl-2xl text-red-500 font-mono text-sm border-l border-b border-red-500/20">THE OLD WAY</div>
              <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-2">
                <div className="p-2 bg-red-500/10 rounded-lg"><Target className="h-5 w-5 text-red-500" /></div>
                The "Random" Method
              </h3>
              <ul className="space-y-4 text-slate-400">
                <li className="flex gap-3"><span className="text-red-500">✕</span> Solving random easy questions</li>
                <li className="flex gap-3"><span className="text-red-500">✕</span> No clear progression path</li>
                <li className="flex gap-3"><span className="text-red-500">✕</span> Burning out after 2 weeks</li>
                <li className="flex gap-3"><span className="text-red-500">✕</span> Forgetting patterns immediately</li>
              </ul>
            </div>

            {/* The "NeetCode Way" Card */}
            <div className="bg-[#0f111a] p-8 rounded-2xl border border-emerald-500/20 relative overflow-hidden shadow-[0_0_50px_-20px_rgba(16,185,129,0.1)]">
              <div className="absolute top-0 right-0 p-4 bg-emerald-500/10 rounded-bl-2xl text-emerald-500 font-mono text-sm border-l border-b border-emerald-500/20">THE NEETCODE WAY</div>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg"><Zap className="h-5 w-5 text-emerald-500" /></div>
                Structured Excellence
              </h3>
              <ul className="space-y-4 text-slate-300">
                <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Curated "NeetCode 150" Roadmap</li>
                <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Pattern-based learning (Two Pointers, DP...)</li>
                <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Integrated Code Editor & Visualizer</li>
                <li className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" /> Active Community Leaderboards</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES BENTO GRID */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-6">
           <div className="mb-16">
             <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Everything you need to <br /><span className="text-emerald-500">Crack the Coding Interview.</span></h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Large IDE Preview */}
              <div className="md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 overflow-hidden relative group">
                 <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                 <h3 className="text-2xl font-bold text-white mb-2">Browser-Based IDE</h3>
                 <p className="text-slate-400 mb-8 max-w-md">No setup required. Practice in Python, Java, C++, or JS directly in your browser with our high-performance editor.</p>
                 
                 {/* Mock Code Editor Visual */}
                 <div className="bg-[#020617] rounded-lg border border-slate-800 p-4 font-mono text-sm shadow-2xl transform group-hover:scale-[1.01] transition-transform duration-500">
                    <div className="flex gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="text-slate-400">
                      <span className="text-purple-400">def</span> <span className="text-yellow-400">twoSum</span>(nums, target):<br/>
                      &nbsp;&nbsp;seen = {}<br/>
                      &nbsp;&nbsp;<span className="text-purple-400">for</span> i, n <span className="text-purple-400">in</span> <span className="text-blue-400">enumerate</span>(nums):<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;diff = target - n<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">if</span> diff <span className="text-purple-400">in</span> seen:<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> [seen[diff], i]<br/>
                      &nbsp;&nbsp;&nbsp;&nbsp;seen[n] = i
                    </div>
                 </div>
              </div>

              {/* Feature 2: Roadmap */}
              <div className="md:col-span-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 relative group hover:border-emerald-500/30 transition-colors">
                <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 text-emerald-500">
                  <GitBranch className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Visual Roadmaps</h3>
                <p className="text-slate-400 text-sm">Follow our proven "Tree" structure. Start at Arrays & Hashing, unlock Advanced Graphs only when you're ready.</p>
              </div>

              {/* Feature 3: Analytics */}
              <div className="md:col-span-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 relative group hover:border-emerald-500/30 transition-colors">
                 <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 text-blue-500">
                  <Trophy className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Compete & Track</h3>
                <p className="text-slate-400 text-sm">Global leaderboards, daily streaks, and detailed submission analytics to keep you accountable.</p>
              </div>

              {/* Feature 4: Community */}
              <div className="md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 relative overflow-hidden group">
                 <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">A Community of Winners</h3>
                      <p className="text-slate-400 mb-6">Join thousands of developers in our Discord and discussion forums. Debug code together, share interview experiences, and network.</p>
                      <div className="flex -space-x-4">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs text-white">
                            User
                          </div>
                        ))}
                        <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-emerald-600 flex items-center justify-center text-xs text-white font-bold">
                          +5k
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-1/3 bg-[#020617] border border-slate-800 rounded-xl p-4 shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                        <div className="flex items-center gap-3 mb-3 border-b border-slate-800 pb-2">
                           <div className="w-8 h-8 rounded-full bg-emerald-500/20" />
                           <div>
                             <div className="text-xs font-bold text-white">Alex Dev</div>
                             <div className="text-[10px] text-emerald-400">Offer Accepted @ Google</div>
                           </div>
                        </div>
                        <p className="text-xs text-slate-400 italic">"The graph section literally saved my interview. I recognized the pattern immediately!"</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="py-24 border-t border-slate-800 bg-[#020617] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Your dream job is <br />
            <span className="text-emerald-500">one algorithm away.</span>
          </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Join the platform that has helped over 100,000 engineers land roles at Google, Meta, Amazon, and Netflix.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-14 px-10 text-lg bg-white text-slate-950 hover:bg-slate-200 font-bold">
              Join NeetCode for Free
            </Button>
          </Link>
          <p className="mt-6 text-sm text-slate-500">No credit card required • Unlimited practice</p>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="py-12 border-t border-slate-800 bg-[#020617] text-slate-400 text-sm">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
           <div>
             <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
               <div className="bg-emerald-500 rounded p-0.5"><Code2 className="h-4 w-4 text-[#020617]" /></div>
               NeetCode
             </div>
             <p className="mb-4">Mastering the coding interview, one problem at a time.</p>
           </div>
           <div>
             <h4 className="font-bold text-white mb-4">Platform</h4>
             <ul className="space-y-2">
               <li><Link href="#" className="hover:text-emerald-400">Roadmap</Link></li>
               <li><Link href="#" className="hover:text-emerald-400">Problems</Link></li>
               <li><Link href="#" className="hover:text-emerald-400">Leaderboard</Link></li>
             </ul>
           </div>
           <div>
             <h4 className="font-bold text-white mb-4">Resources</h4>
             <ul className="space-y-2">
               <li><Link href="#" className="hover:text-emerald-400">System Design</Link></li>
               <li><Link href="#" className="hover:text-emerald-400">Cheat Sheets</Link></li>
               <li><Link href="#" className="hover:text-emerald-400">Blog</Link></li>
             </ul>
           </div>
           <div>
             <h4 className="font-bold text-white mb-4">Legal</h4>
             <ul className="space-y-2">
               <li><Link href="#" className="hover:text-emerald-400">Privacy</Link></li>
               <li><Link href="#" className="hover:text-emerald-400">Terms</Link></li>
             </ul>
           </div>
        </div>
        <div className="container mx-auto px-6 pt-8 border-t border-slate-900 text-center text-slate-600">
           &copy; {new Date().getFullYear()} NeetCode. Built by Developers, for Developers.
        </div>
      </footer>
    </div>
  );
}