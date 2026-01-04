import { create } from 'zustand';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialized: boolean;

  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  firebaseUser: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  initialized: false,

  setToken: (token) => set({ token }),

  setUser: (user) => set({ user, isAuthenticated: true }),

  setFirebaseUser: (firebaseUser) => set({ firebaseUser, initialized: true }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    set({ isLoading: true });
    try {
      await firebaseSignOut(auth);
      set({ user: null, firebaseUser: null, token: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));

onAuthStateChanged(auth, async (firebaseUser) => {
  const store = useAuthStore.getState();

  if (!firebaseUser) {
    store.setFirebaseUser(null);
    store.setLoading(false);
    return;
  }

  try {
    const token = await firebaseUser.getIdToken(true);
    const res = await api.post('/auth/login', { idToken: token });

    store.setFirebaseUser(firebaseUser);
    store.setUser(res.data.user);
    store.setToken(token);
  } catch (err) {
    console.error("Login sync failed:", err);
  } finally {
    store.setLoading(false);
  }
});

