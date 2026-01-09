import { create } from "zustand";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: "admin" | "user";
}

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialized: boolean;
  setInitialized: (value: boolean) => void;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  firebaseUser: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  initialized: false,


  
  setInitialized: (value: boolean) => set({ initialized: value }),
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setFirebaseUser: (firebaseUser) => set({ firebaseUser, initialized: true }),
  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    set({ isLoading: true });
    try {
      await firebaseSignOut(auth);

      set({
        user: null,
        firebaseUser: null,
        token: null,
        isAuthenticated: false,
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      set({ isLoading: false });
    }
  },
}));

// --------------------------------------------------
// 🔐 GLOBAL AUTH LISTENER (Stable & Race-Safe)
onAuthStateChanged(auth, async (firebaseUser) => {
  const store = useAuthStore.getState();

  // User logged out
  if (!firebaseUser) {
    store.setFirebaseUser(null);
    store.setUser(null);
    store.setToken(null);
    store.setLoading(false);
    return;
  }

  // Block unverified users
  if (!firebaseUser.emailVerified) {
    store.setFirebaseUser(null);
    store.setUser(null);
    store.setToken(null);
    store.setLoading(false);
    return;
  }

  try {
    const token = await firebaseUser.getIdToken(true);

    // ✅ ONLY store Firebase state
    store.setToken(token);
    store.setFirebaseUser(firebaseUser);

  } catch (err) {
    console.error("Auth state sync failed:", err);
  } finally {
    store.setLoading(false);
  }
});