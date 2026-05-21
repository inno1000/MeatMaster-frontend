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

export type CreateButcherPayload = ButcherFormInput & {
  attachmentIds?: string[];
};

const fetchButchers = async () => {
  const raw = await boucherieV1.boucheries.list();
  return unwrapDataArray(raw).map(mapApiBoucherieRow);
};

const createButcher = async (body: CreateButcherPayload) => {
  const { attachmentIds, ...fields } = body;
  return boucherieV1.boucheries.create({
    nom: fields.nom,
    adresse: fields.adresse,
    ville: fields.ville,
    telephone: fields.telephone,
    actif: true,
    ...(attachmentIds && attachmentIds.length > 0
      ? { attachment_ids: attachmentIds }
      : {}),
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
    mutationFn: (body: CreateButcherPayload) => createButcher(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["butchers"] });
      toast.success(t("toastOk"));
    },
    onError: (e) => {
      toast.error(formatError(e));
    },
  });
};
