"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';
import { Menu, LayoutDashboard, User, Trophy, HelpCircle, LogOut, Bookmark } from 'lucide-react';
import Sidebar from './Sidebar';
import { TutorialGuide } from '@/components/TutorialGuide';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, user, firebaseUser } = useAuthStore();
  const { isTutorialOpen, closeTutorial, openTutorial } = useUIStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isHomepage = pathname === '/';

  const profileImageUrl = user?.avatarUrl || firebaseUser?.photoURL || undefined;
  const profileInitial =
    user?.displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    firebaseUser?.displayName?.[0]?.toUpperCase() ||
    firebaseUser?.email?.[0]?.toUpperCase() ||
    'U';

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="flex h-[100dvh] min-h-[100dvh] bg-zinc-950 overflow-x-hidden lg:overflow-hidden text-zinc-100 font-sans selection:bg-zinc-800">

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
      <main className="flex-1 flex flex-col min-w-0 bg-[#020617] relative lg:pl-20 lg:pr-4 lg:p-2 transition-all duration-300 min-h-0 lg:h-[100dvh] overflow-x-hidden lg:overflow-hidden">

        {/* Global Desktop Top-Right Profile Section */}
        {isHomepage && (
          <div className="hidden lg:block absolute top-4 right-4 z-40">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/80 shadow-md backdrop-blur-md cursor-pointer transition-all duration-300 select-none group">
                  <span className="text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors">
                    {user?.displayName || 'Developer'}
                  </span>
                  <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-zinc-500 via-zinc-200 to-zinc-600 p-[1px] relative transition-all duration-300 group-hover:scale-105">
                    <Avatar className="h-full w-full rounded-full bg-zinc-950 border border-zinc-950">
                      <AvatarImage
                        src={profileImageUrl}
                        alt={user?.displayName || user?.email || 'User avatar'}
                        className="h-full w-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <AvatarFallback className="rounded-full bg-zinc-950 text-white font-bold text-[10px] flex items-center justify-center">
                        {profileInitial}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-52 bg-zinc-900/95 border border-white/10 text-zinc-300 rounded-xl shadow-2xl p-1 z-[100] backdrop-blur-md">
                <div className="flex flex-col space-y-1 px-2.5 py-2.5 border-b border-white/5 mb-1">
                  <p className="text-xs font-semibold text-white truncate">
                    {user?.displayName || 'Developer'}
                  </p>
                  <p className="text-[10px] text-zinc-500 truncate">
                    {user?.email}
                  </p>
                </div>
                
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-zinc-800/50 focus:text-white rounded-lg transition-colors py-2 px-2.5">
                  <Link href="/" className="flex items-center w-full">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    <span className="font-semibold text-xs">Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-zinc-800/50 focus:text-white rounded-lg transition-colors py-2 px-2.5">
                  <Link href="/profile" className="flex items-center w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span className="font-semibold text-xs">Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer focus:bg-zinc-800/50 focus:text-white rounded-lg transition-colors py-2 px-2.5">
                  <Link href="/bookmarks" className="flex items-center w-full">
                    <Bookmark className="mr-2 h-4 w-4" />
                    <span className="font-semibold text-xs">Bookmarks</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild className="cursor-pointer focus:bg-zinc-800/50 focus:text-white rounded-lg transition-colors py-2 px-2.5">
                  <Link href="/leaderboard" className="flex items-center w-full">
                    <Trophy className="mr-2 h-4 w-4" />
                    <span className="font-semibold text-xs">Leaderboard</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={openTutorial} className="cursor-pointer focus:bg-zinc-800/50 focus:text-white rounded-lg transition-colors py-2 px-2.5">
                  <div className="flex items-center w-full">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span className="font-semibold text-xs">Help</span>
                  </div>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-white/5 my-1" />
                
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-300 rounded-lg transition-colors py-2 px-2.5 mb-0.5">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-semibold text-xs">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Mobile Header */}
        <div className="lg:hidden h-14 border-b border-white/5 flex items-center px-4 gap-4 bg-zinc-900/50 backdrop-blur-md z-30 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5 text-zinc-300" />
          </Button>
          <span className="font-semibold text-white">Neetcode</span>
        </div>

        {/* Premium Deep Radial Background */}
        <div className="absolute inset-0 bg-zinc-950 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,255,255,0.03),rgba(255,255,255,0))]" />
        </div>

        {/* Content Area — NO scroll, children manage their own layout */}
        <div className="flex-1 min-h-0 relative z-10 overflow-x-hidden overflow-y-auto lg:overflow-hidden lg:h-[100dvh] flex flex-col">
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