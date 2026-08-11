import { NextResponse } from "next/server";
import { createSession, destroySession, verifyPin } from "@/lib/session";
import { isUser } from "@/lib/types";

/**
 * POST /api/auth   { pin, user }  -> sets the session cookie
 * DELETE /api/auth                -> clears it (sign out)
 *
 * The PIN is only ever compared server-side. A wrong PIN and an invalid name
 * both return 401 with a generic message.
 */

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { pin, user } = (body ?? {}) as { pin?: unknown; user?: unknown };

  if (typeof pin !== "string" || !isUser(user)) {
    return NextResponse.json(
      { error: "Enter the team PIN and pick your name." },
      { status: 400 }
    );
  }

  try {
    if (!verifyPin(pin)) {
      return NextResponse.json({ error: "That PIN isn't right." }, { status: 401 });
    }
    await createSession(user);
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    // Missing APP_PIN / SESSION_SECRET lands here — surface it as a config error.
    const message =
      error instanceof Error ? error.message : "Sign-in failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
