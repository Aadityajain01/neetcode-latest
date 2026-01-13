"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store'; // ✅ Import UI Store
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar'; 
import { TutorialGuide } from '@/components/TutorialGuide';
import logo from '../../../public/logo.png'
interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  
  // ✅ Use global store for Tutorial state
  const { isTutorialOpen, closeTutorial, openTutorial } = useUIStore();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/'); 
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 overflow-hidden text-zinc-100 font-sans selection:bg-emerald-500/30">
      
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
        onShowTutorial={openTutorial} // ✅ Connect to store action
      />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#020617] relative">
        
        {/* Mobile Header */}
        <div className="lg:hidden h-16 border-b border-white/5 flex items-center px-4 gap-4 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-30">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-zinc-300" />
          </Button>
          <span className="font-semibold text-white">NeetCode</span>
        </div>

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Content Scroll Area */}
        <ScrollArea className="flex-1">
          <div className="container mx-auto p-4 lg:p-8 max-w-7xl relative z-10">
              {children}
          </div>
        </ScrollArea>
      </main>

      {/* GLOBAL TUTORIAL OVERLAY */}
      {/* Controlled entirely by the store now */}
      {isTutorialOpen && (
        <TutorialGuide onClose={closeTutorial} />
      )}
    </div>
  );
}