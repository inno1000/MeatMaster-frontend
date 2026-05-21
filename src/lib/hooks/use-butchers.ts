"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { formatError } from "@/lib/format-error";
import type { ButcherFormInput } from "@/lib/schemas/butcher";
import { isApiEnabled } from "@/lib/api/config";
import { boucherieV1 } from "@/lib/api/services/boucherie-v1";
import { unwrapDataArray } from "@/lib/api/unwrap";
import { mapApiBoucherieRow } from "@/lib/api/mappers/boucherie-record";

const fetchButchers = async () => {
  const raw = await boucherieV1.boucheries.list();
  return unwrapDataArray(raw).map(mapApiBoucherieRow);
};

const createButcher = async (body: ButcherFormInput) => {
  return boucherieV1.boucheries.create({
    nom: body.name,
    adresse: body.address,
    ville: body.city,
    telephone: body.phone,
    actif: true,
  });
};

export const useButchers = () => {
  return useQuery({
    queryKey: ["butchers"],
    queryFn: fetchButchers,
    enabled: isApiEnabled(),
  });
};

export const useCreateButcher = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("boucherie");

  return useMutation({
    mutationKey: ["butchers", "create"],
    mutationFn: (body: ButcherFormInput) => createButcher(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["butchers"] });
      toast.success(t("toastOk"));
    },
    onError: (e) => {
      toast.error(formatError(e));
    },
  });
};
