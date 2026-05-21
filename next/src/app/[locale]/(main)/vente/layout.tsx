import { RequireRoles } from "@/components/layout/require-roles";
import type { ReactNode } from "react";

/** Ventes : réservées au boucher (le fournisseur ne gère pas les ventes). */
export default function VenteLayout({ children }: { children: ReactNode }) {
  return <RequireRoles roles={["butcher"]}>{children}</RequireRoles>;
}
