import { NextResponse } from "next/server";
import { listBuyers } from "@/lib/airtable";
import { getCurrentUser } from "@/lib/session";

/**
 * GET /api/buyers          -> every buyer
 * GET /api/buyers?mine=1   -> only buyers assigned to the signed-in user
 *
 * Requires a valid session; customer phone numbers are never returned to an
 * unauthenticated caller.
 */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const all = await listBuyers();
    const mine = new URL(request.url).searchParams.get("mine") === "1";
    const buyers = mine ? all.filter((b) => b.assignedTo === user) : all;

    return NextResponse.json({ buyers, user });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load buyers.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
