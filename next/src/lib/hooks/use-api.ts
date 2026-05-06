"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { z } from "zod";
import { apiClient } from "@/lib/api/client";

export const useApiQuery = <T>(
  options: {
    queryKey: unknown[];
    url: string;
    schema: z.ZodType<T>;
  } & Omit<UseQueryOptions<T>, "queryKey" | "queryFn">,
) => {
  const { queryKey, url, schema, ...rest } = options;
  return useQuery({
    queryKey,
    queryFn: () => apiClient.get(url, schema),
    ...rest,
  });
};

export const useApiMutation = <TBody, TResult>(
  options: {
    mutationKey: unknown[];
    url: string;
    method: "POST" | "PUT" | "DELETE";
    schema?: z.ZodType<TResult>;
  } & Omit<
    UseMutationOptions<TResult, Error, TBody>,
    "mutationFn" | "mutationKey"
  >,
) => {
  const { mutationKey, url, method, schema, onSuccess, ...rest } = options;
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey,
    mutationFn: async (body: TBody) => {
      if (method === "POST") {
        return apiClient.post(url, body, schema);
      }
      if (method === "PUT") {
        return apiClient.put(url, body, schema);
      }
      return apiClient.delete(url, schema);
    },
    ...rest,
    onSuccess: (...args) => {
      void queryClient.invalidateQueries();
      onSuccess?.(...args);
    },
  });
};
