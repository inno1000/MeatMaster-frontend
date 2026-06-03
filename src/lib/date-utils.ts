/** Date locale au format `YYYY-MM-DD` (champs HTML `type="date"`). */
export function todayIsoDateLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Empêche de conserver une date postérieure à aujourd'hui. */
export function clampIsoDateToToday(value: string): string {
  if (!value) {
    return value;
  }
  const today = todayIsoDateLocal();
  return value > today ? today : value;
}

/** Plage de dates rapport : plafond à aujourd'hui et fin ≥ début si les deux sont renseignées. */
export function clampReportDateRange(
  from: string,
  to: string,
): { from: string; to: string } {
  let nextFrom = clampIsoDateToToday(from);
  let nextTo = clampIsoDateToToday(to);
  if (nextFrom && nextTo && nextTo < nextFrom) {
    nextTo = nextFrom;
  }
  return { from: nextFrom, to: nextTo };
}
