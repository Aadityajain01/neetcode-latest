'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { initialized, isAuthenticated, isLoading } = useAuthStore();

  // useEffect(() => {
  //   // Wait until auth state is fully resolved
  //   if (!initialized || isLoading) return;

  //   const publicRoutes = ['/login', '/register', '/'];
  //   const isPublic = publicRoutes.includes(window.location.pathname);

  //   // Redirect only when:
  //   // - auth is initialized
  //   // - not loading
  //   // - user is NOT authenticated
  //   // - route is protected
  //   if (!isAuthenticated && !isPublic) {
  //     router.replace('/login');
  //   }
  // }, [initialized, isAuthenticated, isLoading, router]);
  // In a top-level component or AuthProvider (client-side)
  const auth = getAuth();
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      // Get ID token and sync with backend
      const idToken = await fbUser.getIdToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      // Then redirect to dashboard
      router.push('/dashboard');
    }
  });
  return unsubscribe;
}, [router]);


  return <>{children}</>;
}
