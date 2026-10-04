// filepath: lib/data/types.ts

export const USER_ROLES = {
  OWNER: "OWNER",
  STAFF: "STAFF",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  isActive: boolean;
}

export interface ShopSettings {
  shopName: string;
  phone: string;
  shopNameUrdu?: string;
}

export interface Customer {
  id: string;
  name: string;
  nameUrdu?: string;
  phone: string;
  address?: string;
  defaultMilkTypeId: string;
  balance: number;
  previousBalance: number;
  specialRates?: Partial<Record<string, number>>;
  isActive: boolean;
}

interface InvoiceLine {
  id: string;
  deliveryDate: string;
  milkTypeId: string;
  milkTypeName?: string;
  liters: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  customerId: string;
  customerName?: string;
  weekStart: string;
  weekEnd: string;
  issueDate: string;
  totalLiters: number;
  totalAmount: number;
  previousBalance: number;
  status: "ISSUED" | "VOID";
  sharedAt?: string | null;
  createdBy: string;
  createdAt: string;
  lines: InvoiceLine[];
}

export interface TodayMetrics {
  totalLiters: number;
  billsCount: number;
}

export interface SalesReportCustomerRow {
  customerId: string;
  customerName: string;
  phone: string;
  totalLiters: number;
  totalAmount: number;
  previousBalance: number;
  grandTotal: number;
  month?: string;
  deliveryCount?: number;
}

export interface WeeklySummaryEntry {
  id: string;
  time?: string;
  customerName: string;
  milkType?: string;
  liters: number;
  rate: number;
  amount: number;
  date: string;
  staffName?: string;
  recordedBy?: string;
}
