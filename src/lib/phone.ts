/**
 * Phone normalization.
 *
 * The Airtable data has inconsistent formats — all of these are real values
 * from the Master Phone Call List:
 *   "5137802507"     10 digits, no punctuation
 *   "978-771-9504"   dashed
 *   "13147233332"    11 digits with a leading country code
 *   "408 921 5791"   spaced
 *
 * We normalize to E.164 (+1XXXXXXXXXX) for tel:/sms: links. Anything that does
 * not resolve to a valid 10-digit US number returns null so the UI can disable
 * dialing rather than placing a wrong call.
 */

/** Strip everything that isn't a digit. */
function digitsOnly(input: string): string {
  return input.replace(/\D+/g, "");
}

/**
 * Convert a raw Airtable phone string to E.164, or null if unusable.
 * Accepts 10-digit US numbers, or 11-digit numbers starting with 1.
 */
export function toE164(raw: string | null | undefined): string | null {
  if (!raw) return null;

  let digits = digitsOnly(raw);

  // Drop a leading country code: 13147233332 -> 3147233332
  if (digits.length === 11 && digits.startsWith("1")) {
    digits = digits.slice(1);
  }

  if (digits.length !== 10) return null;

  // US area codes and exchange codes cannot begin with 0 or 1.
  if (digits[0] === "0" || digits[0] === "1") return null;
  if (digits[3] === "0" || digits[3] === "1") return null;

  return `+1${digits}`;
}

/** Pretty-print for display. Falls back to the raw value when unparseable. */
export function formatPhone(raw: string | null | undefined): string {
  const e164 = toE164(raw);
  if (!e164) return (raw ?? "").trim() || "No number";

  const d = e164.slice(2); // drop "+1"
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** href for the native dialer, or null when not callable. */
export function telHref(raw: string | null | undefined): string | null {
  const e164 = toE164(raw);
  return e164 ? `tel:${e164}` : null;
}

/**
 * href for the native SMS app with a prefilled body.
 * Uses the `?&body=` form, which is the variant iOS honors while remaining
 * valid for Android.
 */
export function smsHref(
  raw: string | null | undefined,
  body?: string
): string | null {
  const e164 = toE164(raw);
  if (!e164) return null;
  if (!body) return `sms:${e164}`;
  return `sms:${e164}?&body=${encodeURIComponent(body)}`;
}

/**
 * Default opening text. Kept short and personal — first name only, since the
 * Buyer Name column is what we use on the call, never the username.
 */
export function defaultTextBody(buyerName: string, sender: string): string {
  const firstName = (buyerName ?? "").trim().split(/\s+/)[0] || "there";
  return `Hey ${firstName}, it's ${sender} with Witter Coin — wanted to reach out about some pieces coming up that I think you'd want first look at. Let me know if you'd rather I call.`;
}
