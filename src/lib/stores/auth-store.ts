import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/lib/schemas/auth";
import { isApiEnabled } from "@/lib/api/config";
import { apiLogin, apiLogout } from "@/lib/api/services/auth";
import { apiFetchMe } from "@/lib/api/services/auth-me";
import { toAppUser } from "@/lib/api/mappers/auth-user";

interface AuthState {
  user: User | null;
  returnUrl: string | null;
  setReturnUrl: (url: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Après changement du mot de passe provisoire — débloque l’application. */
  markPasswordChanged: () => void;
  /** Recharge le profil depuis `/auth/me` et met à jour la session. */
  refreshProfile: () => Promise<void>;
  /** Met à jour les champs affichés du profil (nom, e-mail). */
  patchProfile: (patch: { name?: string; email?: string }) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      returnUrl: null,

      setReturnUrl: (returnUrl) => set({ returnUrl }),

      login: async (email, password) => {
        const user = await apiLogin(email, password);
        set({ user });
      },

      logout: async () => {
        const token = get().user?.token;
        if (isApiEnabled() && token) {
          await apiLogout(token);
        }
        set({ user: null, returnUrl: null });
      },

      markPasswordChanged: () => {
        const u = get().user;
        if (!u) {
          return;
        }
        set({ user: { ...u, mustChangePassword: false } });
      },

      refreshProfile: async () => {
        const u = get().user;
        if (!u?.token || !isApiEnabled()) {
          return;
        }
        const payload = await apiFetchMe();
        set({
          user: toAppUser(u.token, payload, {
            loginPasswordMatchesOrgDefault: false,
          }),
        });
      },

      patchProfile: (patch) => {
        const u = get().user;
        if (!u) {
          return;
        }
        set({
          user: {
            ...u,
            ...(patch.name !== undefined ? { name: patch.name } : {}),
            ...(patch.email !== undefined ? { email: patch.email } : {}),
          },
        });
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
