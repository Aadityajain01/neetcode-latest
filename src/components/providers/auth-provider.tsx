'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useAuthStore } from '@/store/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const auth = getAuth();
  const { setInitialized } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setInitialized(true);

      // ❗ DO NOT call backend here
      // Backend sync happens ONLY during login/register
    });

    return unsubscribe;
  }, [auth, setInitialized]);

  return <>{children}</>;
}
