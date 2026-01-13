import { create } from 'zustand';

interface UIStore {
  isTutorialOpen: boolean;
  openTutorial: () => void;
  closeTutorial: () => void;
  // This action checks if it's the first time, then opens
  triggerTutorialIfFirstTime: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isTutorialOpen: false,
  openTutorial: () => set({ isTutorialOpen: true }),
  closeTutorial: () => set({ isTutorialOpen: false }),
  triggerTutorialIfFirstTime: () => {
    if (typeof window !== 'undefined') {
      const hasSeen = localStorage.getItem("hasSeenTutorial");
      if (!hasSeen) {
        set({ isTutorialOpen: true });
      }
    }
  }
}));