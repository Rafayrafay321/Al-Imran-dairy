import { describe, expect, it } from "vitest";
import { toFriendlyError } from "@/lib/friendlyError";

describe("toFriendlyError", () => {
  it("maps connectivity failures to an actionable message", () => {
    expect(toFriendlyError(new TypeError("Failed to fetch"))).toBe(
      "Could not connect. Check your internet and try again."
    );
  });

  it("maps stale rates to the refresh instruction", () => {
    expect(toFriendlyError("Rate does not match configured rate")).toBe(
      "Rate has changed. Please refresh and try again."
    );
  });

  it("keeps a specific server message", () => {
    expect(toFriendlyError("Customer not found.")).toBe("Customer not found.");
  });
});
