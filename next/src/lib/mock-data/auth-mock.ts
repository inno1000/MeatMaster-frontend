import type { User } from "@/lib/schemas/auth";
import { ALL_PLATFORM_BUTCHERIES, PLATFORM_SUPPLIERS } from "@/lib/mock-data/platform-users";
import { useUserDirectoryStore } from "@/lib/stores/user-directory-store";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const accounts: Record<string, User & { password: string }> = {
  "boucher@meatmaster.local": {
    token: "mock-jwt-butcher",
    email: "boucher@meatmaster.local",
    password: "123456",
    name: "Boucher Demo",
    role: "butcher",
    butcheries: ["Boucherie Halal"],
  },
  ...Object.fromEntries(
    PLATFORM_SUPPLIERS.map((s) => [
      s.email,
      {
        token: s.token,
        email: s.email,
        password: "123456",
        name: s.name,
        role: "supplier" as const,
        butcheries: [...s.defaultButcheries],
      },
    ]),
  ),
  "admin@meatmaster.local": {
    token: "mock-jwt-admin",
    email: "admin@meatmaster.local",
    password: "123456",
    name: "Administrateur",
    role: "admin",
    butcheries: [...ALL_PLATFORM_BUTCHERIES],
  },
};

export const mockLogin = async (
  email: string,
  password: string,
): Promise<User> => {
  await delay(350);

  const trimmedEmail = email.trim();
  if (!trimmedEmail || !password) {
    throw new Error("E-mail et mot de passe requis.");
  }

  const key = trimmedEmail.toLowerCase();
  const account = accounts[key];
  if (!account || account.password !== password) {
    throw new Error("Identifiants invalides.");
  }

  const { password: _password, ...user } = account;

  if (user.role === "supplier") {
    return {
      ...user,
      butcheries: useUserDirectoryStore.getState().getSupplierButcheries(key),
    };
  }

  return user;
};
