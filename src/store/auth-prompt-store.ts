import { create } from "zustand";

interface AuthPromptState {
  isOpen: boolean;
  message: string;
  onConfirmRedirect?: () => void;
  openAuthPrompt: (message?: string, onConfirmRedirect?: () => void) => void;
  closeAuthPrompt: () => void;
}

export const useAuthPromptStore = create<AuthPromptState>((set) => ({
  isOpen: false,
  message: "Please sign in to continue",
  onConfirmRedirect: undefined,
  openAuthPrompt: (message = "Please sign in to continue", onConfirmRedirect) =>
    set({ isOpen: true, message, onConfirmRedirect }),
  closeAuthPrompt: () => set({ isOpen: false, onConfirmRedirect: undefined }),
}));
