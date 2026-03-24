import { create } from "zustand";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  reload,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
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
      console.info("[AUTH_CHECKPOINT] MANUAL_LOGOUT: started");
      // Tell the backend to destroy the Redis session and clear the cookie
      const { authApi } = await import("@/lib/api-modules");
      await authApi.logout().catch(() => {/* non-fatal */});

      await firebaseSignOut(auth);
      set({
        user: null,
        firebaseUser: null,
        token: null,
        isAuthenticated: false,
      });
      console.info("[AUTH_CHECKPOINT] MANUAL_LOGOUT: completed");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      set({ isLoading: false });
    }
  },
}));

// Global auth listener: restore from Firebase persisted auth state and
// sync the backend user via token-based login.
onAuthStateChanged(auth, async (firebaseUser) => {
  const store = useAuthStore.getState();
  store.setLoading(true);
  console.info("[AUTH_CHECKPOINT] AUTH_STATE_CHANGED", { hasFirebaseUser: !!firebaseUser });

  let activeUser = firebaseUser;

  // Firebase can transiently emit null during hydration on refresh.
  // Give it a brief window before treating the session as signed out.
  if (!activeUser) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    activeUser = auth.currentUser;
  }

  if (!activeUser) {
    console.warn("[AUTH_CHECKPOINT] AUTO_LOGOUT: firebase_user_null_after_grace");
    store.setFirebaseUser(null);
    store.setUser(null);
    store.setToken(null);
    store.setLoading(false);
    return;
  }

  // Force-reload the Firebase user to get the latest emailVerified flag
  try {
    await reload(activeUser);
  } catch (err) {
    console.error("Firebase user reload failed:", err);
  }

  // Email verification required.  Gmail users are auto-verified by Firebase.
  if (!activeUser.emailVerified) {
    console.warn("[AUTH_CHECKPOINT] AUTO_LOGOUT: email_not_verified");
    store.setFirebaseUser(null);
    store.setUser(null);
    store.setToken(null);
    store.setLoading(false);
    return;
  }

  // Get the Firebase ID token (used as Bearer token for other API calls)
  let token: string;
  try {
    token = await activeUser.getIdToken(false);
  } catch (err) {
    console.warn("[AUTH_CHECKPOINT] AUTO_LOGOUT: failed_to_get_id_token");
    console.error("Failed to get Firebase ID token:", err);
    store.setFirebaseUser(null);
    store.setUser(null);
    store.setToken(null);
    store.setLoading(false);
    return;
  }

  store.setToken(token);
  store.setFirebaseUser(activeUser);

  try {
    const { authApi } = await import("@/lib/api-modules");

    try {
      const res = await authApi.login(token);
      console.info("[AUTH_CHECKPOINT] LOGIN_SUCCESS: source=token_login", {
        userId: res.user.id,
        email: res.user.email,
      });
      store.setUser(res.user);
    } catch {
      // Retry once with a fresh token in case the cached token just expired.
      const freshToken = await activeUser.getIdToken(true);
      store.setToken(freshToken);
      const res = await authApi.login(freshToken);
      console.info("[AUTH_CHECKPOINT] LOGIN_SUCCESS: source=token_login_retry", {
        userId: res.user.id,
        email: res.user.email,
      });
      store.setUser(res.user);
    }
  } catch (err) {
    console.warn("[AUTH_CHECKPOINT] AUTO_LOGOUT: auth_state_sync_failed");
    console.error("Auth state sync failed:", err);
    store.setUser(null);
    store.setFirebaseUser(null);
    store.setToken(null);
  } finally {
    store.setLoading(false);
  }
});
