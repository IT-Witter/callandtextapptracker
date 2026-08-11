import type {
  Buyer,
  CallOutcome,
  CallWindow,
  Channel,
  DataFlag,
  Tier,
} from "./types";
import { formatPhone, toE164 } from "./phone";

/**
 * Airtable REST client.
 *
 * Server-only: the PAT is read from process.env and must never reach the
 * browser. All access goes through the /api route handlers.
 *
 * Airtable's rate limit is 5 requests/second per base; exceeding it triggers a
 * 30-second lockout. We serialize requests through a small queue with a minimum
 * gap so bursts (e.g. logging a touch = read + write + write) can't trip it.
 */

const API_BASE = "https://api.airtable.com/v0";

export const BASE_ID = "appqLU7Qk3WQvqDcw";
export const BUYERS_TABLE = "tblkxkAwxtwZbB7WI"; // Master Phone Call List
export const TOUCHES_TABLE = "tbl9YJxxD00aYpd46"; // Touches

/** Minimum ms between requests — 5 req/s limit, so 210ms leaves headroom. */
const MIN_REQUEST_GAP_MS = 210;
let lastRequestAt = 0;
let queue: Promise<unknown> = Promise.resolve();

function token(): string {
  const value = process.env.AIRTABLE_TOKEN;
  if (!value) {
    throw new Error(
      "AIRTABLE_TOKEN is not set. Add your Airtable personal access token to .env.local."
    );
  }
  return value;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Run a request through the throttle queue. */
function throttle<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const gap = Date.now() - lastRequestAt;
    if (gap < MIN_REQUEST_GAP_MS) {
      await sleep(MIN_REQUEST_GAP_MS - gap);
    }
    lastRequestAt = Date.now();
    return task();
  });

  // Keep the chain alive even when a task rejects.
  queue = run.catch(() => undefined);
  return run;
}

export class AirtableError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "AirtableError";
  }
}

interface AirtableRecord {
  id: string;
  fields: Record<string, unknown>;
}

/** Throttled fetch against the Airtable API with one retry on 429. */
async function request<T>(
  path: string,
  init: RequestInit = {},
  attempt = 0
): Promise<T> {
  const response = await throttle(() =>
    fetch(`${API_BASE}/${BASE_ID}/${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token()}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    })
  );

  if (response.status === 429 && attempt < 2) {
    await sleep(1_000 * (attempt + 1));
    return request<T>(path, init, attempt + 1);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new AirtableError(
      `Airtable ${response.status}: ${body.slice(0, 300)}`,
      response.status
    );
  }

  return (await response.json()) as T;
}

// ---------- field coercion ----------

function str(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function strOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function num(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** Map a raw Airtable record onto our Buyer shape. */
function toBuyer(record: AirtableRecord): Buyer {
  const f = record.fields;
  const rawPhone = str(f["Phone"]);
  const e164 = toE164(rawPhone);

  return {
    id: record.id,
    username: str(f["WN Username"]),
    buyerName: str(f["Buyer Name"]),
    phone: rawPhone,
    phoneE164: e164,
    phoneDisplay: formatPhone(rawPhone),
    isCallable: e164 !== null,
    tier: (strOrNull(f["Tier"]) as Tier | null) ?? null,
    assignedTo: strOrNull(f["Assigned To"]),
    callWindow: (strOrNull(f["Call Window"]) as CallWindow | null) ?? null,
    lastCalled: strOrNull(f["Last Called"]),
    calledBy: strOrNull(f["Called By"]),
    lastOutcome: (strOrNull(f["Last Outcome"]) as CallOutcome | null) ?? null,
    timesCalled: num(f["Times Called"]),
    lastTexted: strOrNull(f["Last Texted"]),
    textedBy: strOrNull(f["Texted By"]),
    timesTexted: num(f["Times Texted"]),
    callNotes: str(f["Call Notes"]),
    nextEligible: strOrNull(f["Next Eligible"]),
    callStatus: str(f["Call Status"]),
    dataFlag: (strOrNull(f["Data Flag"]) as DataFlag | null) ?? null,
    channel: (strOrNull(f["Channel"]) as Channel | null) ?? null,
  };
}

// ---------- public API ----------

/** Fetch every buyer, following pagination. 60 rows today, but don't assume. */
export async function listBuyers(): Promise<Buyer[]> {
  const all: Buyer[] = [];
  let offset: string | undefined;

  do {
    const params = new URLSearchParams({ pageSize: "100" });
    if (offset) params.set("offset", offset);

    const page = await request<{ records: AirtableRecord[]; offset?: string }>(
      `${BUYERS_TABLE}?${params.toString()}`
    );

    all.push(...page.records.map(toBuyer));
    offset = page.offset;
  } while (offset);

  return all;
}

/** Fetch a single buyer by record id. */
export async function getBuyer(id: string): Promise<Buyer> {
  const record = await request<AirtableRecord>(`${BUYERS_TABLE}/${id}`);
  return toBuyer(record);
}

/** Patch fields on a buyer row. */
export async function updateBuyer(
  id: string,
  fields: Record<string, unknown>
): Promise<Buyer> {
  const record = await request<AirtableRecord>(`${BUYERS_TABLE}/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ fields, typecast: true }),
  });
  return toBuyer(record);
}

/** Append a row to the Touches log. */
export async function createTouch(
  fields: Record<string, unknown>
): Promise<{ id: string }> {
  return request<{ id: string }>(TOUCHES_TABLE, {
    method: "POST",
    body: JSON.stringify({ fields, typecast: true }),
  });
}
