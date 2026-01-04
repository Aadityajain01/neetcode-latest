'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { initialized, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Wait until auth state is fully resolved
    if (!initialized || isLoading) return;

    const publicRoutes = ['/login', '/register', '/'];
    const isPublic = publicRoutes.includes(window.location.pathname);

    // Redirect only when:
    // - auth is initialized
    // - not loading
    // - user is NOT authenticated
    // - route is protected
    if (!isAuthenticated && !isPublic) {
      router.replace('/login');
    }
  }, [initialized, isAuthenticated, isLoading, router]);

  return <>{children}</>;
}
