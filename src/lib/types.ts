/**
 * Shared domain types. Field names here mirror the Airtable column names in
 * base "whatnot username tracker" exactly — do not rename without also
 * renaming in Airtable.
 */

/** The four people who use this app. Matches the "By" / "Called By" selects. */
export const USERS = ["Seth", "Ben", "Marley", "Colton"] as const;
export type User = (typeof USERS)[number];

export function isUser(value: unknown): value is User {
  return typeof value === "string" && (USERS as readonly string[]).includes(value);
}

/** Tier drives call cadence: A = 30d, B = 45d, C = 60d. */
export type Tier = "A" | "B" | "C";

export type TouchType = "Call" | "Text";

/** Outcomes valid for a call. Mirrors the "Last Outcome" select. */
export const CALL_OUTCOMES = [
  "Connected",
  "Voicemail",
  "No Answer",
  "Bad Number",
  "Do Not Call",
] as const;
export type CallOutcome = (typeof CALL_OUTCOMES)[number];

/** Outcomes valid for a text. Text-only values live on Touches.Outcome. */
export const TEXT_OUTCOMES = ["Sent", "Replied", "No Reply"] as const;
export type TextOutcome = (typeof TEXT_OUTCOMES)[number];

export type Outcome = CallOutcome | TextOutcome;

/**
 * Outcomes that permanently remove a buyer from the callable list.
 * The Airtable "Call Status" formula treats these as "Excluded".
 */
export const EXCLUDING_OUTCOMES: readonly Outcome[] = ["Bad Number", "Do Not Call"];

export type CallWindow =
  | "Morning (9-12)"
  | "Midday (12-3)"
  | "Evening (5-8)"
  | "Weekend"
  | "Unknown";

export type Channel = "Whatnot" | "eBay" | "Both";

export type DataFlag = "Duplicate" | "Verify Name" | "Bad Phone Format" | "Clean";

/** A buyer row from "Master Phone Call List", shaped for the UI. */
export interface Buyer {
  id: string;
  username: string;
  buyerName: string;
  /** Raw value straight from Airtable; formats are inconsistent by design. */
  phone: string;
  /** Normalized to +1XXXXXXXXXX, or null when the number is unusable. */
  phoneE164: string | null;
  /** Human-friendly (555) 123-4567, falls back to the raw string. */
  phoneDisplay: string;
  /** False when the number could not be normalized — Call/Text are disabled. */
  isCallable: boolean;
  tier: Tier | null;
  assignedTo: string | null;
  callWindow: CallWindow | null;
  lastCalled: string | null;
  calledBy: string | null;
  lastOutcome: CallOutcome | null;
  timesCalled: number;
  lastTexted: string | null;
  textedBy: string | null;
  timesTexted: number;
  callNotes: string;
  /** Formula field: earliest date this buyer may be called again. */
  nextEligible: string | null;
  /** Formula field: "Call now", "Call now - never contacted", "Cooling down", "Excluded". */
  callStatus: string;
  dataFlag: DataFlag | null;
  channel: Channel | null;
}

/** True when Airtable's Call Status formula says this buyer is dialable today. */
export function isCallNow(buyer: Buyer): boolean {
  return buyer.callStatus.startsWith("Call now");
}

/** Payload accepted by POST /api/touch. */
export interface LogTouchInput {
  buyerId: string;
  type: TouchType;
  outcome: Outcome;
  notes?: string;
  /** Optional — updates the buyer's Call Window when we learn it on the call. */
  callWindow?: CallWindow;
}
