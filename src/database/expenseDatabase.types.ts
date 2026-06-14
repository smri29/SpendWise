export type Expense = {
  id: number;
  amount: number;
  category: string;
  note: string | null;
  created_at: string;
};

export type Budget = {
  id: number;
  category: string;
  monthly_limit: number;
  created_at: string;
};

export type ReminderFrequency = "daily" | "weekly" | "monthly";

export type Reminder = {
  id: number;
  title: string;
  category: string | null;
  note: string | null;
  amount_hint: number | null;
  frequency: ReminderFrequency;
  hour: number;
  minute: number;
  day_of_week: number | null;
  day_of_month: number | null;
  enabled: number;
  notification_id: string | null;
  created_at: string;
};

export type AppSettings = {
  currency: string;
  notifications_enabled: number;
  monthly_budget_start_day: number;
};

export type ExpenseSummary = {
  total: number;
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  transactionCount: number;
  averageTransaction: number;
  topCategory: string | null;
};

export type CategoryBreakdown = {
  category: string;
  total: number;
  count: number;
  share: number;
};

export type BudgetProgress = Budget & {
  spent: number;
  remaining: number;
  usageRatio: number;
  status: "safe" | "warning" | "over";
};

export type HistoryFilter = "all" | "today" | "week" | "month";

export type ReminderDraft = {
  title: string;
  category: string;
  note: string;
  amount_hint: number | null;
  frequency: ReminderFrequency;
  hour: number;
  minute: number;
  day_of_week: number | null;
  day_of_month: number | null;
  enabled: number;
};

export type SpendWiseBackup = {
  exportedAt: string;
  schemaVersion: 1;
  expenses: Expense[];
  budgets: Budget[];
  reminders: Reminder[];
  settings: AppSettings;
};
