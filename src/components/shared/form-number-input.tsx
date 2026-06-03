"use client";

import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import {
  NumberInput,
  type NumberInputProps,
} from "@/components/ui/number-input";

type FormNumberInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
} & Omit<NumberInputProps, "value" | "onChange" | "name">;

export function FormNumberInput<T extends FieldValues>({
  control,
  name,
  allowDecimals = true,
  ...inputProps
}: FormNumberInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <NumberInput
          {...inputProps}
          allowDecimals={allowDecimals}
          id={inputProps.id ?? field.name}
          name={field.name}
          ref={field.ref}
          value={field.value}
          onChange={field.onChange}
          onBlur={field.onBlur}
        />
      )}
    />
  );
}
