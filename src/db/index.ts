/**
 * Public database facade for the app.
 * Screens and hooks import from this file only, while the underlying modules
 * remain separated by concern: settings, transactions, analytics, and backups.
 */
export { initializeDatabaseAsync } from "@/db/core/database";
export {
  clearAllDataAsync,
  exportBackupJsonAsync,
  exportTransactionsCsvAsync,
  getStorageSnapshotAsync,
  importBackupJsonAsync,
} from "@/db/modules/backup";
export { getAnalyticsSnapshotAsync } from "@/db/modules/analytics";
export { getSettingsSnapshot, saveSettingsSnapshotAsync } from "@/db/modules/settings";
export {
  createTransactionAsync,
  deleteTransactionByIdAsync,
  getDashboardSnapshot,
  listCategoriesByTypeAsync,
  listTransactionsAsync,
} from "@/db/modules/transactions";
export type {
  AnalyticsSnapshot,
  CategoryBreakdownItem,
  CategoryRow,
  CreateTransactionInput,
  DashboardSnapshot,
  SettingsSnapshot,
  StorageSnapshot,
  TransactionListItem,
  TransactionPeriodFilter,
  TransactionType,
  TransactionTypeFilter,
} from "@/db/types";
