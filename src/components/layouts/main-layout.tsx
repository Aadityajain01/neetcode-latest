'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Code2,
  BookOpen,
  Target,
  Trophy,
  Users,
  User,
  Settings,
  Shield,
  Menu,
  X,
  LogOut,
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
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/problems', label: 'DSA Problems', icon: Code2 },
    { href: '/practice', label: 'Practice', icon: BookOpen },
    { href: '/mcqs', label: 'MCQs', icon: Target },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/communities', label: 'Communities', icon: Users },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const adminNavItems = [
    { href: '/admin/problems', label: 'Manage Problems', icon: Shield },
    { href: '/admin/mcqs', label: 'Manage MCQs', icon: Shield },
    { href: '/admin/submissions', label: 'Rejudge', icon: Shield },
  ];

  const isAdmin = user?.role === 'admin';
// useEffect(() => {
//   if (isAdmin && !pathname.startsWith('/admin')) {
//     router.push('/admin');
//   }
// }, [isAdmin, pathname, router]);

  return (
    <div className="min-h-screen bg-[#0F172A] flex">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-[#1E293B] border-[#334155] text-[#E5E7EB]"
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40 w-72 bg-[#111827] border-r border-[#334155]
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <ScrollArea className="h-full py-6">
          <div className="px-6 mb-6">
            <h1 className="text-2xl font-bold text-[#E5E7EB]">NeetCode</h1>
          </div>

          <nav className="space-y-2 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={`w-full justify-start gap-3 ${
                      isActive
                        ? 'bg-[#22C55E] text-white hover:bg-[#22C55E]/90'
                        : 'text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#1E293B]'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {isAdmin && (
            <>
              <Separator className="my-4 bg-[#334155]" />
              <div className="px-3 mb-2">
                <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                  Admin
                </p>
              </div>
              <nav className="space-y-2 px-3">
                {adminNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={`w-full justify-start gap-3 ${
                          isActive
                            ? 'bg-[#A855F7] text-white hover:bg-[#A855F7]/90'
                            : 'text-[#9CA3AF] hover:text-[#E5E7EB] hover:bg-[#1E293B]'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </nav>
            </>
          )}

          <Separator className="my-4 bg-[#334155]" />

          <div className="px-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-[#EF4444] hover:text-[#DC2626] hover:bg-[#7F1D1D]/20"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </div>
        </ScrollArea>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 lg:ml-0 min-h-screen">
        <div className="container mx-auto px-4 py-8 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
