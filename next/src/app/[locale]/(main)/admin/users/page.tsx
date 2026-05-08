"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ParentCard } from "@/components/shared/parent-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { boucherieV1 } from "@/lib/api";
import { formatError } from "@/lib/format-error";
import { unwrapDataArray } from "@/lib/api/unwrap";

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("boucher");
  const [boucherieId, setBoucherieId] = useState("");

  const usersQuery = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => unwrapDataArray(await boucherieV1.users.list()),
  });

  const createUser = async () => {
    try {
      await boucherieV1.users.create({
        name,
        email,
        password,
        role,
        boucherie_id: boucherieId || undefined,
      });
      setName("");
      setEmail("");
      setPassword("");
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("Utilisateur créé.");
    } catch (error) {
      toast.error(formatError(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold sm:text-2xl">{t("usersTitle")}</h1>
        <p className="text-sm text-muted-foreground sm:text-base">{t("usersSubtitle")}</p>
      </div>

      <ParentCard title={t("suppliersSectionTitle")}>
        <p className="mb-4 text-sm text-muted-foreground">
          Source API `/api/v1/users` (plus de store local).
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rôle API</Label>
            <Input id="role" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="boucherieId">Boucherie ID</Label>
            <Input
              id="boucherieId"
              value={boucherieId}
              onChange={(e) => setBoucherieId(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4">
          <Button type="button" onClick={() => void createUser()}>
            Créer utilisateur
          </Button>
        </div>
      </ParentCard>

      <ParentCard title="Liste utilisateurs">
        <div className="space-y-3">
          {(usersQuery.data ?? []).map((item) => {
            const u = item as Record<string, unknown>;
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
                  Boucherie: {String(u.boucherie_id ?? "—")}
                </p>
              </div>
            );
          })}
        </div>
      </ParentCard>
    </div>
  );
}
