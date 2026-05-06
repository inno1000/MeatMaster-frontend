import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  ALL_PLATFORM_BUTCHERIES,
  PLATFORM_SUPPLIERS,
  getDefaultSupplierButcheries,
  isKnownSupplierEmail,
} from "@/lib/mock-data/platform-users";

const initialSupplierButcheries: Record<string, string[]> = Object.fromEntries(
  PLATFORM_SUPPLIERS.map((s) => [s.email.toLowerCase(), [...s.defaultButcheries]]),
);

type UserDirectoryState = {
  supplierButcheries: Record<string, string[]>;
  getSupplierButcheries: (email: string) => string[];
  setSupplierButcheries: (email: string, butcheries: string[]) => void;
  resetSupplierAssignments: () => void;
};

export const useUserDirectoryStore = create<UserDirectoryState>()(
  persist(
    (set, get) => ({
      supplierButcheries: { ...initialSupplierButcheries },

      getSupplierButcheries: (email: string) => {
        const key = email.trim().toLowerCase();
        const fromState = get().supplierButcheries[key];
        if (fromState) {
          return [...fromState];
        }
        return getDefaultSupplierButcheries(email);
      },

      setSupplierButcheries: (email: string, butcheries: string[]) => {
        const key = email.trim().toLowerCase();
        if (!isKnownSupplierEmail(key)) {
          return;
        }
        const allowed = new Set(ALL_PLATFORM_BUTCHERIES);
        const next = butcheries.filter((b) => allowed.has(b));
        set((s) => ({
          supplierButcheries: { ...s.supplierButcheries, [key]: next },
        }));
      },

      resetSupplierAssignments: () =>
        set({ supplierButcheries: { ...initialSupplierButcheries } }),
    }),
    {
      name: "meatmaster-user-directory",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ supplierButcheries: state.supplierButcheries }),
      skipHydration: true,
    },
  ),
);
