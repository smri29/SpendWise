import type { TransactionType } from "@/db";

export const addEntryTypeOptions: { label: string; value: TransactionType }[] = [
  { label: "Expense", value: "EXPENSE" },
  { label: "Income", value: "INCOME" },
];
