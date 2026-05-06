import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";

export const formResolver = <T extends z.ZodType>(
  schema: T,
): Resolver<z.infer<T> & FieldValues> =>
  zodResolver(schema as never) as unknown as Resolver<
    z.infer<T> & FieldValues
  >;
