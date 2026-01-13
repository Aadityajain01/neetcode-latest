"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Code2,
  Trophy,
  Users,
  Shield,
  X,
  LogOut,
  ChevronRight,
  Zap,
  User,
  HelpCircle
} from 'lucide-react';
import Image from 'next/image';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onShowTutorial: () => void; // <--- Trigger for the tutorial
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

  const SidebarItem = ({ item, isActive, isAdminItem = false }: { item: any, isActive: boolean, isAdminItem?: boolean }) => (
    <Link href={item.href} onClick={onClose}>
      <div className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 mx-2 mb-1 relative overflow-hidden",
        isActive 
          ? isAdminItem 
            ? "bg-purple-500/10 text-purple-400" 
            : "bg-emerald-500/10 text-emerald-400"
          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
      )}>
        {isActive && (
          <div className={cn(
            "absolute left-0 top-0 bottom-0 w-1",
            isAdminItem ? "bg-purple-500" : "bg-emerald-500"
          )} />
        )}
        
        <item.icon className={cn(
          "h-5 w-5 transition-transform group-hover:scale-110",
          isActive ? (isAdminItem ? "text-purple-400" : "text-emerald-400") : "text-zinc-500 group-hover:text-zinc-300"
        )} />
        
        <span className="font-medium text-sm">{item.label}</span>
        
        {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
      </div>
    </Link>
  );

  return (
    <aside className={cn(
      "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-zinc-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 shadow-2xl lg:shadow-none",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      
      {/* Logo Area */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-white/5 bg-zinc-900/50">
        <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Image src="/favicon.ico" alt="Logo" width={20} height={20} className="invert brightness-0" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-white">NeetCode</h1>
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden ml-auto text-zinc-400" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scrollable Nav Content */}
      <ScrollArea className="flex-1 py-6 px-2">
        <div className="mb-2 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Platform</div>
        <nav className="space-y-0.5">
          {navItems.map((item) => (
            <SidebarItem 
              key={item.href} 
              item={item} 
              isActive={pathname === item.href || pathname?.startsWith(item.href + '/')} 
            />
          ))}
        </nav>

        {isAdmin && (
          <div className="mt-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="mb-2 px-4 flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
              <Shield className="h-3 w-3" /> Admin Zone
            </div>
            <nav className="space-y-0.5">
              {adminNavItems.map((item) => (
                <SidebarItem 
                  key={item.href} 
                  item={item} 
                  isActive={pathname === item.href}
                  isAdminItem={true}
                />
              ))}
            </nav>
          </div>
        )}
      </ScrollArea>

      {/* --- Footer Area --- */}
      <div className="border-t border-white/5 bg-zinc-900/30">
        {/* Help / Tutorial Button */}
        <div className="px-4 pt-4 pb-2">
            <button 
                onClick={onShowTutorial}
                className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800/50 rounded-lg transition-all group"
            >
                <HelpCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>How to use</span>
            </button>
        </div>

        {/* User Profile */}
        <div className="p-4">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-800/50 border border-white/5 hover:border-emerald-500/30 transition-colors group relative">
            <Link href="/profile" className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 font-bold text-sm overflow-hidden">
                {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-emerald-400 transition-colors">
                  {user?.displayName || 'Developer'}
                </p>
                <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
              </div>
            </Link>

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors z-10"
              onClick={onLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}