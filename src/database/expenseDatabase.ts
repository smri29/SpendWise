import {
  AppSettings,
  Budget,
  BudgetProgress,
  CategoryBreakdown,
  Expense,
  ExpenseSummary,
  Reminder,
  ReminderDraft,
  SpendWiseBackup,
} from "@/database/expenseDatabase.types";
import {
  buildBudgetProgress,
  buildCategoryBreakdown,
  buildExpenseSummary,
  getRecentCategories as deriveRecentCategories,
} from "@/database/expenseAnalytics";
import { normalizeCategory } from "@/utils/formatters";

const STORAGE_KEY = "spendwise.backup";

const defaultSettings: AppSettings = {
  currency: "BDT",
  notifications_enabled: 1,
  monthly_budget_start_day: 1,
};

type LocalStore = {
  expenses: Expense[];
  budgets: Budget[];
  reminders: Reminder[];
  settings: AppSettings;
};

function canUseStorage() {
  return typeof localStorage !== "undefined";
}

function createDefaultStore(): LocalStore {
  return {
    expenses: [],
    budgets: [],
    reminders: [],
    settings: defaultSettings,
  };
}

function readStore(): LocalStore {
  if (!canUseStorage()) {
    return createDefaultStore();
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return createDefaultStore();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LocalStore>;
    return {
      expenses: parsed.expenses ?? [],
      budgets: parsed.budgets ?? [],
      reminders: parsed.reminders ?? [],
      settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return createDefaultStore();
  }
}

function writeStore(store: LocalStore) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function nextId(items: { id: number }[]) {
  return items.length === 0 ? Date.now() : Math.max(...items.map((item) => item.id)) + 1;
}

export async function createExpensesTable() {
  return;
}

export async function insertExpense(
  amount: number,
  category: string,
  note: string,
) {
  const store = readStore();
  const expense: Expense = {
    id: nextId(store.expenses),
    amount,
    category: normalizeCategory(category),
    note: note || null,
    created_at: new Date().toISOString(),
  };

  writeStore({
    ...store,
    expenses: [expense, ...store.expenses],
  });
  return expense.id;
}

export async function updateExpense(
  id: number,
  amount: number,
  category: string,
  note: string,
) {
  const store = readStore();
  writeStore({
    ...store,
    expenses: store.expenses.map((expense) =>
      expense.id === id
        ? {
            ...expense,
            amount,
            category: normalizeCategory(category),
            note: note || null,
          }
        : expense,
    ),
  });
}

export async function deleteExpense(id: number) {
  const store = readStore();
  writeStore({
    ...store,
    expenses: store.expenses.filter((expense) => expense.id !== id),
  });
}

export async function getExpenseById(id: number): Promise<Expense | null> {
  return readStore().expenses.find((expense) => expense.id === id) ?? null;
}

export async function getAllExpenses(): Promise<Expense[]> {
  return readStore().expenses.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function getExpenseSummary(): Promise<ExpenseSummary> {
  return buildExpenseSummary(await getAllExpenses());
}

export async function getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
  return buildCategoryBreakdown(await getAllExpenses());
}

export async function getRecentCategories(limit = 6): Promise<string[]> {
  return deriveRecentCategories(await getAllExpenses(), limit);
}

export async function upsertBudget(category: string, monthlyLimit: number) {
  const store = readStore();
  const normalizedCategory = normalizeCategory(category);
  const existing = store.budgets.find(
    (budget) => budget.category === normalizedCategory,
  );

  if (existing) {
    writeStore({
      ...store,
      budgets: store.budgets.map((budget) =>
        budget.category === normalizedCategory
          ? { ...budget, monthly_limit: monthlyLimit }
          : budget,
      ),
    });
    return;
  }

  const budget: Budget = {
    id: nextId(store.budgets),
    category: normalizedCategory,
    monthly_limit: monthlyLimit,
    created_at: new Date().toISOString(),
  };

  writeStore({
    ...store,
    budgets: [...store.budgets, budget],
  });
}

export async function deleteBudget(id: number) {
  const store = readStore();
  writeStore({
    ...store,
    budgets: store.budgets.filter((budget) => budget.id !== id),
  });
}

export async function getAllBudgets(): Promise<Budget[]> {
  return readStore().budgets.sort((a, b) => a.category.localeCompare(b.category));
}

export async function getBudgetProgress(): Promise<BudgetProgress[]> {
  const [budgets, expenses, settings] = await Promise.all([
    getAllBudgets(),
    getAllExpenses(),
    getSettings(),
  ]);
  return buildBudgetProgress(budgets, expenses, settings.monthly_budget_start_day);
}

export async function insertReminder(reminder: ReminderDraft) {
  const store = readStore();
  const nextReminder: Reminder = {
    id: nextId(store.reminders),
    title: reminder.title,
    category: reminder.category ? normalizeCategory(reminder.category) : null,
    note: reminder.note || null,
    amount_hint: reminder.amount_hint,
    frequency: reminder.frequency,
    hour: reminder.hour,
    minute: reminder.minute,
    day_of_week: reminder.day_of_week,
    day_of_month: reminder.day_of_month,
    enabled: reminder.enabled,
    notification_id: null,
    created_at: new Date().toISOString(),
  };

  writeStore({
    ...store,
    reminders: [nextReminder, ...store.reminders],
  });

  return nextReminder.id;
}

export async function updateReminder(id: number, reminder: ReminderDraft) {
  const store = readStore();
  writeStore({
    ...store,
    reminders: store.reminders.map((item) =>
      item.id === id
        ? {
            ...item,
            title: reminder.title,
            category: reminder.category ? normalizeCategory(reminder.category) : null,
            note: reminder.note || null,
            amount_hint: reminder.amount_hint,
            frequency: reminder.frequency,
            hour: reminder.hour,
            minute: reminder.minute,
            day_of_week: reminder.day_of_week,
            day_of_month: reminder.day_of_month,
            enabled: reminder.enabled,
          }
        : item,
    ),
  });
}

export async function updateReminderNotificationId(
  id: number,
  notificationId: string | null,
) {
  const store = readStore();
  writeStore({
    ...store,
    reminders: store.reminders.map((item) =>
      item.id === id ? { ...item, notification_id: notificationId } : item,
    ),
  });
}

export async function deleteReminder(id: number) {
  const store = readStore();
  writeStore({
    ...store,
    reminders: store.reminders.filter((item) => item.id !== id),
  });
}

export async function getReminderById(id: number): Promise<Reminder | null> {
  return readStore().reminders.find((item) => item.id === id) ?? null;
}

export async function getAllReminders(): Promise<Reminder[]> {
  return readStore().reminders.sort((a, b) => {
    if (a.enabled !== b.enabled) {
      return b.enabled - a.enabled;
    }

    if (a.hour !== b.hour) {
      return a.hour - b.hour;
    }

    return a.minute - b.minute;
  });
}

export async function getSettings(): Promise<AppSettings> {
  return readStore().settings;
}

export async function updateSettings(nextSettings: Partial<AppSettings>) {
  const store = readStore();
  writeStore({
    ...store,
    settings: {
      ...store.settings,
      ...nextSettings,
    },
  });
}

export async function exportSpendWiseBackup(): Promise<SpendWiseBackup> {
  const store = readStore();
  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    expenses: store.expenses,
    budgets: store.budgets,
    reminders: store.reminders,
    settings: store.settings,
  };
}

export async function importSpendWiseBackup(backup: SpendWiseBackup) {
  writeStore({
    expenses: backup.expenses,
    budgets: backup.budgets,
    reminders: backup.reminders,
    settings: { ...defaultSettings, ...backup.settings },
  });
}

export async function clearAllData() {
  writeStore(createDefaultStore());
}
