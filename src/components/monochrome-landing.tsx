'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence, useInView } from 'framer-motion';
import Lenis from 'lenis';
import { 
  Code2, Trophy, Users, ArrowRight, BarChart3, 
  Terminal, Zap, Target, Activity, CheckCircle2,
  Menu, X, GitBranch, ArrowUpRight, ChevronLeft, ChevronRight, Circle, BrainCircuit, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import logo from "../../public/logo.png";

// ─── MONOCHROME REDESIGN COMPONENTS ───────────────────────────────────────────

const DistortedWord = ({ word, isHighlight }: { word: string; isHighlight?: boolean }) => {
  return (
    <span className="inline-flex flex-wrap justify-center gap-[0.02em] select-none">
      {word.split('').map((char, index) => (
        <motion.span
          key={index}
          className={cn(
            "inline-block transition-colors duration-200 text-inherit font-swiss font-black cursor-default select-none",
            isHighlight ? "hover:text-brand-400 text-brand-500" : "hover:text-brand-500 text-zinc-300"
          )}
          whileHover={{
            scale: 1.15,
            y: -12,
            rotate: (Math.random() - 0.5) * 12,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

const GridBackground = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true);
      return;
    }
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const gridX = useSpring(useTransform(mouseX, [-window.innerWidth / 2, window.innerWidth / 2], [-20, 20]), { damping: 50, stiffness: 200 });
  const gridY = useSpring(useTransform(mouseY, [-window.innerHeight / 2, window.innerHeight / 2], [-20, 20]), { damping: 50, stiffness: 200 });

  if (isTouch) {
    return <div className="absolute inset-0 blueprint-grid blueprint-grid-fine pointer-events-none opacity-30" />;
  }

  return (
    <motion.div 
      className="absolute inset-0 blueprint-grid blueprint-grid-fine pointer-events-none opacity-35"
      style={{ x: gridX, y: gridY }}
    />
  );
};

const Counter = ({ target, duration = 2 }: { target: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = target;
      if (start === end) return;

      const totalMiliseconds = duration * 1000;
      const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 30);
      
      const timer = setInterval(() => {
        start += Math.ceil(end / (totalMiliseconds / incrementTime));
        if (start >= end) {
          clearInterval(timer);
          setCount(end);
        } else {
          setCount(start);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

const CustomCursor = () => {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorSize = useMotionValue(20);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const springConfig = { damping: 40, stiffness: 400, mass: 0.4 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  const cursorSizeSpring = useSpring(cursorSize, springConfig);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) {
      setIsTouch(true);
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button') || target.closest('.hover-invert')) {
        setIsHovered(true);
        cursorSize.set(50);
      } else {
        setIsHovered(false);
        cursorSize.set(20);
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, cursorSize]);

  if (isTouch) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full border border-white mix-blend-difference pointer-events-none z-[9999] items-center justify-center -translate-x-1/2 -translate-y-1/2 hidden md:flex"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        width: cursorSizeSpring,
        height: cursorSizeSpring,
      }}
    />
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav 
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-5xl bg-zinc-950/80 border border-zinc-900 px-6 py-3 rounded-full flex items-center justify-between backdrop-blur-md transition-all duration-500",
          scrolled && "border-zinc-800 bg-black/95 shadow-2xl shadow-black/80 py-2.5"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
            <Image src={logo} width={24} height={24} alt="Logo" className="object-contain" />
          </div>
          <span className="font-sans text-[13px] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-400 font-black uppercase hidden sm:inline">SWADHYAAYI</span>
          <span className="font-sans text-[13px] tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-400 font-black uppercase sm:hidden">SWADHYAAYI</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-[11px] font-sans font-bold tracking-wider text-zinc-400 uppercase">
          <a href="#practice" className="hover:text-brand-500 transition-colors duration-300">Practice</a>
          <a href="#stats" className="hover:text-brand-500 transition-colors duration-300">Telemetry</a>
          <a href="#leaderboard" className="hover:text-brand-500 transition-colors duration-300">Index</a>
          <a href="#community" className="hover:text-brand-500 transition-colors duration-300">Ecosystem</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:inline-block">
            <Button variant="ghost" className="text-zinc-400 hover:text-brand-400 uppercase tracking-wider text-xs font-sans h-8 px-3 rounded-none">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-brand-500 hover:bg-brand-600 text-white uppercase tracking-wider text-xs font-sans h-9 px-4 rounded-full font-black transition-all hover:scale-105 border border-brand-500 shadow-[0_0_15px_rgba(255,106,31,0.2)]">
              Get Started
            </Button>
          </Link>
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="md:hidden text-zinc-400 hover:text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black flex flex-col justify-center px-12 md:hidden"
          >
            <div className="blueprint-grid absolute inset-0 opacity-20 pointer-events-none" />
            <div className="space-y-8 flex flex-col items-start font-swiss z-10">
              <a 
                href="#practice" 
                onClick={() => setMobileOpen(false)}
                className="text-4xl font-black text-zinc-500 hover:text-white transition-colors tracking-tighter"
              >
                01 / PRACTICE
              </a>
              <a 
                href="#stats" 
                onClick={() => setMobileOpen(false)}
                className="text-4xl font-black text-zinc-500 hover:text-white transition-colors tracking-tighter"
              >
                02 / TELEMETRY
              </a>
              <a 
                href="#leaderboard" 
                onClick={() => setMobileOpen(false)}
                className="text-4xl font-black text-zinc-500 hover:text-white transition-colors tracking-tighter"
              >
                03 / INDEX
              </a>
              <a 
                href="#community" 
                onClick={() => setMobileOpen(false)}
                className="text-4xl font-black text-zinc-500 hover:text-white transition-colors tracking-tighter"
              >
                04 / ECOSYSTEM
              </a>
              
              <div className="pt-12 w-full border-t border-zinc-900 flex flex-col gap-4 font-sans font-bold text-sm tracking-wide">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-zinc-400 hover:text-brand-400 uppercase tracking-wider">Log in</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="text-zinc-400 hover:text-brand-400 uppercase tracking-wider">Join App</Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-black px-6 select-none border-b border-zinc-950">
      <GridBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none" />
      
      {/* Subtle brand orange ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60dvw] h-[60dvw] max-w-[600px] max-h-[600px] bg-brand-500/10 blur-[10dvw] rounded-full pointer-events-none z-0" />

      <div className="z-10 flex flex-col items-center justify-center max-w-7xl w-full text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-sans font-bold text-xs tracking-[0.2em] text-brand-500 uppercase mb-8"
        >
          SWADHYAAYI ENGINE // VERSION 2.0
        </motion.div>

        <div className="flex flex-col items-center space-y-4 tracking-tighter">
          <div className="text-[12vw] sm:text-[10vw] font-black leading-[0.8] text-zinc-300 select-none">
            <DistortedWord word="MASTER" />
          </div>
          <div className="text-[12vw] sm:text-[10vw] font-black leading-[0.8] text-zinc-300 select-none">
            <DistortedWord word="THE" />
          </div>
          <div className="text-[12vw] sm:text-[10vw] font-black leading-[0.8] text-brand-500 select-none">
            <DistortedWord word="ALGORITHM." isHighlight={true} />
          </div>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="text-xs sm:text-sm font-sans tracking-wide text-zinc-400 max-w-xl mt-12 leading-relaxed font-semibold"
        >
          An editorial blueprint for competitive developers. No noise, just clean data structures and algorithmic mastery.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex items-center gap-6 mt-12"
        >
          <Link href="/register">
            <Button size="lg" className="h-12 px-8 bg-brand-500 text-white font-sans font-black tracking-wider text-xs uppercase hover:bg-brand-600 transition-all rounded-none border border-brand-500 shadow-[0_0_20px_rgba(255,106,31,0.25)] hover:scale-105">
              Initialize Practice
            </Button>
          </Link>
          <a href="#practice">
            <Button size="lg" variant="outline" className="h-12 px-8 border-zinc-800 bg-transparent text-zinc-400 hover:text-brand-500 hover:border-brand-500 font-sans font-bold tracking-wider text-xs uppercase transition-all rounded-none hover:bg-brand-500/5">
              Scroll Down ↓
            </Button>
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 font-sans text-xs font-bold tracking-[0.2em] text-zinc-650 animate-pulse uppercase">
        System Status: Operational
      </div>
    </section>
  );
};

const PracticeSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });

  return (
    <section id="practice" ref={ref} className="relative min-h-screen w-full flex flex-col justify-center bg-black px-6 py-20 border-b border-zinc-950 overflow-hidden">
      <div className="absolute left-1/4 top-0 bottom-0 w-px bg-zinc-900/50 hidden md:block" />
      <div className="absolute left-2/3 top-0 bottom-0 w-px bg-zinc-900/50 hidden md:block" />
      
      {/* Subtle brand orange ambient glow */}
      <div className="absolute -right-24 top-1/4 w-[40dvw] h-[40dvw] bg-brand-500/5 blur-[8dvw] rounded-full pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
        <div className="md:col-span-5 flex flex-col justify-between h-full py-4">
          <div className="space-y-4">
            <div className="font-sans font-bold text-xs tracking-wider text-brand-500 uppercase">SECTION 01 / 05</div>
            <h2 className="text-zinc-400 font-sans text-xs tracking-wide font-bold uppercase">CURATED DSA BLUEPRINT</h2>
          </div>
          
          <motion.div 
            animate={{ opacity: isInView ? 1 : 0, x: isInView ? 0 : -30 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-[4.5vw] lg:text-6xl xl:text-7xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-brand-500 font-swiss mt-8 md:mt-24 pr-4 pb-2"
          >
            PRACTICE.
          </motion.div>
        </div>

        <div className="md:col-span-7 flex flex-col justify-center space-y-12">
          <div className="text-xl md:text-3xl text-zinc-400 font-swiss font-medium max-w-2xl leading-snug">
            We stripped away the gamified wrappers. Swadhyaayi is an editorial roadmap designed for rigorous algorithmic conditioning.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 border-t border-zinc-900">
            <div className="space-y-3">
              <div className="font-sans text-sm font-bold text-zinc-100 uppercase tracking-wide">
                <span className="text-brand-500">01 //</span> Curated Roadmap
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans font-medium">
                No random algorithms. Practice only core patterns that are proven to appear in technical screens. Mark arrays, graphs, trees, and dynamic programming sequentially.
              </p>
            </div>
            <div className="space-y-3">
              <div className="font-sans text-sm font-bold text-zinc-100 uppercase tracking-wide">
                <span className="text-brand-500">02 //</span> Dynamic MCQ Engine
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans font-medium">
                Test concepts instantly. Our queue filters out solved questions to prioritize your weaknesses, reinforcing correct compiler-level mental execution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const StatsSection = () => {
  return (
    <section id="stats" className="relative min-h-screen w-full flex flex-col justify-center bg-black px-6 py-24 border-b border-zinc-950 overflow-hidden">
      {/* Subtle brand orange ambient glow */}
      <div className="absolute left-1/4 top-1/4 w-[40dvw] h-[40dvw] bg-brand-500/5 blur-[10dvw] rounded-full pointer-events-none z-0" />
      <div className="blueprint-grid blueprint-grid-fine absolute inset-0 pointer-events-none opacity-40" />
      
      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col justify-between h-full space-y-16">
        <div>
          <div className="font-sans font-bold text-xs tracking-wider text-brand-500 uppercase mb-4">SECTION 02 / 05</div>
          <h2 className="text-zinc-400 font-sans text-xs tracking-wider uppercase font-bold">SYSTEM TELEMETRY DATA</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 border-y border-zinc-900 py-16">
          <div className="space-y-4">
            <div className="text-[8vw] md:text-[6vw] font-black font-sans leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-brand-500 tracking-tighter">
              <Counter target={358410} />
            </div>
            <div className="font-sans text-xs text-zinc-500 uppercase tracking-widest font-bold">Active problems tracked</div>
          </div>
          <div className="space-y-4">
            <div className="text-[8vw] md:text-[6vw] font-black font-sans leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-brand-500 tracking-tighter">
              <Counter target={98} />%
            </div>
            <div className="font-sans text-xs text-zinc-500 uppercase tracking-widest font-bold">Compiler execution success rate</div>
          </div>
          <div className="space-y-4">
            <div className="text-[8vw] md:text-[6vw] font-black font-sans leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-100 to-brand-500 tracking-tighter">
              <Counter target={1420} />
            </div>
            <div className="font-sans text-xs text-zinc-500 uppercase tracking-widest font-bold">Global study communities active</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-sans text-zinc-500 uppercase font-bold tracking-wider">
          <span>// LIVE CONNECTION FEED: SECURE</span>
          <span>TELEMETRY_PORT: ACTIVE</span>
        </div>
      </div>
    </section>
  );
};

const LeaderboardSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  const dummyRankings = [
    { rank: "01", name: "ALGO_WARRIOR", solved: "1,245", score: "12,450", status: "ONLINE" },
    { rank: "02", name: "BYTE_CRUSADER", solved: "1,192", score: "11,920", status: "IDLE" },
    { rank: "03", name: "BINARY_SORT", solved: "1,154", score: "11,540", status: "ONLINE" },
    { rank: "04", name: "COMPILER_ERR", solved: "1,102", score: "11,020", status: "ONLINE" },
    { rank: "05", name: "POINTER_DEREF", solved: "1,043", score: "10,430", status: "OFFLINE" },
  ];

  return (
    <section id="leaderboard" ref={ref} className="relative min-h-screen w-full flex flex-col justify-center bg-black px-6 py-24 border-b border-zinc-955 overflow-hidden">
      {/* Subtle brand orange ambient glow */}
      <div className="absolute right-1/4 bottom-1/4 w-[40dvw] h-[40dvw] bg-brand-500/5 blur-[10dvw] rounded-full pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col justify-between h-full space-y-16">
        <div>
          <div className="font-sans font-bold text-xs tracking-wider text-brand-500 uppercase mb-4">SECTION 03 / 05</div>
          <h2 className="text-zinc-400 font-sans text-xs tracking-wide font-bold uppercase">GLOBAL NODE INDEX (LEADERBOARD)</h2>
        </div>

        <div className="space-y-6">
          <div className="text-xl md:text-2xl text-zinc-400 font-sans tracking-wide max-w-xl font-semibold uppercase">
            Ranks update in real-time. Dominate the index and claim terminal visibility.
          </div>

          <div className="border border-zinc-800/60 bg-zinc-950/30 backdrop-blur-md rounded-none overflow-hidden font-sans text-xs">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 border-b border-zinc-850 px-6 py-4 text-zinc-500 font-bold uppercase tracking-wider bg-zinc-950/70">
              <div className="col-span-2 md:col-span-1">RANK</div>
              <div className="col-span-6 md:col-span-5">NODE / DEVELOPER</div>
              <div className="col-span-2">SOLVED</div>
              <div className="col-span-2">SCORE</div>
              <div className="col-span-2 hidden md:block text-right">STATUS</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-zinc-900">
              {dummyRankings.map((user, idx) => (
                <motion.div 
                  key={user.rank}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-zinc-900/10 transition-colors"
                >
                  <div className="col-span-2 md:col-span-1 font-black text-white text-sm">{user.rank}</div>
                  <div className="col-span-6 md:col-span-5 font-bold text-zinc-300 tracking-wide flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                    {user.name}
                  </div>
                  <div className="col-span-2 text-zinc-400 font-semibold">{user.solved}</div>
                  <div className="col-span-2 font-black text-white">{user.score}</div>
                  <div className="col-span-2 hidden md:block text-right">
                    <span className={`px-2 py-0.5 border text-[9px] font-bold ${
                      user.status === 'ONLINE' ? 'border-brand-500/30 bg-brand-500/10 text-brand-400' : 'border-zinc-800 text-zinc-500'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link href="/leaderboard">
            <Button className="bg-transparent hover:bg-brand-500 text-zinc-400 hover:text-white font-sans font-bold tracking-wider text-xs uppercase border border-zinc-800 hover:border-brand-500 px-6 h-10 transition-all rounded-none hover:shadow-[0_0_15px_rgba(255,106,31,0.15)]">
              View Index Summary →
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const CommunitySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  const nodes = [
    { id: 1, label: "SYS_ARCHITECTS", cx: "25%", cy: "30%", val: 12, avg: "3.4k" },
    { id: 2, label: "HACKATHON_ELITE", cx: "65%", cy: "20%", val: 24, avg: "4.1k" },
    { id: 3, label: "DP_SPECIALISTS", cx: "45%", cy: "60%", val: 18, avg: "2.9k" },
    { id: 4, label: "GRAPH_SQUAD", cx: "15%", cy: "75%", val: 14, avg: "3.1k" },
    { id: 5, label: "COMPILER_CORE", cx: "80%", cy: "70%", val: 32, avg: "4.8k" },
  ];

  return (
    <section id="community" ref={ref} className="relative min-h-screen w-full flex flex-col justify-center bg-black px-6 py-24 border-b border-zinc-955 overflow-hidden">
      {/* Subtle brand orange ambient glow */}
      <div className="absolute left-1/3 top-1/2 w-[40dvw] h-[40dvw] bg-brand-500/5 blur-[9dvw] rounded-full pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col justify-between h-full space-y-16">
        <div>
          <div className="font-sans font-bold text-xs tracking-wider text-brand-500 uppercase mb-4">SECTION 04 / 05</div>
          <h2 className="text-zinc-400 font-sans text-xs tracking-wide font-bold uppercase">INTERCONNECTED SYSTEM NODES (COMMUNITIES)</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-3xl md:text-4xl font-black text-white font-swiss leading-tight uppercase">
              Isolate the noise.<br />Focus your cluster.
            </h3>
            <p className="text-xs text-zinc-450 leading-relaxed font-sans font-medium">
              Study groups are not social channels. Swadhyaayi communities represent private, telemetry-isolated clusters. Create a squad, host dedicated code speedruns, and run auto-graded algorithmic diagnostic tests for your members.
            </p>
            
            <div className="pt-6 border-t border-zinc-900 space-y-4 font-sans text-xs font-semibold tracking-wide uppercase">
              <div className="flex items-center gap-3 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                <span>ISOLATED PERFORMANCE RANKINGS</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                <span>CUSTOM AUTO-GRADED SPEEDRUN RUNTIMES</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                <span>TERMINAL INTEGRATED FEED CHANNELS</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 h-[400px] w-full border border-zinc-900 bg-zinc-950/20 relative rounded-none overflow-hidden select-none">
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {isInView && (
                <>
                  <motion.line x1="25%" y1="30%" x2="65%" y2="20%" stroke="rgba(255,106,31,0.2)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
                  <motion.line x1="25%" y1="30%" x2="45%" y2="60%" stroke="rgba(255,106,31,0.2)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
                  <motion.line x1="65%" y1="20%" x2="45%" y2="60%" stroke="rgba(255,106,31,0.2)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
                  <motion.line x1="45%" y1="60%" x2="15%" y2="75%" stroke="rgba(255,106,31,0.2)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
                  <motion.line x1="45%" y1="60%" x2="80%" y2="70%" stroke="rgba(255,106,31,0.2)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
                  <motion.line x1="65%" y1="20%" x2="80%" y2="70%" stroke="rgba(255,106,31,0.2)" strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
                </>
              )}
            </svg>

            {nodes.map((node) => (
              <motion.div
                key={node.id}
                style={{ left: node.cx, top: node.cy }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-default group"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-4 h-4 rounded-full border border-brand-500 bg-black flex items-center justify-center relative z-10 transition-colors group-hover:bg-brand-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500 transition-colors group-hover:bg-black" />
                </div>
                
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-zinc-950 border border-zinc-900 p-3 w-40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-sans text-[10px] uppercase space-y-1 shadow-2xl z-25">
                  <div className="font-bold text-white tracking-wide border-b border-brand-500/20 pb-1">{node.label}</div>
                  <div className="text-zinc-500">Node size: <span className="text-brand-400 font-bold">{node.val} members</span></div>
                  <div className="text-zinc-500">Average: <span className="text-brand-400 font-bold">{node.avg} pts</span></div>
                </div>

                <div className="absolute -top-6 left-1/2 -translate-x-1/2 font-sans text-[11px] font-bold text-zinc-450 tracking-wider group-hover:text-brand-500 transition-colors select-none whitespace-nowrap">
                  {node.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const CtaSection = () => {
  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center bg-black px-6 select-none overflow-hidden border-b border-zinc-955">
      <div className="blueprint-grid absolute inset-0 pointer-events-none opacity-30" />
      
      {/* Subtle brand orange ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55dvw] h-[55dvw] max-w-[550px] max-h-[550px] bg-brand-500/10 blur-[11dvw] rounded-full pointer-events-none z-0" />

      <div className="z-10 flex flex-col items-center justify-center max-w-7xl w-full text-center space-y-16">
        <div className="font-sans font-bold text-xs tracking-wider text-brand-500 uppercase">SECTION 05 / 05</div>

        <div className="flex flex-col items-center space-y-2 tracking-tighter">
          <div className="text-[14vw] sm:text-[11vw] font-black leading-[0.8] text-zinc-400 select-none">
            <DistortedWord word="READY" />
          </div>
          <div className="text-[14vw] sm:text-[11vw] font-black leading-[0.8] text-zinc-400 select-none">
            <DistortedWord word="TO" />
          </div>
          <div className="text-[14vw] sm:text-[11vw] font-black leading-[0.8] text-white select-none">
            <DistortedWord word="COMPETE?" isHighlight={true} />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <Link href="/register">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-40 h-40 rounded-full border border-brand-500 bg-brand-500/10 hover:bg-brand-500 text-white hover:text-black font-sans tracking-wider text-xs uppercase transition-all duration-300 flex items-center justify-center font-black shadow-[0_0_30px_rgba(255,106,31,0.2)] hover:shadow-[0_0_40px_rgba(255,106,31,0.4)] cursor-pointer"
            >
              Launch App
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-16 border-t border-zinc-950 bg-black text-zinc-500 text-xs font-sans font-medium">
      <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
            <Image src={logo} width={24} height={24} alt="Logo" className="object-contain" />
          </div>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-400 font-extrabold text-sm font-sans uppercase tracking-wider">
            SWADHYAAYI
          </span>
        </div>
        <div className="flex items-center gap-6 text-xs font-sans font-bold uppercase tracking-wider">
          <Link href="/problems" className="hover:text-brand-500 transition-colors">Problems</Link>
          <Link href="/leaderboard" className="hover:text-brand-500 transition-colors">Index</Link>
          <Link href="/communities" className="hover:text-brand-500 transition-colors">Nodes</Link>
        </div>
        <div className="text-xs font-sans font-semibold tracking-wide uppercase text-zinc-600">
          &copy; {new Date().getFullYear()} SWADHYAAYI. ALL RIGHTS RESERVED.
        </div>
      </div>
    </footer>
  );
};

export default function MonochromeLanding() {
  useEffect(() => {
    // Mount: Set overflow auto for guest landing page scrolling
    const origHtmlOverflow = document.documentElement.style.overflow;
    const origHtmlHeight = document.documentElement.style.height;
    const origBodyOverflow = document.body.style.overflow;
    const origBodyHeight = document.body.style.height;

    document.documentElement.style.overflow = 'auto';
    document.documentElement.style.height = 'auto';
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.documentElement.classList.add('lenis');

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      // Unmount: Restore original styles for dashboard view
      document.documentElement.style.overflow = origHtmlOverflow;
      document.documentElement.style.height = origHtmlHeight;
      document.body.style.overflow = origBodyOverflow;
      document.body.style.height = origBodyHeight;
      document.documentElement.classList.remove('lenis');
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-zinc-800 selection:text-white font-sans overflow-x-hidden relative">
      <CustomCursor />
      <div className="noise-overlay" />
      <Navbar />
      <HeroSection />
      <PracticeSection />
      <StatsSection />
      <LeaderboardSection />
      <CommunitySection />
      <CtaSection />
      <Footer />
    </div>
  );
}
