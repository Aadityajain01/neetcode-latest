'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils'; // Make sure you have this util, or remove if standard classNames
import {
  LayoutDashboard,
  Code2,
  BookOpen,
  Trophy,
  Users,
  Settings,
  Shield,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/'); // Redirect to login, not home, usually better UX
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/problems', label: 'Problem Set', icon: Code2 },
    { href: '/practice', label: 'Practice Arena', icon: Zap },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/communities', label: 'Communities', icon: Users },
  ];

  const adminNavItems = [
    { href: '/admin/problems', label: 'Manage Problems', icon: Shield },
    { href: '/admin/users', label: 'Manage Users', icon: Users },
  ];

  const isAdmin = user?.role === 'admin';

  const SidebarItem = ({ item, isActive, isAdminItem = false }: { item: any, isActive: boolean, isAdminItem?: boolean }) => (
    <Link href={item.href} onClick={() => setSidebarOpen(false)}>
      <div className={cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 mx-2 mb-1 relative overflow-hidden",
        isActive 
          ? isAdminItem 
            ? "bg-purple-500/10 text-purple-400" 
            : "bg-emerald-500/10 text-emerald-400"
          : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
      )}>
        {/* Active Indicator Bar */}
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
    <div className="flex min-h-screen bg-zinc-950 overflow-hidden text-zinc-100 font-sans selection:bg-emerald-500/30">
      
      {/* Mobile Menu Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-zinc-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col transition-transform duration-300 ease-out lg:translate-x-0 shadow-2xl lg:shadow-none",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        {/* Logo Area */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/5 bg-zinc-900/50">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">NeetCode</h1>
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Premium</p>
          </div>
          {/* Close button for mobile */}
          <Button variant="ghost" size="icon" className="lg:hidden ml-auto text-zinc-400" onClick={() => setSidebarOpen(false)}>
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

        {/* User Profile Footer */}
        <div className="p-4 border-t border-white/5 bg-zinc-900/30">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-zinc-800/50 border border-white/5 hover:border-emerald-500/30 transition-colors group">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 font-bold text-sm">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.displayName || 'Developer'}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

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
    </div>
  );
}