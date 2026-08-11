import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import { isUser, type User } from "./types";

/**
 * Session handling.
 *
 * There are no per-person passwords by design — the team just taps their name.
 * A single shared PIN gates the app so customer phone numbers aren't exposed on
 * the open internet. The chosen name is stored in an httpOnly, HMAC-signed
 * cookie so it can't be edited from the browser devtools.
 */

const COOKIE_NAME = "witter_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value) {
    throw new Error("SESSION_SECRET is not set. Add it to .env.local.");
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Constant-time string compare that tolerates length mismatches. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Verify a submitted PIN against APP_PIN, in constant time. */
export function verifyPin(submitted: string): boolean {
  const expected = process.env.APP_PIN;
  if (!expected) {
    throw new Error("APP_PIN is not set. Add it to .env.local.");
  }
  return safeEqual(submitted.trim(), expected.trim());
}

/** Serialize + sign "<user>.<signature>". */
function serialize(user: User): string {
  return `${user}.${sign(user)}`;
}

/** Validate a cookie value and return the user, or null when tampered/absent. */
function deserialize(raw: string | undefined): User | null {
  if (!raw) return null;
  const dot = raw.lastIndexOf(".");
  if (dot < 1) return null;

  const user = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);

  if (!isUser(user)) return null;
  if (!safeEqual(signature, sign(user))) return null;

  return user;
}

/** Read the signed-in user from the request cookies. Null when not signed in. */
export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  return deserialize(jar.get(COOKIE_NAME)?.value);
}

/** Write the session cookie after a successful PIN + name selection. */
export async function createSession(user: User): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, serialize(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** Clear the session cookie. */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
