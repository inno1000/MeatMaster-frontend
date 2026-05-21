"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link2 } from "lucide-react";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { boucherieV1 } from "@/lib/api";
import { extractBoucherieIdsFromUserSrc } from "@/lib/api/services/auth";
import { toggleBoucherieId } from "@/lib/admin/users-forms";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";

function AdminSupplierButcheriesPage() {
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, string[]>>(
    {},
  );

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => unwrapDataArray(await boucherieV1.users.list()),
  });
  const butcheriesQuery = useQuery({
    queryKey: ["admin", "boucheries"],
    queryFn: async () => unwrapDataArray(await boucherieV1.boucheries.list()),
  });

  const butcheriesById = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of butcheriesQuery.data ?? []) {
      const b = item as { id?: unknown; nom?: unknown; name?: unknown };
      const id = String(b.id ?? "");
      const name = String(b.nom ?? b.name ?? "");
      if (id) {
        map.set(id, name || "Boucherie");
      }
    }
    return map;
  }, [butcheriesQuery.data]);

  const saveAssignment = async (user: Record<string, unknown>) => {
    const userId = String(user.id ?? "");
    if (!userId) {
      return;
    }
    const ids =
      assignmentDrafts[userId] ?? extractBoucherieIdsFromUserSrc(user);
    try {
      await boucherieV1.users.update(userId, {
        name: String(user.name ?? ""),
        email: String(user.email ?? ""),
        role: String(user.role ?? "fournisseur"),
        boucherie_ids: ids,
      });
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Affectation mise à jour.");
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("pageSupplierButcheriesTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">
          {t("pageSupplierButcheriesSubtitle")}
        </p>
      </div>

      <ParentCard title={t("pageSupplierButcheriesTitle")} titleIcon={Link2}>
        <div className="space-y-3">
          {(usersQuery.data ?? [])
            .filter((item) => {
              const u = item as Record<string, unknown>;
              const role = String(u.role ?? "");
              return (
                role === "caissier" ||
                role === "fournisseur" ||
                role === "supplier"
              );
            })
            .map((item) => {
              const u = item as Record<string, unknown>;
              const userId = String(u.id ?? "");
              const selectedIds =
                assignmentDrafts[userId] ?? extractBoucherieIdsFromUserSrc(u);
              const currentLabels =
                selectedIds.length === 0
                  ? "Aucune"
                  : selectedIds
                      .map((bid) => butcheriesById.get(bid) ?? tCommon("noLabel"))
                      .join(", ");
              return (
                <div
                  key={String(u.id ?? u.email ?? "")}
                  className="rounded-lg border border-border p-3 text-sm"
                >
                  <p className="font-medium">{String(u.name ?? "—")}</p>
                  <p className="text-muted-foreground">{String(u.email ?? "—")}</p>
                  <p className="mt-1 text-muted-foreground">
                    {t("roleLabel")}: {String(u.role ?? "—")}
                  </p>
                  <p className="text-muted-foreground">
                    Boucheries desservies : {currentLabels}
                  </p>
                  <div className="mt-3 space-y-2">
                    <Label htmlFor={`assign-${userId}`}>Modifier les boucheries</Label>
                    <div
                      id={`assign-${userId}`}
                      className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-md border border-border p-3"
                    >
                      {(butcheriesQuery.data ?? []).map((bItem) => {
                        const b = bItem as {
                          id?: unknown;
                          nom?: unknown;
                          name?: unknown;
                        };
                        const bid = String(b.id ?? "");
                        const blabel = String(b.nom ?? b.name ?? "Boucherie");
                        return (
                          <label
                            key={bid || blabel}
                            className="flex cursor-pointer items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              className="size-4 accent-primary"
                              checked={selectedIds.includes(bid)}
                              onChange={(event) => {
                                const next = toggleBoucherieId(
                                  assignmentDrafts[userId] ??
                                    extractBoucherieIdsFromUserSrc(u),
                                  bid,
                                  event.target.checked,
                                );
                                setAssignmentDrafts((prev) => ({
                                  ...prev,
                                  [userId]: next,
                                }));
                              }}
                            />
                            {blabel}
                          </label>
                        );
                      })}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => void saveAssignment(u)}
                    >
                      Enregistrer l'affectation
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      </ParentCard>
    </div>
  );
}

export default withLocaleParams(AdminSupplierButcheriesPage);
