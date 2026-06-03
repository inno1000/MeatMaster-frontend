import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PreferencesState {
  simpleMode: boolean;
  setSimpleMode: (enabled: boolean) => void;
  toggleSimpleMode: () => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      simpleMode: false,
      setSimpleMode: (enabled) => set({ simpleMode: enabled }),
      toggleSimpleMode: () => set({ simpleMode: !get().simpleMode }),
    }),
    {
      name: "meatmaster-preferences",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ simpleMode: state.simpleMode }),
    },
  ),
);
