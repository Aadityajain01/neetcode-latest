"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';
import { TutorialGuide } from '@/components/TutorialGuide';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { isTutorialOpen, closeTutorial, openTutorial } = useUIStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="flex h-screen h-[100dvh] bg-zinc-950 overflow-hidden text-zinc-100 font-sans selection:bg-emerald-500/30">

      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR COMPONENT */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
        onShowTutorial={openTutorial}
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#020617] relative lg:pl-20 transition-all duration-300 h-full overflow-hidden">

        {/* Mobile Header */}
        <div className="lg:hidden h-14 border-b border-white/5 flex items-center px-4 gap-4 bg-zinc-900/50 backdrop-blur-md z-30 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-zinc-300" />
          </Button>
          <span className="font-semibold text-white">NeetCode</span>
        </div>

        {/* Premium Deep Radial Background */}
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.1),rgba(255,255,255,0))]" />
        </div>

        {/* Content Area — NO scroll, children manage their own layout */}
        <div className="flex-1 min-h-0 relative z-10 overflow-hidden">
          {children}
        </div>
      </main>

      {/* GLOBAL TUTORIAL OVERLAY */}
      {isTutorialOpen && (
        <TutorialGuide onClose={closeTutorial} />
      )}
    </div>
  );
}