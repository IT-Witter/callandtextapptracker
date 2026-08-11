import { NextResponse } from "next/server";
import { createTouch, getBuyer, updateBuyer } from "@/lib/airtable";
import { getCurrentUser } from "@/lib/session";
import { formatDateUS, prependNote, todayISO } from "@/lib/format";
import {
  CALL_OUTCOMES,
  TEXT_OUTCOMES,
  type Outcome,
  type TouchType,
} from "@/lib/types";

/**
 * POST /api/touch
 *
 * Logs one call or text. This does three things in order:
 *   1. Appends a row to the Touches table — the permanent history.
 *   2. Updates the mirror fields on the buyer row (Last Called / Called By /
 *      Times Called, or the Text equivalents) so the existing Airtable grid,
 *      "Next Eligible" formula and "Call Status" gate keep working untouched.
 *   3. Prepends a dated entry to Call Notes, newest on top.
 *
 * Step 1 is the source of truth. If steps 2-3 fail we still report the error,
 * but the history row survives so no work is silently lost.
 */

function isValidOutcome(type: TouchType, outcome: unknown): outcome is Outcome {
  if (typeof outcome !== "string") return false;
  const allowed: readonly string[] =
    type === "Call" ? CALL_OUTCOMES : TEXT_OUTCOMES;
  return allowed.includes(outcome);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const {
    buyerId,
    type,
    outcome,
    notes = "",
    callWindow,
  } = (body ?? {}) as {
    buyerId?: unknown;
    type?: unknown;
    outcome?: unknown;
    notes?: unknown;
    callWindow?: unknown;
  };

  if (typeof buyerId !== "string" || !buyerId.startsWith("rec")) {
    return NextResponse.json({ error: "Missing buyer." }, { status: 400 });
  }
  if (type !== "Call" && type !== "Text") {
    return NextResponse.json({ error: "Type must be Call or Text." }, { status: 400 });
  }
  if (!isValidOutcome(type, outcome)) {
    return NextResponse.json(
      { error: `"${String(outcome)}" isn't a valid ${type.toLowerCase()} outcome.` },
      { status: 400 }
    );
  }

  const noteText = typeof notes === "string" ? notes.trim() : "";
  const today = todayISO();

  try {
    // Read first: we need the current counters and notes to append correctly.
    const buyer = await getBuyer(buyerId);

    // 1. Permanent history row.
    await createTouch({
      Summary: `${type} — ${buyer.username || buyer.buyerName} — ${formatDateUS(today)}`,
      Buyer: [buyerId],
      Type: type,
      By: user,
      When: today,
      Outcome: outcome,
      Notes: noteText,
    });

    // 2 + 3. Mirror onto the buyer row.
    const fields: Record<string, unknown> = {
      "Last Outcome": outcome,
    };

    if (type === "Call") {
      fields["Last Called"] = today;
      fields["Called By"] = user;
      fields["Times Called"] = buyer.timesCalled + 1;
    } else {
      fields["Last Texted"] = today;
      fields["Texted By"] = user;
      fields["Times Texted"] = buyer.timesTexted + 1;
    }

    // Only record a Call Window once we've actually learned it.
    if (typeof callWindow === "string" && callWindow.length > 0) {
      fields["Call Window"] = callWindow;
    }

    // Always leave a trail, even when the caller typed nothing.
    const entry = noteText || `${type} logged — ${outcome}.`;
    fields["Call Notes"] = prependNote(buyer.callNotes, entry, user);

    const updated = await updateBuyer(buyerId, fields);

    return NextResponse.json({ ok: true, buyer: updated });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not log that touch.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
