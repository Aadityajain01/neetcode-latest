"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Code2, Trophy, Users, Shield,
  X, LogOut, Zap, User, HelpCircle, TrendingUp, Compass, Terminal, Bookmark, LogIn
} from 'lucide-react';
import Image from 'next/image';
import icon from '../../../public/icon.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onShowTutorial: () => void;
}

export default function Sidebar({ isOpen, onClose, onLogout, onShowTutorial }: SidebarProps) {
  const pathname = usePathname();
  const { user, firebaseUser, isAuthenticated } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const profileImageUrl = user?.avatarUrl || firebaseUser?.photoURL || undefined;
  const profileInitial =
    user?.displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    firebaseUser?.displayName?.[0]?.toUpperCase() ||
    firebaseUser?.email?.[0]?.toUpperCase() ||
    'U';

  const navItems = [
    { href: '/problems', label: 'Problem Set', icon: Code2 },
    { href: '/practice', label: 'MCQ Arena', icon: HelpCircle },
    { href: '/practice/code', label: 'Coding Arena', icon: Terminal },
    { href: '/communities', label: 'Communities', icon: Users },
    { href: '/tech-opportunities', label: 'Opportunities', icon: TrendingUp },
    { href: '/roadmap', label: 'Roadmap', icon: Compass },
  ];

  const adminNavItems = [
    { href: '/admin/problems', label: 'Manage Problems', icon: Shield },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
  ];

  const SidebarItem = ({ item, isActive, isAdminItem = false }: { item: any, isActive: boolean, isAdminItem?: boolean }) => {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={item.href} onClick={onClose} className="block outline-none relative group/item">
            <div className={cn(
              "flex items-center lg:justify-center h-11 w-[calc(100%-24px)] lg:h-9 lg:w-9 mx-3 lg:mx-auto px-3 lg:px-0 rounded-[14px] lg:rounded-[8px] transition-all duration-300 relative bg-transparent",
              isActive 
                ? isAdminItem ? "text-purple-400" : "text-brand-500"
                : "text-zinc-400 hover:text-zinc-100"
            )}>
              <item.icon className={cn(
                "h-[18px] w-[18px] shrink-0 transition-transform duration-300 group-hover/item:scale-110"
              )} />
              
              {/* Mobile Label */}
              <span className="lg:hidden ml-3 font-semibold text-[13px]">
                {item.label}
              </span>
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10} hideArrow={true} className="hidden lg:flex px-2.5 py-1.5 bg-zinc-800/90 backdrop-blur-sm border border-zinc-700/50 text-zinc-200 text-xs font-medium rounded-md shadow-lg">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-500 ease-out",
      "bg-zinc-950/60 backdrop-blur-2xl border-r border-white/5 shadow-2xl lg:shadow-none",
      "w-72 lg:w-[72px] overflow-visible",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      
      {/* ── Logo Area ── */}
      <div className="h-24 flex items-center justify-start lg:justify-center px-6 lg:px-0 shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <Link href="/" onClick={onClose} className="relative h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center bg-zinc-900 border border-white/10 shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300 outline-none">
          <Image src={icon} alt="Swadhyaayi Icon" fill sizes="40px" className="object-contain p-1" />
        </Link>
        <Button variant="ghost" size="icon" className="lg:hidden ml-auto shrink-0 text-zinc-400 hover:text-white" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* ── Scrollable Nav ── */}
      <ScrollArea className="flex-1 py-4 [&_[data-radix-scroll-area-scrollbar]]:!hidden">
        <nav className="space-y-1 flex flex-col items-stretch lg:items-center">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.href} 
              item={item} 
              isActive={
                item.href === '/practice'
                  ? pathname === '/practice' || pathname?.startsWith('/practice/mcq/')
                  : item.href === '/practice/code'
                    ? pathname === '/practice/code' || pathname?.startsWith('/practice/code/') || (pathname?.startsWith('/practice/') && !pathname?.startsWith('/practice/mcq/'))
                    : pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href + '/'))
              } 
            />
          ))}
        </nav>

        {isAdmin && (
          <div className="mt-8 animate-in fade-in slide-in-from-left-4 duration-700 flex flex-col items-stretch lg:items-center">
            <div className="w-8 h-[1px] bg-white/10 mb-4 mx-auto" />
            <nav className="space-y-1 flex flex-col items-stretch lg:items-center">
              {adminNavItems.map((item) => (
                <SidebarItem 
                  key={item.href} 
                  item={item} 
                  isActive={pathname === item.href || pathname?.startsWith(item.href + '/')}
                  isAdminItem={true}
                />
              ))}
            </nav>
          </div>
        )}
      </ScrollArea>

      {/* Profile Section at the Bottom (Non-Homepage Pages) */}
      {pathname !== '/' && (
        <div className="shrink-0 pb-6 pt-4 px-2 lg:px-0 flex flex-col items-center bg-gradient-to-t from-zinc-950/80 to-transparent w-full">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2.5 px-3 py-1.5 lg:p-0 rounded-full cursor-pointer select-none group transition-all duration-300">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-zinc-500 via-zinc-200 to-zinc-600 p-[1px] relative transition-all duration-300 group-hover:scale-105">
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
                  {/* Mobile/Open Drawer Display Name */}
                  <span className="lg:hidden text-xs font-semibold text-zinc-300 group-hover:text-white transition-colors truncate max-w-[150px]">
                    {user?.displayName || 'Developer'}
                  </span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="right" sideOffset={12} className="w-52 bg-zinc-900/95 border border-white/10 text-zinc-300 rounded-xl shadow-2xl p-1 z-[100] backdrop-blur-md">
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
                
                <DropdownMenuSeparator className="bg-white/5 my-1" />
                
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-300 rounded-lg transition-colors py-2 px-2.5 mb-0.5">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-semibold text-xs">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login" onClick={onClose} className="flex items-center gap-2.5 px-3 py-1.5 lg:p-0 rounded-full cursor-pointer select-none group transition-all duration-300">
              <div className="h-8 w-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-brand-500/50 group-hover:bg-zinc-800">
                <LogIn className="h-4 w-4 text-zinc-400 group-hover:text-brand-500 transition-colors" />
              </div>
              <span className="lg:hidden text-xs font-semibold text-zinc-400 group-hover:text-white transition-colors truncate max-w-[150px]">
                Sign In
              </span>
            </Link>
          )}
        </div>
      )}

      {pathname === '/' && (
        <div className="shrink-0 pb-6 pt-4 px-2 lg:px-0 flex flex-col items-center bg-gradient-to-t from-zinc-950/80 to-transparent h-12" />
      )}

    </aside>
  );
}
