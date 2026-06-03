const GROUP_SEP_REGEX = /[\s\u202f\u00a0']/g;

export type FormatNumberOptions = {
  allowDecimals?: boolean;
  maximumFractionDigits?: number;
};

export function sanitizeNumericInput(
  raw: string,
  allowDecimals = true,
): string {
  let value = raw.replace(/[^\d\s.,\u202f\u00a0'\-]/g, "");
  if (!allowDecimals) {
    value = value.replace(/[.,]/g, "");
  }
  return value;
}

export function parseFormattedNumber(
  raw: string,
  allowDecimals = true,
): number | "" {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "-" || trimmed === "," || trimmed === ".") {
    return "";
  }

  let normalized = trimmed.replace(GROUP_SEP_REGEX, "");

  if (!allowDecimals) {
    if (!/^-?\d+$/.test(normalized)) {
      return "";
    }
    return Number(normalized);
  }

  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");

  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(/,/g, "");
    }
  } else if (lastComma >= 0) {
    normalized = normalized.replace(",", ".");
  }

  const num = Number(normalized);
  if (Number.isNaN(num)) {
    return "";
  }

  return num;
}

export function formatNumberInput(
  value: number | string | null | undefined,
  locale = "fr-FR",
  options: FormatNumberOptions = {},
): string {
  const { allowDecimals = true, maximumFractionDigits = allowDecimals ? 2 : 0 } =
    options;

  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const parsed =
    typeof value === "number"
      ? value
      : parseFormattedNumber(String(value), allowDecimals);

  if (parsed === "" || Number.isNaN(parsed)) {
    return typeof value === "string" ? value : "";
  }

  return new Intl.NumberFormat(locale, {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(parsed);
}

export function formatNumberDisplay(
  value: string | number,
  locale = "fr-FR",
  options: FormatNumberOptions = {},
): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return "0";
    }

    const trailingSeparator = /[.,]$/.test(trimmed);
    const parsed = parseFormattedNumber(
      trailingSeparator ? trimmed.slice(0, -1) : trimmed,
      options.allowDecimals ?? true,
    );

    if (parsed === "") {
      return trimmed;
    }

    const formatted = formatNumberInput(parsed, locale, options);
    if (!trailingSeparator) {
      return formatted;
    }

    const decimalSeparator = new Intl.NumberFormat(locale)
      .format(1.1)
      .replace(/\d/g, "")
      .charAt(0);

    return `${formatted}${decimalSeparator}`;
  }

  if (value === null || value === undefined) {
    return "0";
  }

  return formatNumberInput(value, locale, options);
}
