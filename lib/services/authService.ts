// filepath: lib/services/authService.ts
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "@/lib/auth/rateLimit";
import { type User } from "@/lib/data/types";

interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Validates user credentials against the database with rate limiting and generic error messages.
 */
export async function authenticateUser(
  usernameInput: string,
  passwordInput: string,
  clientIp = "127.0.0.1"
): Promise<LoginResult> {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const rateLimitKey = `${clientIp}:${cleanUsername}`;

  // 1. Check rate limit
  const rateLimitStatus = checkRateLimit(rateLimitKey);
  if (!rateLimitStatus.allowed) {
    const minutes = Math.ceil(rateLimitStatus.remainingSeconds / 60);
    return {
      success: false,
      error: `Too many login attempts. Please try again in ${minutes} minute${minutes > 1 ? "s" : ""}.`,
    };
  }

  // 2. Query user from database
  const [matchedUser] = await db
    .select()
    .from(users)
    .where(eq(sql`lower(${users.username})`, cleanUsername))
    .limit(1);

  // 3. Verify password
  if (!matchedUser) {
    recordFailedAttempt(rateLimitKey);
    return {
      success: false,
      error: "Invalid username or password.",
    };
  }

  const isPasswordValid = await bcrypt.compare(
    passwordInput,
    matchedUser.passwordHash
  );

  if (!isPasswordValid) {
    recordFailedAttempt(rateLimitKey);
    return {
      success: false,
      error: "Invalid username or password.",
    };
  }

  // 4. Verify account active state
  if (!matchedUser.isActive) {
    return {
      success: false,
      error: "This account has been disabled. Please contact the owner.",
    };
  }

  // 5. Reset rate limit counter on success
  resetRateLimit(rateLimitKey);

  const safeUser: User = {
    id: matchedUser.id,
    name: matchedUser.name,
    username: matchedUser.username,
    role: matchedUser.role as "OWNER" | "STAFF",
    isActive: matchedUser.isActive,
  };

  return {
    success: true,
    user: safeUser,
  };
}

/**
 * Retrieves the full user record (excluding password hash) by ID.
 */
export async function getUserById(id: string): Promise<User | null> {
  const [userRecord] = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!userRecord) return null;

  return {
    id: userRecord.id,
    name: userRecord.name,
    username: userRecord.username,
    role: userRecord.role as "OWNER" | "STAFF",
    isActive: userRecord.isActive,
  };
}
