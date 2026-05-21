import { apiUrl } from "@/lib/api/client";
import {
  ButchersListSchema,
  type ButcherFormInput,
} from "@/lib/schemas/butcher";
import { z } from "zod";

const UnknownSchema = z.unknown();

export const butchersApi = {
  listUrl: () => apiUrl("/butchers"),
  createUrl: () => apiUrl("/butchers"),
  listSchema: ButchersListSchema,
  createResponseSchema: UnknownSchema,
};

export type ButcherCreatePayload = ButcherFormInput;
