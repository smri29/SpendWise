export type TransactionType = "EXPENSE" | "INCOME";

export type CategoryRow = {
  id: number;
  name: string;
  type: TransactionType;
  iconName: string;
  colorHex: string;
};

export type TransactionRow = {
  id: number;
  amount: number;
  type: TransactionType;
  categoryId: number | null;
  note: string;
  createdAt: number;
};

export type TransactionListItem = TransactionRow & {
  categoryName: string | null;
};

export type SettingsSnapshot = {
  currencySymbol: string;
  retentionMonths: number;
  dailyReminderEnabled: boolean;
  dailyReminderTime: string;
  appLockEnabled: boolean;
  pdfReportLastExportAt: number | null;
  driveBackupEnabled: boolean;
  driveBackupFrequencyDays: number;
  driveBackupLastRunAt: number | null;
  driveConnectedEmail: string | null;
};

export type DashboardSnapshot = {
  todaySpent: number;
  todayEarned: number;
  totalTransactions: number;
};

export type CategoryBreakdownItem = {
  categoryName: string;
  totalAmount: number;
  sharePercent: number;
  currencySymbol: string;
};

export type AnalyticsSnapshot = {
  monthlyNetBalance: number;
  monthlySpent: number;
  monthlyEarned: number;
  breakdown: CategoryBreakdownItem[];
};

export type StorageSnapshot = {
  categoriesCount: number;
  transactionsCount: number;
  settingsCount: number;
  estimatedBytes: number;
};

export type SpendWiseBackup = {
  schemaVersion: 1;
  exportedAt: number;
  categories: CategoryRow[];
  transactions: TransactionRow[];
  settings: SettingsSnapshot;
};

export type CreateTransactionInput = {
  amount: number;
  type: TransactionType;
  categoryId: number;
  note: string;
  createdAt: number;
};

export type TransactionTypeFilter = "ALL" | TransactionType;
export type TransactionPeriodFilter = "ALL_TIME" | "THIS_MONTH" | "LAST_MONTH";
