'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Code2, Trophy, Users, School, ArrowRight, BarChart3, ShieldCheck, 
  GraduationCap, Globe, Terminal, Zap, Lock, ChevronDown, CheckCircle2,
  Play, GitBranch, Cpu, MessageSquare, Star, Laptop, Search, Menu, X,
  Twitter,
  Github
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import logo from "../../public/logo.png";
// --- INTERNAL COMPONENTS FOR "MEGA PAGE" STRUCTURE ---

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: number }) => (
  <div 
    className="bg-zinc-950 p-8 rounded-2xl border border-zinc-800 hover:border-emerald-500/30 transition-all duration-300 group hover:-translate-y-1"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 text-emerald-500 group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all">
      <Icon className="h-7 w-7" />
    </div>
    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors">{title}</h3>
    <p className="text-zinc-400 leading-relaxed text-sm">{description}</p>
  </div>
);

const StatItem = ({ value, label }: { value: string, label: string }) => (
  <div className="flex flex-col items-center justify-center p-6 bg-zinc-900/30 border border-zinc-800/50 rounded-xl hover:bg-zinc-900/50 transition-colors">
    <div className="text-3xl md:text-4xl font-black text-white mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
      {value}
    </div>
    <div className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">{label}</div>
  </div>
);

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-zinc-800">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className={cn("text-lg font-medium transition-colors", isOpen ? "text-emerald-500" : "text-zinc-200 group-hover:text-white")}>
          {question}
        </span>
        <ChevronDown className={cn("w-5 h-5 text-zinc-500 transition-transform duration-300", isOpen && "rotate-180 text-emerald-500")} />
      </button>
      <div className={cn("overflow-hidden transition-all duration-300 ease-in-out", isOpen ? "max-h-96 opacity-100 pb-6" : "max-h-0 opacity-0")}>
        <p className="text-zinc-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  );
};

const TestimonialCard = ({ quote, author, role, school }: { quote: string, author: string, role: string, school: string }) => (
  <div className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-2xl relative">
    <div className="absolute top-6 left-6 text-emerald-500/20"><MessageSquare size={40} /></div>
    <p className="text-zinc-300 relative z-10 mb-6 italic leading-relaxed">"{quote}"</p>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
        {author[0]}
      </div>
      <div>
        <div className="text-white font-bold text-sm">{author}</div>
        <div className="text-xs text-zinc-500">{role} @ <span className="text-emerald-500">{school}</span></div>
      </div>
    </div>
  </div>
);

// --- MAIN PAGE ---

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'colleges'>('students');

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
    <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-emerald-500/30 font-sans overflow-x-hidden">
      
      {/* --------------------------------------------------------------------------------
         1. NAVBAR
         -------------------------------------------------------------------------------- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
        scrolled ? 'bg-zinc-950/90 backdrop-blur-xl border-zinc-800 py-3' : 'bg-transparent border-transparent py-6'
      }`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 text-white font-bold text-xl tracking-tight cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <div className=" rounded-lg p-1.5 shadow-lg  inverted ">
              <Image src={logo} width={40} height={40} alt="NeetCode Logo" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">NeetCode</span>
          </div>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-8 text-sm font-medium text-zinc-400">
              <Link href="#problem" className="hover:text-white transition-colors">The Problem</Link>
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="#communities" className="hover:text-emerald-400 transition-colors">For Colleges</Link>
              <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            </div>
            <div className="h-6 w-px bg-zinc-800"></div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800 font-medium">Log In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="lg:hidden text-zinc-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-zinc-950 border-b border-zinc-800 p-6 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-5">
            <Link href="#features" className="text-zinc-300 py-2 border-b border-zinc-900" onClick={() => setMobileMenuOpen(false)}>Features</Link>
            <Link href="#communities" className="text-zinc-300 py-2 border-b border-zinc-900" onClick={() => setMobileMenuOpen(false)}>For Colleges</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full border-zinc-700">Log In</Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full bg-emerald-600">Get Started</Button>
            </Link>
          </div>
        )}
      </nav>

      {/* --------------------------------------------------------------------------------
         2. HERO SECTION
         -------------------------------------------------------------------------------- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

        <div className="container mx-auto px-6 relative z-10 text-center">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-400 text-xs font-medium mb-8 hover:border-emerald-500/30 transition-all cursor-default shadow-xl backdrop-blur-sm animate-fade-in-up">
            <School className="w-3.5 h-3.5 text-emerald-500" />
            <span className="w-px h-3 bg-zinc-800 mx-1"></span>
            <span>Now onboarding <span className="text-white font-semibold">50+ University Domains</span></span>
          </div>

          {/* Main Headline */}
          <h1 className="text-6xl lg:text-8xl font-black text-white tracking-tighter leading-[1.1] mb-8 max-w-6xl mx-auto">
            Don't just Code. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 animate-gradient-x">
              Compete with your Campus.
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            The only platform that ranks you against your <span className="text-white font-medium">real competition</span>. 
            Join your college community, solve the <span className="text-emerald-400 border-b border-emerald-500/30">NeetCode 150</span>, and dominate your batch's leaderboard.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-20">
            <Link href="/register">
              <Button size="lg" className="h-16 px-10 text-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] rounded-full transition-transform hover:-translate-y-1">
                Find My College <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="h-16 px-10 text-lg border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white backdrop-blur-sm rounded-full transition-transform hover:-translate-y-1">
                <Play className="mr-2 h-4 w-4 fill-current" /> View Demo
              </Button>
            </Link>
          </div>

          {/* Trusted By Strip */}
          <div className="pt-10 border-t border-zinc-800/50 max-w-5xl mx-auto">
            <p className="text-sm text-zinc-500 mb-6 uppercase tracking-widest font-semibold">Trusted by students from</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
               {['Stanford', 'MIT', 'IIT Bombay', 'Berkeley', 'BITS Pilani'].map(college => (
                 <div key={college} className="text-lg font-bold text-zinc-300 flex items-center gap-2">
                   <School className="w-5 h-5" /> {college}
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         3. STATS SECTION
         -------------------------------------------------------------------------------- */}
      <section className="py-10 bg-zinc-950 border-y border-zinc-900">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatItem value="50+" label="Campuses" />
            <StatItem value="12k+" label="Students" />
            <StatItem value="1.5M" label="Submissions" />
            <StatItem value="4.9" label="Avg Rating" />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         4. THE PROBLEM (Why Colleges Need This)
         -------------------------------------------------------------------------------- */}
      <section id="problem" className="py-32 relative bg-zinc-900/20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            
            {/* Left: Text */}
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                Isolation kills <br />
                <span className="text-red-500">Engineering Talent.</span>
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Most coding platforms are lonely. You grind LeetCode in silence, with no idea where you stand relative to the people you are actually competing with for placements.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <div className="mt-1 bg-red-500/20 p-1 rounded"><X className="w-4 h-4 text-red-500" /></div>
                  <div>
                    <h4 className="font-bold text-white">Generic Global Ranks</h4>
                    <p className="text-sm text-zinc-400">Being #145,000 globally is demotivating and meaningless.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <div className="mt-1 bg-red-500/20 p-1 rounded"><X className="w-4 h-4 text-red-500" /></div>
                  <div>
                    <h4 className="font-bold text-white">No Peer Pressure</h4>
                    <p className="text-sm text-zinc-400">Without seeing your classmates succeed, it's easy to slack off.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: The Solution Visual */}
            <div className="flex-1 relative">
              <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl rounded-full opacity-20"></div>
              <div className="relative bg-zinc-950 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                 <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                   <div className="w-3 h-3 rounded-full bg-red-500" />
                   <div className="w-3 h-3 rounded-full bg-yellow-500" />
                   <div className="w-3 h-3 rounded-full bg-green-500" />
                   <div className="ml-auto text-xs font-mono text-zinc-500">NeetCode Solution</div>
                 </div>

                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                        <Users />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">Community First</h4>
                        <p className="text-sm text-zinc-400">We group you by email domain (@college.edu).</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                        <Trophy />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">Relevant Leaderboards</h4>
                        <p className="text-sm text-zinc-400">See your rank within your Dept & Batch.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-500">
                        <GitBranch />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">Structured Path</h4>
                        <p className="text-sm text-zinc-400">Curated 150 problems. No fluff.</p>
                      </div>
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         5. CORE FEATURES (Grid)
         -------------------------------------------------------------------------------- */}
      <section id="features" className="py-32 bg-zinc-950 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">Built for <span className="text-emerald-500">Performance</span></h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">Every feature is designed to help you clear the technical round.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             <FeatureCard 
               delay={0}
               icon={Terminal} 
               title="Cloud IDE" 
               description="Zero setup. Run Python, Java, C++, and JS code instantly in your browser with our high-performance editor."
             />
             <FeatureCard 
               delay={100}
               icon={GitBranch} 
               title="The Roadmap" 
               description="Visual tree structure for the NeetCode 150. Unlock advanced topics (Graphs, DP) only after mastering the basics."
             />
             <FeatureCard 
               delay={200}
               icon={ShieldCheck} 
               title="Verified Communities" 
               description="Strict domain locking ensures no outsiders can skew your college's internal rankings."
             />
             <FeatureCard 
               delay={300}
               icon={BarChart3} 
               title="Deep Analytics" 
               description="Heatmaps, streak tracking, and difficulty breakdown. Know exactly where your weaknesses are."
             />
             <FeatureCard 
               delay={400}
               icon={Trophy} 
               title="Live Leaderboards" 
               description="Real-time updates. Every submission pushes you up the ladder. Filter by Global, College, or Class."
             />
             <FeatureCard 
               delay={500}
               icon={Zap} 
               title="Focus Mode" 
               description="Minimalist interface designed for deep work. No ads, no distractions, just you and the problem."
             />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         6. PREVIEW SECTION (The Toggle)
         -------------------------------------------------------------------------------- */}
      <section id="communities" className="py-32 bg-zinc-900/30 border-y border-zinc-800">
        <div className="container mx-auto px-6">
          
          <div className="flex justify-center mb-16">
            <div className="inline-flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
              <button 
                onClick={() => setActiveTab('students')}
                className={cn("px-8 py-3 rounded-lg text-sm font-bold transition-all", activeTab === 'students' ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300")}
              >
                For Students
              </button>
              <button 
                onClick={() => setActiveTab('colleges')}
                className={cn("px-8 py-3 rounded-lg text-sm font-bold transition-all", activeTab === 'colleges' ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-300")}
              >
                For Colleges
              </button>
            </div>
          </div>

          <div className="max-w-6xl mx-auto bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative min-h-[500px] flex items-center">
            
            {/* Background Grid inside Card */}
            <div className="absolute inset-0 bg-[linear-gradient(#3f3f4615_1px,transparent_1px),linear-gradient(90deg,#3f3f4615_1px,transparent_1px)] bg-[size:20px_20px]" />

            {/* CONTENT FOR STUDENTS */}
            <div className={cn("grid lg:grid-cols-2 gap-12 p-8 lg:p-16 transition-all duration-500 w-full", activeTab === 'students' ? "opacity-100" : "hidden opacity-0")}>
               <div className="space-y-6 relative z-10">
                 <div className="inline-flex items-center gap-2 text-emerald-500 font-bold uppercase tracking-wider text-xs">
                   <GraduationCap className="w-4 h-4" /> Student View
                 </div>
                 <h3 className="text-3xl lg:text-4xl font-bold text-white">Get Discovered.</h3>
                 <p className="text-zinc-400 text-lg leading-relaxed">
                   Your profile is your resume. High rankings on your college leaderboard signal to recruiters that you are the top talent in your batch.
                 </p>
                 <ul className="space-y-4 pt-4">
                   <li className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="text-emerald-500 w-5 h-5" /> Verified "Top 5%" Badge</li>
                   <li className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="text-emerald-500 w-5 h-5" /> Solved Problem Portfolio</li>
                   <li className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="text-emerald-500 w-5 h-5" /> Consistency Heatmap</li>
                 </ul>
                 <Button className="mt-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-8">Create Profile</Button>
               </div>
               
               {/* Mock Student Profile Card */}
               <div className="relative z-10 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5">
                      <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center font-bold text-2xl text-white">A</div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">Alex Dev</h4>
                      <p className="text-emerald-400 text-sm">@stanford.edu</p>
                    </div>
                    <div className="ml-auto text-right">
                       <div className="text-xs text-zinc-500 uppercase">Rank</div>
                       <div className="text-2xl font-black text-white">#3</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center">
                      <div className="text-xs text-zinc-500">Solved</div>
                      <div className="font-bold text-white">142</div>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center">
                      <div className="text-xs text-zinc-500">Streak</div>
                      <div className="font-bold text-orange-500">42 🔥</div>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 text-center">
                      <div className="text-xs text-zinc-500">League</div>
                      <div className="font-bold text-yellow-500">Gold</div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-emerald-500" />
                  </div>
                  <div className="flex justify-between text-xs text-zinc-500 mt-2">
                    <span>Progress to NeetCode 150</span>
                    <span>85%</span>
                  </div>
               </div>
            </div>

            {/* CONTENT FOR COLLEGES */}
            <div className={cn("grid lg:grid-cols-2 gap-12 p-8 lg:p-16 transition-all duration-500 w-full", activeTab === 'colleges' ? "opacity-100" : "hidden opacity-0")}>
               <div className="space-y-6 relative z-10">
                 <div className="inline-flex items-center gap-2 text-blue-500 font-bold uppercase tracking-wider text-xs">
                   <School className="w-4 h-4" /> Admin View
                 </div>
                 <h3 className="text-3xl lg:text-4xl font-bold text-white">Gamify your Curriculum.</h3>
                 <p className="text-zinc-400 text-lg leading-relaxed">
                   Professors can finally see who is practicing. Create a competitive environment that drives engagement 10x higher than standard assignments.
                 </p>
                 <ul className="space-y-4 pt-4">
                   <li className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="text-blue-500 w-5 h-5" /> Leaderboard by Batch/Year</li>
                   <li className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="text-blue-500 w-5 h-5" /> Activity Monitoring</li>
                   <li className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="text-blue-500 w-5 h-5" /> Identify At-Risk Students</li>
                 </ul>
                 <Button className="mt-6 bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8">Request Access</Button>
               </div>
               
               {/* Mock Dashboard Visual */}
               <div className="relative z-10 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-2">
                       <School className="text-blue-500" /> 
                       <span className="font-bold text-white">IIT Bombay Dashboard</span>
                    </div>
                    <div className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded font-bold">Live</div>
                  </div>
                  
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-zinc-950 rounded-xl border border-zinc-800/50">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">#{i}</div>
                        <div className="flex-1">
                          <div className="h-2 w-24 bg-zinc-800 rounded mb-1"></div>
                          <div className="h-2 w-16 bg-zinc-800/50 rounded"></div>
                        </div>
                        <div className="text-emerald-500 font-mono text-sm">2400 pts</div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         7. ROADMAP PREVIEW
         -------------------------------------------------------------------------------- */}
      <section className="py-24 bg-zinc-950 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">The Roadmap that works.</h2>
            <p className="text-zinc-400">We don't overwhelm you. We guide you.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-4xl mx-auto">
             {/* Simple visual representation of nodes */}
             <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-bold shadow-[0_0_20px_rgba(16,185,129,0.5)] z-10 relative">
                  <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] px-1.5 py-0.5 rounded-full">Start</span>
                  Arrays
                </div>
                <div className="h-12 w-1 bg-zinc-800"></div>
             </div>

             <div className="flex flex-col items-center opacity-80">
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 font-bold">
                  Stack
                </div>
                <div className="h-12 w-1 bg-zinc-800"></div>
             </div>

             <div className="flex flex-col items-center opacity-60">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 font-bold">
                  Trees
                </div>
                <div className="h-12 w-1 bg-zinc-800"></div>
             </div>

             <div className="flex flex-col items-center opacity-40">
                <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-600 font-bold border-dashed">
                  Graphs
                </div>
             </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/register">
              <Button variant="link" className="text-emerald-500 hover:text-emerald-400">View Full Roadmap <ArrowRight className="ml-2 w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         8. TESTIMONIALS
         -------------------------------------------------------------------------------- */}
      <section className="py-24 bg-zinc-900/20 border-t border-zinc-800">
        <div className="container mx-auto px-6">
           <h2 className="text-3xl font-bold text-white text-center mb-16">Community Wins</h2>
           <div className="grid md:grid-cols-3 gap-6">
             <TestimonialCard 
               quote="I was solving random questions for months with no progress. Once I joined my college group on NeetCode and saw my friends climbing the ranks, I got competitive. Cleared Amazon OA in 3 weeks."
               author="Rahul S."
               role="Student"
               school="BITS Pilani"
             />
             <TestimonialCard 
               quote="The best feature is the domain locking. It feels like an exclusive club for our university. The leaderboard battles during exam week are insane!"
               author="Sarah J."
               role="CS Major"
               school="Georgia Tech"
             />
             <TestimonialCard 
               quote="Finally, a platform that feels modern. The IDE is fast, the dark mode is perfect, and the roadmap actually makes sense. NeetCode is the new standard."
               author="David K."
               role="Alumni"
               school="UCLA"
             />
           </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         9. FAQ SECTION
         -------------------------------------------------------------------------------- */}
      <section className="py-24 bg-zinc-950">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-2">
            <FaqItem 
              question="Is NeetCode free?" 
              answer="Yes! The entire problem set, the roadmap, and the community features are completely free for students. We believe education should be accessible." 
            />
            <FaqItem 
              question="How do I join my college community?" 
              answer="Simply register with your university email address (e.g., name@university.edu). Our system automatically detects your domain and adds you to the correct private community." 
            />
            <FaqItem 
              question="Can I create a custom community?" 
              answer="Currently, communities are auto-generated based on email domains to ensure verification. However, you can create 'Study Groups' within a community soon." 
            />
            <FaqItem 
              question="What languages are supported?" 
              answer="We currently support Python, JavaScript, Java, and C++. We plan to add Go and Rust in the future." 
            />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         10. CTA SECTION
         -------------------------------------------------------------------------------- */}
      <section className="py-32 border-t border-zinc-800 bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950 to-zinc-950" />
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tight">
            Ready to start <br />
            <span className="text-emerald-500">your streak?</span>
          </h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            Join 12,000+ students. Claim your spot on your college leaderboard today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Link href="/register">
              <Button size="lg" className="h-16 px-12 text-xl bg-white text-zinc-950 hover:bg-zinc-200 font-bold rounded-full shadow-2xl hover:scale-105 transition-transform">
                Join for Free
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-zinc-600 text-sm font-medium">No credit card required • Instant access</p>
        </div>
      </section>

      {/* --------------------------------------------------------------------------------
         11. FOOTER
         -------------------------------------------------------------------------------- */}
      <footer className="py-16 border-t border-zinc-900 bg-zinc-950 text-zinc-500 text-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
             <div className="col-span-2 lg:col-span-2">
               <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
                 <div className="bg-emerald-500 rounded-lg p-1"><Code2 className="h-4 w-4 text-zinc-950" /></div>
                 NeetCode
               </div>
               <p className="mb-6 max-w-xs leading-relaxed">
                 The community-first coding platform built to help university students master algorithms together.
               </p>
               <div className="flex gap-4">
                 <Link href="#" className="p-2 bg-zinc-900 rounded-full hover:bg-emerald-500/20 hover:text-emerald-500 transition-colors"><Twitter size={18} /></Link>
                 <Link href="#" className="p-2 bg-zinc-900 rounded-full hover:bg-emerald-500/20 hover:text-emerald-500 transition-colors"><Github size={18} /></Link>
                 <Link href="#" className="p-2 bg-zinc-900 rounded-full hover:bg-emerald-500/20 hover:text-emerald-500 transition-colors"><Globe size={18} /></Link>
               </div>
             </div>
             
             <div>
               <h4 className="font-bold text-white mb-6">Platform</h4>
               <ul className="space-y-4">
                 <li><Link href="#" className="hover:text-emerald-400 transition-colors">Roadmap</Link></li>
                 <li><Link href="#" className="hover:text-emerald-400 transition-colors">Problems</Link></li>
                 <li><Link href="#" className="hover:text-emerald-400 transition-colors">Leaderboards</Link></li>
                 <li><Link href="#" className="hover:text-emerald-400 transition-colors">IDE</Link></li>
               </ul>
             </div>

             <div>
               <h4 className="font-bold text-white mb-6">Community</h4>
               <ul className="space-y-4">
                 <li><Link href="#" className="hover:text-emerald-400 transition-colors">For Colleges</Link></li>
                 <li><Link href="#" className="hover:text-emerald-400 transition-colors">Student Ambassadors</Link></li>
                 <li><Link href="#" className="hover:text-emerald-400 transition-colors">Discord</Link></li>
                 <li><Link href="#" className="hover:text-emerald-400 transition-colors">Blog</Link></li>
               </ul>
             </div>

             <div>
               <h4 className="font-bold text-white mb-6">Legal</h4>
               <ul className="space-y-4">
                 <li><Link href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                 <li><Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
                 <li><Link href="#" className="hover:text-emerald-400 transition-colors">Cookie Policy</Link></li>
               </ul>
             </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
             <div>&copy; {new Date().getFullYear()} NeetCode Inc. All rights reserved.</div>
             <div className="flex items-center gap-2 text-xs">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               Systems Operational
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
}