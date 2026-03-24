"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Code2, Trophy, Users, Shield,
  X, LogOut, ChevronRight, Zap, User, HelpCircle
} from 'lucide-react';
import Image from 'next/image';
import logo from '../../../public/logo.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onShowTutorial: () => void;
}

export default function Sidebar({ isOpen, onClose, onLogout, onShowTutorial }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/problems', label: 'Problem Set', icon: Code2 },
    { href: '/practice', label: 'Practice Arena', icon: Zap },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/communities', label: 'Communities', icon: Users },
    { href: '/profile', label: 'My Profile', icon: User },
  ];

  const adminNavItems = [
    { href: '/admin/problems', label: 'Manage Problems', icon: Shield },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
  ];

  const SidebarItem = ({ item, isActive, isAdminItem = false }: { item: any, isActive: boolean, isAdminItem?: boolean }) => {
    const activeColorStr = isAdminItem ? 'purple' : 'emerald';
    
    return (
      <Link href={item.href} onClick={onClose} className="block outline-none">
        <div className={cn(
          "group flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-300 mx-3 mb-1.5 relative overflow-hidden",
          isActive 
            ? isAdminItem 
              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_-5px_rgba(168,85,247,0.4)]" 
              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_-5px_rgba(16,185,129,0.4)]"
            : "text-zinc-400 border border-transparent hover:text-zinc-100 hover:bg-zinc-800/40 hover:border-zinc-700/50"
        )}>
          {/* Subtle Glow on Active */}
          {isActive && (
            <div className={cn(
              "absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full blur-[20px] pointer-events-none",
              isAdminItem ? "bg-purple-500/40" : "bg-emerald-500/40"
            )} />
          )}
          
          <item.icon className={cn(
            "h-[22px] w-[22px] shrink-0 transition-transform duration-300 group-hover:scale-110",
            isActive ? (isAdminItem ? "text-purple-400" : "text-emerald-400") : "text-zinc-500 group-hover:text-zinc-300"
          )} />
          
          <span className={cn(
            "font-semibold tracking-wide text-[13px] transition-all duration-300 whitespace-nowrap opacity-100",
            "lg:opacity-0 lg:w-0 lg:group-hover/sidebar:opacity-100 lg:group-hover/sidebar:w-auto",
            "ml-2" 
          )}>
            {item.label}
          </span>
          
          {isActive && (
            <ChevronRight className={cn(
              "ml-auto h-4 w-4 shrink-0 transition-opacity whitespace-nowrap lg:opacity-0 lg:group-hover/sidebar:opacity-50",
              isAdminItem ? "text-purple-400" : "text-emerald-400"
            )} />
          )}
        </div>
      </Link>
    );
  };

  return (
    <aside className={cn(
      "group/sidebar fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-500 ease-out",
      "bg-zinc-950/60 backdrop-blur-2xl border-r border-white/5 shadow-2xl lg:shadow-none",
      "w-72 lg:w-[88px] hover:w-72 overflow-hidden",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      
      {/* ── Logo Area ── */}
      <div className="h-24 flex items-center gap-4 px-6 shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="relative h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center bg-zinc-900 border border-white/10 shadow-lg overflow-hidden group-hover/sidebar:scale-105 transition-transform duration-500">
          <Image src={logo} alt="NeetCode Logo" fill sizes="40px" className="object-cover" />
        </div>
        <div className="overflow-hidden transition-all duration-500 lg:w-0 lg:opacity-0 lg:group-hover/sidebar:w-auto lg:group-hover/sidebar:opacity-100">
          <h1 className="font-black text-xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200 whitespace-nowrap">
            NeetCode
          </h1>
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden ml-auto shrink-0 text-zinc-400 hover:text-white" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* ── Scrollable Nav ── */}
      <ScrollArea className="flex-1 py-4">
        <div className="mb-4 px-6 text-[10px] font-bold text-zinc-500/70 uppercase tracking-widest overflow-hidden lg:h-0 lg:opacity-0 lg:group-hover/sidebar:h-auto lg:group-hover/sidebar:opacity-100 transition-all duration-500 whitespace-nowrap">
          Platform
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.href} 
              item={item} 
              isActive={pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href + '/'))} 
            />
          ))}
        </nav>

        {isAdmin && (
          <div className="mt-10 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="mb-4 px-6 flex items-center gap-2 text-[10px] font-bold text-purple-500/70 uppercase tracking-widest overflow-hidden lg:h-0 lg:opacity-0 lg:group-hover/sidebar:h-auto lg:group-hover/sidebar:opacity-100 transition-all duration-500 whitespace-nowrap">
              <Shield className="h-3.5 w-3.5 shrink-0" /> Admin Zone
            </div>
            <nav className="space-y-1">
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

      {/* ── Footer Area ── */}
      <div className="shrink-0 pb-6 pt-4 px-3 bg-gradient-to-t from-zinc-950/80 to-transparent">
        
        {/* Help / Tutorial Button */}
        <div className="mb-4 px-2">
          <button 
            onClick={onShowTutorial}
            className="flex items-center justify-center lg:justify-start gap-3 w-full px-2 py-2.5 text-[13px] font-semibold text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all duration-300 group outline-none"
          >
            <HelpCircle className="h-[22px] w-[22px] shrink-0 group-hover:scale-110 transition-transform duration-300" />
            <span className="lg:w-0 lg:opacity-0 lg:group-hover/sidebar:w-auto lg:group-hover/sidebar:opacity-100 transition-all duration-500 whitespace-nowrap">
              How to use
            </span>
          </button>
        </div>

        {/* User Profile */}
        <div className="overflow-hidden">
          <div className="flex items-center lg:justify-center group-hover/sidebar:justify-start gap-3 p-2 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-zinc-700/50 hover:bg-zinc-800/50 transition-all duration-500 group relative">
            <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer outline-none">
              <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] relative overflow-hidden group-hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.5)] transition-shadow duration-300">
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                <div className="h-full w-full rounded-[11px] bg-zinc-950 flex items-center justify-center text-emerald-400 font-bold text-sm">
                  {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
              </div>
              <div className="flex-1 min-w-0 lg:w-0 lg:opacity-0 lg:group-hover/sidebar:w-auto lg:group-hover/sidebar:opacity-100 transition-all duration-500">
                <p className="text-[13px] font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                  {user?.displayName || 'Developer'}
                </p>
                <p className="text-[11px] font-medium text-zinc-500 truncate mt-0.5">{user?.email}</p>
              </div>
            </Link>

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 shrink-0 text-zinc-500 hover:text-white hover:bg-red-500 hover:shadow-[0_0_15px_-3px_rgba(239,68,68,0.5)] rounded-xl transition-all duration-300 lg:w-0 lg:opacity-0 lg:group-hover/sidebar:w-10 lg:group-hover/sidebar:opacity-100 z-10 overflow-hidden"
              onClick={onLogout}
              title="Logout"
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
            </Button>
          </div>
        </div>
      </div>

    </aside>
  );
}