import { RequireRoles } from "@/components/layout/require-roles";
import type { ReactNode } from "react";

export default function ReportsSalesLayout({ children }: { children: ReactNode }) {
  return <RequireRoles roles={["butcher", "admin"]}>{children}</RequireRoles>;
}
