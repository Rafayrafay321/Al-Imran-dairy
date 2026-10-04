// filepath: lib/utils/phone.ts

interface PhoneValidationResult {
  isValid: boolean;
  normalized?: string;
  error?: string;
}

/**
 * Normalizes and validates Pakistani phone numbers for master data storage.
 *
 * Requirements:
 * - Formats like 0300 1234567, 0300-1234567, +923001234567 -> 923001234567
 * - Must result in exactly 12 digits starting with '92'
 * - Returns a friendly, descriptive error message otherwise
 */
export function normalizePakistanPhone(input: string): PhoneValidationResult {
  if (!input || typeof input !== "string") {
    return {
      isValid: false,
      error: "Phone number is required.",
    };
  }

  // Strip all non-digit characters (spaces, hyphens, parentheses, plus sign)
  const digitsOnly = input.replace(/\D/g, "");

  let normalized = digitsOnly;

  // Case 1: Local mobile starting with '0' (e.g., 03001234567 -> 11 digits)
  if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    normalized = "92" + digitsOnly.slice(1);
  }
  // Case 2: 10 digits without leading 0 (e.g., 3001234567)
  else if (digitsOnly.length === 10 && digitsOnly.startsWith("3")) {
    normalized = "92" + digitsOnly;
  }

  // Validate: exactly 12 digits starting with '92'
  if (normalized.length !== 12 || !normalized.startsWith("92")) {
    return {
      isValid: false,
      error: "Invalid phone number. Must be a Pakistani number (e.g., 0300 1234567 or 923001234567).",
    };
  }

  return {
    isValid: true,
    normalized,
  };
}
