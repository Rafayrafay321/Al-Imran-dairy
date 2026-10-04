// filepath: actions/authActions.ts
"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/auth/validators";
import { authenticateUser, getUserById } from "@/lib/services/authService";
import {
  createSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSessionUser,
} from "@/lib/auth/session";
import { type User } from "@/lib/data/types";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server action to authenticate user, establish JWT cookie session, and handle rate limits.
 */
export async function loginAction(
  usernameInput: string,
  passwordInput: string,
  rememberMe = false
): Promise<ActionResult<User>> {
  // 1. Validate boundary with Zod
  const validation = loginSchema.safeParse({
    username: usernameInput,
    password: passwordInput,
  });

  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Invalid input.",
    };
  }

  // 2. Extract client IP for attempt rate limiting
  const headersList = await headers();
  const rawIp =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "127.0.0.1";

  // 3. Authenticate against database
  const authResult = await authenticateUser(
    validation.data.username,
    validation.data.password,
    rawIp
  );

  if (!authResult.success || !authResult.user) {
    return {
      success: false,
      error: authResult.error || "Invalid username or password.",
    };
  }

  // 4. Issue signed JWT session cookie
  const token = await createSessionToken({
    userId: authResult.user.id,
    role: authResult.user.role,
  }, rememberMe);

  await setSessionCookie(token, rememberMe);

  return {
    success: true,
    data: authResult.user,
  };
}

/**
 * Clears the session cookie and redirects user to /login.
 */
export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}

/**
 * Returns current authenticated user details from database using the verified session.
 */
export async function getCurrentUserAction(): Promise<User | null> {
  const session = await getSessionUser();
  if (!session) return null;
  return await getUserById(session.userId);
}
