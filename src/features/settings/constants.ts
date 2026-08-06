import type { SettingsSnapshot } from "@/db";

export const currencyOptions: { label: string; value: SettingsSnapshot["currencySymbol"] }[] = [
  { label: "USD", value: "$" },
  { label: "EUR", value: "EUR" },
  { label: "GBP", value: "GBP" },
  { label: "BDT", value: "BDT" },
  { label: "INR", value: "INR" },
  { label: "JPY", value: "JPY" },
];

export const retentionOptions: { label: string; value: SettingsSnapshot["retentionMonths"] }[] = [
  { label: "1 Month", value: 1 },
  { label: "3 Months", value: 3 },
  { label: "6 Months", value: 6 },
  { label: "Never", value: 0 },
];
