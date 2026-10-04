// filepath: scripts/test-auth.ts
import { authenticateUser } from "../lib/services/authService";
import { createSessionToken, verifySessionToken } from "../lib/auth/session";
import { ForbiddenError } from "../lib/auth/errors";
import { pool } from "../lib/db";
async function runTest() {
    const ownerRes = await authenticateUser("owner", "123");
    if (!ownerRes.success || ownerRes.user?.role !== "OWNER") {
        throw new Error("Owner authentication failed");
    }
    const staffRes = await authenticateUser("staff", "123");
    if (!staffRes.success || staffRes.user?.role !== "STAFF") {
        throw new Error("Staff authentication failed");
    }
    const staffToken = await createSessionToken({
        userId: staffRes.user.id,
        role: staffRes.user.role,
    });
    const verified = await verifySessionToken(staffToken);
    if (verified?.role !== "STAFF") {
        throw new Error("Session verification failed");
    }
    let rejectedWith403 = false;
    try {
        if ((verified.role as string) !== "OWNER") {
            throw new ForbiddenError("Forbidden: Owner privileges required.");
        }
    }
    catch (err: unknown) {
        if (err instanceof ForbiddenError &&
            err.statusCode === 403 &&
            err.code === "FORBIDDEN") {
            rejectedWith403 = true;
        }
        else {
            console.error("Unexpected error:", err);
        }
    }
    if (!rejectedWith403) {
        throw new Error("Failed to reject STAFF with 403 Forbidden");
    }
    await pool.end();
    process.exit(0);
}
runTest().catch(async (err) => {
    console.error("Test failed:", err);
    await pool.end();
    process.exit(1);
});
