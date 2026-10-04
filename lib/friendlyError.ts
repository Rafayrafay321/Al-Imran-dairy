export function toFriendlyError(error: unknown, fallback = "Could not complete this action. Please try again."): string {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const normalized = message.toLowerCase();
  if (normalized.includes("fetch") || normalized.includes("network") || normalized.includes("connect")) return "Could not connect. Check your internet and try again.";
  if (normalized.includes("rate") && (normalized.includes("change") || normalized.includes("match"))) return "Rate has changed. Please refresh and try again.";
  if (normalized.includes("liter")) return "Please enter a valid number of liters.";
  return message || fallback;
}
