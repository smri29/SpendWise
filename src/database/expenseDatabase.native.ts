import * as SQLite from "expo-sqlite";

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

const defaultSettings: AppSettings = {
  currency: "BDT",
  notifications_enabled: 1,
  monthly_budget_start_day: 1,
};

export async function getDatabase() {
  return SQLite.openDatabaseAsync("spendwise.db");
}

export async function createExpensesTable() {
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL UNIQUE,
      monthly_limit REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT,
      note TEXT,
      amount_hint REAL,
      frequency TEXT NOT NULL,
      hour INTEGER NOT NULL,
      minute INTEGER NOT NULL,
      day_of_week INTEGER,
      day_of_month INTEGER,
      enabled INTEGER NOT NULL DEFAULT 1,
      notification_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  await database.runAsync(
    `
    INSERT OR IGNORE INTO settings (key, value) VALUES
      ('currency', 'BDT'),
      ('notifications_enabled', '1'),
      ('monthly_budget_start_day', '1');
    `,
  );
}

export async function insertExpense(
  amount: number,
  category: string,
  note: string,
) {
  const database = await getDatabase();
  const result = await database.runAsync(
    `
    INSERT INTO expenses (amount, category, note)
    VALUES (?, ?, ?);
    `,
    [amount, normalizeCategory(category), note || null],
  );

  return result.lastInsertRowId;
}

export async function updateExpense(
  id: number,
  amount: number,
  category: string,
  note: string,
) {
  const database = await getDatabase();
  await database.runAsync(
    `
    UPDATE expenses
    SET amount = ?, category = ?, note = ?
    WHERE id = ?;
    `,
    [amount, normalizeCategory(category), note || null, id],
  );
}

export async function deleteExpense(id: number) {
  const database = await getDatabase();
  await database.runAsync(`DELETE FROM expenses WHERE id = ?;`, [id]);
}

export async function getExpenseById(id: number): Promise<Expense | null> {
  const database = await getDatabase();
  return (
    (await database.getFirstAsync<Expense>(
      `
      SELECT *
      FROM expenses
      WHERE id = ?;
      `,
      [id],
    )) ?? null
  );
}

export async function getAllExpenses(): Promise<Expense[]> {
  const database = await getDatabase();
  return database.getAllAsync<Expense>(
    `
    SELECT *
    FROM expenses
    ORDER BY datetime(created_at) DESC, id DESC;
    `,
  );
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
  const database = await getDatabase();
  await database.runAsync(
    `
    INSERT INTO budgets (category, monthly_limit)
    VALUES (?, ?)
    ON CONFLICT(category) DO UPDATE SET monthly_limit = excluded.monthly_limit;
    `,
    [normalizeCategory(category), monthlyLimit],
  );
}

export async function deleteBudget(id: number) {
  const database = await getDatabase();
  await database.runAsync(`DELETE FROM budgets WHERE id = ?;`, [id]);
}

export async function getAllBudgets(): Promise<Budget[]> {
  const database = await getDatabase();
  return database.getAllAsync<Budget>(
    `
    SELECT *
    FROM budgets
    ORDER BY category COLLATE NOCASE ASC;
    `,
  );
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
  const database = await getDatabase();
  const result = await database.runAsync(
    `
    INSERT INTO reminders (
      title,
      category,
      note,
      amount_hint,
      frequency,
      hour,
      minute,
      day_of_week,
      day_of_month,
      enabled
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
        reminder.title,
        reminder.category ? normalizeCategory(reminder.category) : null,
        reminder.note || null,
      reminder.amount_hint,
      reminder.frequency,
      reminder.hour,
      reminder.minute,
      reminder.day_of_week,
      reminder.day_of_month,
      reminder.enabled,
    ],
  );

  return result.lastInsertRowId;
}

export async function updateReminder(id: number, reminder: ReminderDraft) {
  const database = await getDatabase();
  await database.runAsync(
    `
    UPDATE reminders
    SET title = ?, category = ?, note = ?, amount_hint = ?, frequency = ?, hour = ?, minute = ?, day_of_week = ?, day_of_month = ?, enabled = ?
    WHERE id = ?;
    `,
    [
      reminder.title,
      reminder.category ? normalizeCategory(reminder.category) : null,
      reminder.note || null,
      reminder.amount_hint,
      reminder.frequency,
      reminder.hour,
      reminder.minute,
      reminder.day_of_week,
      reminder.day_of_month,
      reminder.enabled,
      id,
    ],
  );
}

export async function updateReminderNotificationId(
  id: number,
  notificationId: string | null,
) {
  const database = await getDatabase();
  await database.runAsync(
    `
    UPDATE reminders
    SET notification_id = ?
    WHERE id = ?;
    `,
    [notificationId, id],
  );
}

export async function deleteReminder(id: number) {
  const database = await getDatabase();
  await database.runAsync(`DELETE FROM reminders WHERE id = ?;`, [id]);
}

export async function getReminderById(id: number): Promise<Reminder | null> {
  const database = await getDatabase();
  return (
    (await database.getFirstAsync<Reminder>(
      `
      SELECT *
      FROM reminders
      WHERE id = ?;
      `,
      [id],
    )) ?? null
  );
}

export async function getAllReminders(): Promise<Reminder[]> {
  const database = await getDatabase();
  return database.getAllAsync<Reminder>(
    `
    SELECT *
    FROM reminders
    ORDER BY enabled DESC, hour ASC, minute ASC, id DESC;
    `,
  );
}

export async function getSettings(): Promise<AppSettings> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<{ key: string; value: string }>(
    `
    SELECT key, value
    FROM settings;
    `,
  );

  const map = new Map(rows.map((row) => [row.key, row.value]));
  return {
    currency: map.get("currency") ?? defaultSettings.currency,
    notifications_enabled: Number(
      map.get("notifications_enabled") ?? defaultSettings.notifications_enabled,
    ),
    monthly_budget_start_day: Number(
      map.get("monthly_budget_start_day") ?? defaultSettings.monthly_budget_start_day,
    ),
  };
}

export async function updateSettings(nextSettings: Partial<AppSettings>) {
  const database = await getDatabase();
  const entries = Object.entries(nextSettings) as [keyof AppSettings, string | number][];

  for (const [key, value] of entries) {
    await database.runAsync(
      `
      INSERT INTO settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value;
      `,
      [key, String(value)],
    );
  }
}

export async function exportSpendWiseBackup(): Promise<SpendWiseBackup> {
  const [expenses, budgets, reminders, settings] = await Promise.all([
    getAllExpenses(),
    getAllBudgets(),
    getAllReminders(),
    getSettings(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    expenses,
    budgets,
    reminders,
    settings,
  };
}

export async function importSpendWiseBackup(backup: SpendWiseBackup) {
  const database = await getDatabase();

  await database.withExclusiveTransactionAsync(async () => {
    await database.execAsync(`
      DELETE FROM expenses;
      DELETE FROM budgets;
      DELETE FROM reminders;
      DELETE FROM settings;
    `);

    for (const expense of backup.expenses) {
      await database.runAsync(
        `
        INSERT INTO expenses (id, amount, category, note, created_at)
        VALUES (?, ?, ?, ?, ?);
        `,
        [
          expense.id,
          expense.amount,
          expense.category,
          expense.note,
          expense.created_at,
        ],
      );
    }

    for (const budget of backup.budgets) {
      await database.runAsync(
        `
        INSERT INTO budgets (id, category, monthly_limit, created_at)
        VALUES (?, ?, ?, ?);
        `,
        [budget.id, budget.category, budget.monthly_limit, budget.created_at],
      );
    }

    for (const reminder of backup.reminders) {
      await database.runAsync(
        `
        INSERT INTO reminders (
          id, title, category, note, amount_hint, frequency, hour, minute, day_of_week, day_of_month, enabled, notification_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `,
        [
          reminder.id,
          reminder.title,
          reminder.category,
          reminder.note,
          reminder.amount_hint,
          reminder.frequency,
          reminder.hour,
          reminder.minute,
          reminder.day_of_week,
          reminder.day_of_month,
          reminder.enabled,
          reminder.notification_id,
          reminder.created_at,
        ],
      );
    }

    await database.runAsync(
      `
      INSERT INTO settings (key, value) VALUES
        ('currency', ?),
        ('notifications_enabled', ?),
        ('monthly_budget_start_day', ?);
      `,
      [
        backup.settings.currency,
        String(backup.settings.notifications_enabled),
        String(backup.settings.monthly_budget_start_day),
      ],
    );
  });
}

export async function clearAllData() {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM expenses;
    DELETE FROM budgets;
    DELETE FROM reminders;
    DELETE FROM settings;
  `);
  await updateSettings(defaultSettings);
}
