import { redirect } from "@/i18n/navigation";

/** Ancienne page « Plateforme » : redirection vers la liste des utilisateurs. */
export default async function AdminPlatformRedirectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect({ href: "/admin/users/list", locale });
}
