export const SpendWiseColors = {
  background: "#F4F7FB",
  surface: "#FFFFFF",
  surfaceMuted: "#EEF4FF",
  border: "#D7E2F1",
  text: "#14213D",
  textMuted: "#64748B",
  primary: "#2563EB",
  primarySoft: "#DBEAFE",
  success: "#059669",
  successSoft: "#D1FAE5",
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
  warning: "#D97706",
  warningSoft: "#FEF3C7",
  chart: ["#2563EB", "#16A34A", "#EA580C", "#7C3AED", "#0891B2", "#DC2626"],
} as const;

export const ExpenseCategories = [
  "Food",
  "Transport",
  "Groceries",
  "Bills",
  "Shopping",
  "Health",
  "Education",
  "Entertainment",
  "Personal",
  "Others",
] as const;

export const HistoryFilters = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
] as const;

export const ReminderFrequencies = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
] as const;

export const Weekdays = [
  { value: 1, label: "Sun" },
  { value: 2, label: "Mon" },
  { value: 3, label: "Tue" },
  { value: 4, label: "Wed" },
  { value: 5, label: "Thu" },
  { value: 6, label: "Fri" },
  { value: 7, label: "Sat" },
] as const;

export const CurrencyOptions = [
  { value: "BDT", label: "Bangladeshi Taka" },
  { value: "USD", label: "US Dollar" },
  { value: "EUR", label: "Euro" },
  { value: "GBP", label: "British Pound" },
] as const;
