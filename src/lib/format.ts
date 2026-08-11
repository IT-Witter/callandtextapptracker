/** Date + text helpers. All dates are handled as local-noon to dodge TZ drift. */

/** Today as YYYY-MM-DD in the user's local timezone (what Airtable date fields want). */
export function todayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Parse an Airtable YYYY-MM-DD string at local noon.
 * Parsing at noon avoids the off-by-one-day bug you get from `new Date("2026-08-11")`,
 * which is treated as UTC midnight and can land on the previous day locally.
 */
function parseLocal(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0, 0);
}

/** "8/11/2026" — matches the M/D/YYYY format configured on the Airtable fields. */
export function formatDateUS(iso: string | null | undefined): string {
  if (!iso) return "—";
  const date = parseLocal(iso);
  if (!date) return "—";
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

/** Whole days between an ISO date and today. Negative means the date is in the future. */
export function daysSince(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const then = parseLocal(iso);
  if (!then) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
  return Math.round((today.getTime() - then.getTime()) / 86_400_000);
}

/** "today" / "yesterday" / "3 days ago" / "in 12 days". */
export function relativeDays(iso: string | null | undefined): string {
  const diff = daysSince(iso);
  if (diff === null) return "never";
  if (diff === 0) return "today";
  if (diff === 1) return "yesterday";
  if (diff > 1) return `${diff} days ago`;
  const ahead = Math.abs(diff);
  return ahead === 1 ? "tomorrow" : `in ${ahead} days`;
}

/**
 * Prepend a dated entry to the Call Notes field.
 * The Airtable field description specifies newest entry on top, date-prefixed,
 * so Seth can read it cold — this preserves that convention.
 */
export function prependNote(
  existing: string | null | undefined,
  entry: string,
  author: string
): string {
  const stamp = formatDateUS(todayISO());
  const line = `${stamp} (${author}) — ${entry.trim()}`;
  const prior = (existing ?? "").trim();
  return prior ? `${line}\n\n${prior}` : line;
}

/** Collapse a note to one line for card previews. */
export function snippet(text: string | null | undefined, max = 120): string {
  const flat = (text ?? "").replace(/\s+/g, " ").trim();
  if (!flat) return "";
  return flat.length <= max ? flat : `${flat.slice(0, max - 1).trimEnd()}…`;
}
