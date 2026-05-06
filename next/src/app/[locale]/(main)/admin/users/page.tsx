"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import {
  ALL_PLATFORM_BUTCHERIES,
  PLATFORM_SUPPLIERS,
  getDefaultSupplierButcheries,
} from "@/lib/mock-data/platform-users";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useUserDirectoryStore } from "@/lib/stores/user-directory-store";

const OTHER_ACCOUNTS = [
  { email: "boucher@meatmaster.local", role: "butcher" as const, name: "Boucher Demo" },
  { email: "admin@meatmaster.local", role: "admin" as const, name: "Administrateur" },
];

function sortList(a: string[], b: string[]) {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
}

type SupplierCardProps = {
  email: string;
  name: string;
};

function SupplierAssignmentCard({ email, name }: SupplierCardProps) {
  const t = useTranslations("admin");
  const setSupplierButcheries = useUserDirectoryStore((s) => s.setSupplierButcheries);
  const rawFromStore = useUserDirectoryStore(
    (s) => s.supplierButcheries[email.toLowerCase()],
  );
  const defaultButcheries = useMemo(
    () => getDefaultSupplierButcheries(email),
    [email],
  );
  const savedButcheries = rawFromStore ?? defaultButcheries;

  const [draft, setDraft] = useState<string[]>(() =>
    getDefaultSupplierButcheries(email),
  );

  useEffect(() => {
    setDraft(savedButcheries);
  }, [savedButcheries]);

  const dirty = useMemo(
    () => !sortList(draft, savedButcheries),
    [draft, savedButcheries],
  );

  const toggle = (butchery: string) => {
    setDraft((prev) =>
      prev.includes(butchery) ? prev.filter((b) => b !== butchery) : [...prev, butchery],
    );
  };

  const handleSave = () => {
    if (draft.length === 0) {
      toast.error(t("assignAtLeastOne"));
      return;
    }
    setSupplierButcheries(email, draft);
    const u = useAuthStore.getState().user;
    if (u?.email.toLowerCase() === email.toLowerCase()) {
      useAuthStore.setState({ user: { ...u, butcheries: [...draft] } });
    }
    toast.success(t("toastAssignmentsSaved"));
  };

  const handleCancel = () => {
    setDraft(savedButcheries);
  };

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3 space-y-1">
        <p className="font-medium">{name}</p>
        <p className="text-xs text-muted-foreground sm:text-sm">{email}</p>
      </div>
      <p className="mb-2 text-xs font-medium text-muted-foreground sm:text-sm">
        {t("assignButcheriesLabel")}
      </p>
      <ul className="space-y-2">
        {ALL_PLATFORM_BUTCHERIES.map((b) => {
          const id = `${email}-${b}`;
          return (
            <li key={b}>
              <label
                htmlFor={id}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-transparent px-1 py-1.5 tap-highlight-transparent hover:bg-muted/60"
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={draft.includes(b)}
                  onChange={() => {
                    toggle(b);
                  }}
                  className="h-5 w-5 shrink-0 rounded border-input accent-primary"
                />
                <span className="text-sm leading-tight">{b}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" onClick={handleSave} disabled={!dirty}>
          {t("saveAssignments")}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={!dirty}
        >
          {t("cancelAssignments")}
        </Button>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const resetSupplierAssignments = useUserDirectoryStore((s) => s.resetSupplierAssignments);

  const handleResetAll = () => {
    resetSupplierAssignments();
    const u = useAuthStore.getState().user;
    if (u?.role === "supplier") {
      const fresh = useUserDirectoryStore.getState().getSupplierButcheries(u.email);
      useAuthStore.setState({ user: { ...u, butcheries: fresh } });
    }
    toast.success(t("toastAssignmentsReset"));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("usersTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("usersSubtitle")}</p>
      </div>

      <ParentCard title={t("suppliersSectionTitle")}>
        <p className="mb-4 text-sm text-muted-foreground">{t("assignHint")}</p>
        <div className="space-y-4">
          {PLATFORM_SUPPLIERS.map((s) => (
            <SupplierAssignmentCard key={s.email} email={s.email} name={s.name} />
          ))}
        </div>
        <div className="mt-6 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={handleResetAll}>
            {t("resetAllAssignments")}
          </Button>
        </div>
      </ParentCard>

      <ParentCard title={t("otherAccountsTitle")}>
        <div className="space-y-3">
          {OTHER_ACCOUNTS.map((u) => (
            <div key={u.email} className="rounded-lg border border-border p-3 text-sm">
              <p className="font-medium">{u.name}</p>
              <p className="text-muted-foreground">{u.email}</p>
              <p className="mt-1 text-muted-foreground">
                {t("roleLabel")}: {u.role}
              </p>
            </div>
          ))}
        </div>
      </ParentCard>
    </div>
  );
}
