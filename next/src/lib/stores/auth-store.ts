import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { mockLogin } from "@/lib/mock-data/auth-mock";
import type { User } from "@/lib/schemas/auth";
import { isApiEnabled } from "@/lib/api/config";
import { apiLogin, apiLogout } from "@/lib/api/services/auth";

interface AuthState {
  user: User | null;
  returnUrl: string | null;
  setReturnUrl: (url: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      returnUrl: null,

      setReturnUrl: (returnUrl) => set({ returnUrl }),

      login: async (email, password) => {
        const user = isApiEnabled()
          ? await apiLogin(email, password)
          : await mockLogin(email, password);
        set({ user });
      },

      logout: async () => {
        const token = get().user?.token;
        if (isApiEnabled() && token) {
          await apiLogout(token);
        }
        set({ user: null, returnUrl: null });
      },
    }),
    {
      name: "meatmaster-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      skipHydration: true,
    },
  ),
);
