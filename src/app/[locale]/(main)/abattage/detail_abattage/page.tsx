"use client";

import { withLocaleParams } from "@/lib/with-locale-params";

import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AbattageDetailView } from "@/components/features/abattage-detail-view";
import { boucherieV1 } from "@/lib/api";
import { mapAbattageDetailFromApi } from "@/lib/api/mappers/abattage-detail";
import { formatError } from "@/lib/format-error";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

function AbattageDetailPage() {
  const t = useTranslations("abattage");
  const searchParams = useSearchParams();
  const id = searchParams.get("id")?.trim() ?? "";

  const detailQuery = useQuery({
    queryKey: ["abattage", id],
    enabled: id.length > 0,
    queryFn: async () => {
      const raw = await boucherieV1.abattages.get(id);
      return mapAbattageDetailFromApi(raw);
    },
  });

  if (!id) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Identifiant d&apos;abattage manquant. Ouvrez le détail depuis la liste
          des distributions.
        </p>
        <Button type="button" variant="outline" asChild>
          <Link href="/abattage/liste">{t("listTitle")}</Link>
        </Button>
      </div>
    );
  }

  if (detailQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">
          {formatError(detailQuery.error ?? new Error("Abattage introuvable"))}
        </p>
        <Button type="button" variant="outline" asChild>
          <Link href="/abattage/liste">{t("listTitle")}</Link>
        </Button>
      </div>
    );
  }

  return <AbattageDetailView detail={detailQuery.data} />;
}

export default withLocaleParams(AbattageDetailPage);
