import { redirect } from "next/navigation";

/** Entrée `/` : l’export statique ne peut pas exécuter le middleware next-intl. */
export default function RootPage() {
  redirect("/fr");
}
