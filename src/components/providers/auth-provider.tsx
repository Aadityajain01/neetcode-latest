'use client';

// Auth state is managed centrally in the Zustand store listener.
// This provider just wraps children.

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
