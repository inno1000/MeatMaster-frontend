import { RequireRoles } from "@/components/layout/require-roles";
import type { ReactNode } from "react";

export default function ReportsStocksLayout({ children }: { children: ReactNode }) {
  return <RequireRoles roles={["butcher", "admin"]}>{children}</RequireRoles>;
}
