"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { Input, type InputProps } from "@/components/ui/input";
import {
  formatNumberInput,
  parseFormattedNumber,
  sanitizeNumericInput,
} from "@/lib/number-format";

export type NumberInputProps = Omit<
  InputProps,
  "type" | "value" | "onChange" | "defaultValue"
> & {
  value?: number | string;
  onChange?: (value: number | "") => void;
  allowDecimals?: boolean;
};

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      onFocus,
      allowDecimals = true,
      ...props
    },
    ref,
  ) => {
    const locale = useLocale();
    const focusedRef = React.useRef(false);
    const [display, setDisplay] = React.useState(() =>
      formatNumberInput(value, locale, { allowDecimals }),
    );

    React.useEffect(() => {
      if (!focusedRef.current) {
        setDisplay(formatNumberInput(value, locale, { allowDecimals }));
      }
    }, [value, locale, allowDecimals]);

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      focusedRef.current = true;
      onFocus?.(event);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = sanitizeNumericInput(event.target.value, allowDecimals);
      setDisplay(next);
      onChange?.(parseFormattedNumber(next, allowDecimals));
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      focusedRef.current = false;
      const parsed = parseFormattedNumber(display, allowDecimals);
      setDisplay(
        parsed === ""
          ? ""
          : formatNumberInput(parsed, locale, { allowDecimals }),
      );
      onChange?.(parsed);
      onBlur?.(event);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode={allowDecimals ? "decimal" : "numeric"}
        autoComplete="off"
        value={display}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
    );
  },
);
NumberInput.displayName = "NumberInput";

export { NumberInput };
