import type { TransactionPeriodFilter, TransactionTypeFilter } from "@/db";

export const viewLogTypeOptions: { label: string; value: TransactionTypeFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Expenses", value: "EXPENSE" },
  { label: "Income", value: "INCOME" },
];

export const viewLogPeriodOptions: { label: string; value: TransactionPeriodFilter }[] = [
  { label: "All Time", value: "ALL_TIME" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Last Month", value: "LAST_MONTH" },
];
