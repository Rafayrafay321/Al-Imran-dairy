// filepath: lib/auth/session.ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UnauthorizedError, ForbiddenError } from "./errors";

export const COOKIE_NAME = "auth_session";
const REMEMBER_ME_EXPIRATION = "30d";
const REMEMBER_ME_MAX_AGE = 30 * 24 * 60 * 60;
const SESSION_EXPIRATION = "1d";

interface SessionPayload {
  userId: string;
  role: "OWNER" | "STAFF";
}

function getJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    "al_imran_dairy_default_fallback_secret_key_32_chars_min";
  return new TextEncoder().encode(secret);
}

/**
 * Creates and signs a JWT containing only userId and role.
 */
export async function createSessionToken(
  payload: SessionPayload,
  rememberMe = false
): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? REMEMBER_ME_EXPIRATION : SESSION_EXPIRATION)
    .sign(getJwtSecret());
}

/**
 * Verifies a JWT token and returns the session payload if valid.
 */
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.userId === "string" &&
      (payload.role === "OWNER" || payload.role === "STAFF")
    ) {
      return {
        userId: payload.userId,
        role: payload.role as "OWNER" | "STAFF",
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Sets the session cookie in the HTTP response.
 */
export async function setSessionCookie(token: string, rememberMe = false): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: REMEMBER_ME_MAX_AGE } : {}),
  });
}

/**
 * Clears the session cookie from the browser.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Reads and verifies the session from incoming request cookies.
 */
export async function getSessionUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

/**
 * Enforces role check on the server. Never trusts client role state.
 * Throws 401 if unauthenticated, 403 if insufficient permissions.
 */
export async function requireRole(
  allowedRole: "OWNER" | "STAFF"
): Promise<SessionPayload> {
  const session = await getSessionUser();
  if (!session) {
    throw new UnauthorizedError("You must be logged in to perform this action.");
  }

  if (allowedRole === "OWNER" && session.role !== "OWNER") {
    throw new ForbiddenError("Forbidden: Owner privileges required.");
  }

  return session;
}
