// filepath: lib/data/money.ts

/**
 * Currency handling utilities using integer Paisa (1 PKR = 100 Paisa).
 * Prevents JavaScript floating-point errors in ledger calculations.
 */

export function rupeesToPaisa(rupees: number): number {
  return Math.round(rupees * 100);
}

export function paisaToRupees(paisa: number): number {
  return paisa / 100;
}

/**
 * Calculates line item total in Rupees from liters and rate using integer paisa.
 * E.g., 25.5 liters @ Rs 250 = Rs 6,375.00
 */
export function calculateLineTotal(liters: number, ratePerLiter: number): number {
  const rateInPaisa = rupeesToPaisa(ratePerLiter);
  // Liters with 2 decimal precision represented as integer milli-liters / 10
  const litersCentis = Math.round(liters * 100);
  const totalPaisa = Math.round((litersCentis * rateInPaisa) / 100);
  return paisaToRupees(totalPaisa);
}

/**
 * Formats a Rupee amount for display with comma separation.
 */
export function formatRupees(amount: number): string {
  return amount.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}
