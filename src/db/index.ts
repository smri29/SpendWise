import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

import { createSchemaAsync, executeRollingPurge, seedDefaultsAsync } from "@/db/schema";
import type {
  AnalyticsSnapshot,
  CategoryBreakdownItem,
  CategoryRow,
  CreateTransactionInput,
  DashboardSnapshot,
  SettingsSnapshot,
  SpendWiseBackup,
  StorageSnapshot,
  TransactionListItem,
  TransactionPeriodFilter,
  TransactionType,
  TransactionTypeFilter,
} from "@/db/types";
import {
  assertValidBackup,
  buildCsvFromTransactions,
  buildStorageEstimateBytes,
  getLocalDayRange,
  getMonthRange,
  parseBooleanSetting,
} from "@/utils/format";

let sharedDatabase: SQLiteDatabase | null = null;
let databasePromise: Promise<SQLiteDatabase> | null = null;

const settingsDefaults: SettingsSnapshot = {
  currencySymbol: "$",
  retentionMonths: 3,
  dailyReminderEnabled: true,
  dailyReminderTime: "20:00",
};

export async function initializeDatabaseAsync(db: SQLiteDatabase) {
  sharedDatabase = db;
  await createSchemaAsync(db);
  await seedDefaultsAsync(db);
  await executeRollingPurge(db);
}

async function getDatabaseAsync() {
  if (sharedDatabase) {
    return sharedDatabase;
  }

  if (!databasePromise) {
    databasePromise = openDatabaseAsync("spendwise.db").then(async (db) => {
      await initializeDatabaseAsync(db);
      return db;
    });
  }

  sharedDatabase = await databasePromise;
  return sharedDatabase;
}

export async function getSettingsSnapshot(): Promise<SettingsSnapshot> {
  try {
    const db = await getDatabaseAsync();
    const rows = await db.getAllAsync<{ key: string; value: string }>("SELECT key, value FROM settings;");
    const map = new Map(rows.map((row) => [row.key, row.value]));

    return {
      currencySymbol: map.get("currency_symbol") ?? settingsDefaults.currencySymbol,
      retentionMonths: Number.parseInt(
        map.get("retention_months") ?? String(settingsDefaults.retentionMonths),
        10,
      ),
      dailyReminderEnabled: parseBooleanSetting(
        map.get("daily_reminder_enabled"),
        settingsDefaults.dailyReminderEnabled,
      ),
      dailyReminderTime: map.get("daily_reminder_time") ?? settingsDefaults.dailyReminderTime,
    };
  } catch (error) {
    console.log("getSettingsSnapshot error:", error);
    throw error;
  }
}

export async function saveSettingsSnapshotAsync(settings: SettingsSnapshot) {
  try {
    const db = await getDatabaseAsync();
    const entries: [string, string][] = [
      ["currency_symbol", settings.currencySymbol],
      ["retention_months", String(settings.retentionMonths)],
      ["daily_reminder_enabled", String(settings.dailyReminderEnabled)],
      ["daily_reminder_time", settings.dailyReminderTime],
    ];

    for (const [key, value] of entries) {
      await db.runAsync(
        `
          INSERT INTO settings (key, value)
          VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value;
        `,
        [key, value],
      );
    }

    await executeRollingPurge(db);
  } catch (error) {
    console.log("saveSettingsSnapshotAsync error:", error);
    throw error;
  }
}

export async function listCategoriesByTypeAsync(type: TransactionType): Promise<CategoryRow[]> {
  try {
    const db = await getDatabaseAsync();
    const rows = await db.getAllAsync<{
      id: number;
      name: string;
      type: TransactionType;
      icon_name: string;
      color_hex: string;
    }>(
      "SELECT id, name, type, icon_name, color_hex FROM categories WHERE type = ? ORDER BY name ASC;",
      [type],
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      iconName: row.icon_name,
      colorHex: row.color_hex,
    }));
  } catch (error) {
    console.log("listCategoriesByTypeAsync error:", error);
    throw error;
  }
}

export async function createTransactionAsync(input: CreateTransactionInput) {
  try {
    const db = await getDatabaseAsync();
    await db.runAsync(
      `
        INSERT INTO transactions (amount, type, category_id, note, created_at)
        VALUES (?, ?, ?, ?, ?);
      `,
      [input.amount, input.type, input.categoryId, input.note.trim(), input.createdAt],
    );
  } catch (error) {
    console.log("createTransactionAsync error:", error);
    throw error;
  }
}

export async function deleteTransactionByIdAsync(id: number) {
  try {
    const db = await getDatabaseAsync();
    await db.runAsync("DELETE FROM transactions WHERE id = ?;", [id]);
  } catch (error) {
    console.log("deleteTransactionByIdAsync error:", error);
    throw error;
  }
}

export async function listTransactionsAsync(filters: {
  typeFilter: TransactionTypeFilter;
  periodFilter: TransactionPeriodFilter;
}): Promise<TransactionListItem[]> {
  try {
    const db = await getDatabaseAsync();
    const clauses: string[] = [];
    const params: (string | number)[] = [];

    if (filters.typeFilter !== "ALL") {
      clauses.push("transactions.type = ?");
      params.push(filters.typeFilter);
    }

    if (filters.periodFilter !== "ALL_TIME") {
      const reference = new Date();
      const range =
        filters.periodFilter === "THIS_MONTH"
          ? getMonthRange(reference)
          : getMonthRange(new Date(reference.getFullYear(), reference.getMonth() - 1, 1));
      clauses.push("transactions.created_at >= ? AND transactions.created_at < ?");
      params.push(range.start, range.end);
    }

    const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
    const rows = await db.getAllAsync<{
      id: number;
      amount: number;
      type: TransactionType;
      category_id: number | null;
      note: string;
      created_at: number;
      category_name: string | null;
    }>(
      `
        SELECT
          transactions.id,
          transactions.amount,
          transactions.type,
          transactions.category_id,
          transactions.note,
          transactions.created_at,
          categories.name AS category_name
        FROM transactions
        LEFT JOIN categories ON categories.id = transactions.category_id
        ${where}
        ORDER BY transactions.created_at DESC, transactions.id DESC;
      `,
      params,
    );

    return rows.map((row) => ({
      id: row.id,
      amount: row.amount,
      type: row.type,
      categoryId: row.category_id,
      note: row.note,
      createdAt: row.created_at,
      categoryName: row.category_name,
    }));
  } catch (error) {
    console.log("listTransactionsAsync error:", error);
    throw error;
  }
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  try {
    const db = await getDatabaseAsync();
    const today = getLocalDayRange(new Date());

    const [spentRow, earnedRow, totalRow] = await Promise.all([
      db.getFirstAsync<{ value: number | null }>(
        "SELECT SUM(amount) AS value FROM transactions WHERE type = 'EXPENSE' AND created_at >= ? AND created_at < ?;",
        [today.start, today.end],
      ),
      db.getFirstAsync<{ value: number | null }>(
        "SELECT SUM(amount) AS value FROM transactions WHERE type = 'INCOME' AND created_at >= ? AND created_at < ?;",
        [today.start, today.end],
      ),
      db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM transactions;"),
    ]);

    return {
      todaySpent: spentRow?.value ?? 0,
      todayEarned: earnedRow?.value ?? 0,
      totalTransactions: totalRow?.count ?? 0,
    };
  } catch (error) {
    console.log("getDashboardSnapshot error:", error);
    throw error;
  }
}

export async function getAnalyticsSnapshotAsync(): Promise<AnalyticsSnapshot> {
  try {
    const db = await getDatabaseAsync();
    const settings = await getSettingsSnapshot();
    const range = getMonthRange(new Date());

    const [earnedRow, spentRow, breakdownRows] = await Promise.all([
      db.getFirstAsync<{ value: number | null }>(
        "SELECT SUM(amount) AS value FROM transactions WHERE type = 'INCOME' AND created_at >= ? AND created_at < ?;",
        [range.start, range.end],
      ),
      db.getFirstAsync<{ value: number | null }>(
        "SELECT SUM(amount) AS value FROM transactions WHERE type = 'EXPENSE' AND created_at >= ? AND created_at < ?;",
        [range.start, range.end],
      ),
      db.getAllAsync<{ category_name: string | null; total_amount: number }>(
        `
          SELECT categories.name AS category_name, SUM(transactions.amount) AS total_amount
          FROM transactions
          LEFT JOIN categories ON categories.id = transactions.category_id
          WHERE transactions.type = 'EXPENSE'
            AND transactions.created_at >= ?
            AND transactions.created_at < ?
          GROUP BY categories.name
          ORDER BY total_amount DESC;
        `,
        [range.start, range.end],
      ),
    ]);

    const totalExpense = spentRow?.value ?? 0;
    const breakdown: CategoryBreakdownItem[] = breakdownRows.map((row) => ({
      categoryName: row.category_name ?? "Uncategorized",
      totalAmount: row.total_amount,
      sharePercent: totalExpense > 0 ? (row.total_amount / totalExpense) * 100 : 0,
      currencySymbol: settings.currencySymbol,
    }));

    return {
      monthlyNetBalance: (earnedRow?.value ?? 0) - totalExpense,
      monthlySpent: totalExpense,
      monthlyEarned: earnedRow?.value ?? 0,
      breakdown,
    };
  } catch (error) {
    console.log("getAnalyticsSnapshotAsync error:", error);
    throw error;
  }
}

async function getBackupPayloadAsync(): Promise<SpendWiseBackup> {
  const db = await getDatabaseAsync();

  const [categoryRows, transactionRows, settings] = await Promise.all([
    db.getAllAsync<{
      id: number;
      name: string;
      type: TransactionType;
      icon_name: string;
      color_hex: string;
    }>("SELECT id, name, type, icon_name, color_hex FROM categories ORDER BY id ASC;"),
    db.getAllAsync<{
      id: number;
      amount: number;
      type: TransactionType;
      category_id: number | null;
      note: string;
      created_at: number;
    }>("SELECT id, amount, type, category_id, note, created_at FROM transactions ORDER BY id ASC;"),
    getSettingsSnapshot(),
  ]);

  return {
    schemaVersion: 1,
    exportedAt: Date.now(),
    categories: categoryRows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      iconName: row.icon_name,
      colorHex: row.color_hex,
    })),
    transactions: transactionRows.map((row) => ({
      id: row.id,
      amount: row.amount,
      type: row.type,
      categoryId: row.category_id,
      note: row.note,
      createdAt: row.created_at,
    })),
    settings,
  };
}

export async function getStorageSnapshotAsync(): Promise<StorageSnapshot> {
  try {
    const db = await getDatabaseAsync();
    const [categoriesCountRow, transactionsCountRow, settingsCountRow, payload] = await Promise.all([
      db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM categories;"),
      db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM transactions;"),
      db.getFirstAsync<{ count: number }>("SELECT COUNT(*) AS count FROM settings;"),
      getBackupPayloadAsync(),
    ]);

    return {
      categoriesCount: categoriesCountRow?.count ?? 0,
      transactionsCount: transactionsCountRow?.count ?? 0,
      settingsCount: settingsCountRow?.count ?? 0,
      estimatedBytes: buildStorageEstimateBytes(payload),
    };
  } catch (error) {
    console.log("getStorageSnapshotAsync error:", error);
    throw error;
  }
}

export async function clearAllDataAsync() {
  try {
    const db = await getDatabaseAsync();
    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(`
        DELETE FROM transactions;
        DELETE FROM categories;
        DELETE FROM settings;
      `);
    });
    await seedDefaultsAsync(db);
  } catch (error) {
    console.log("clearAllDataAsync error:", error);
    throw error;
  }
}

export async function exportBackupJsonAsync() {
  try {
    const payload = await getBackupPayloadAsync();
    const file = new File(Paths.document, `spendwise-backup-${Date.now()}.json`);
    file.create({ overwrite: true, intermediates: true });
    file.write(JSON.stringify(payload, null, 2));

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: "application/json",
        dialogTitle: "Share SpendWise backup",
      });
    }
  } catch (error) {
    console.log("exportBackupJsonAsync error:", error);
    throw error;
  }
}

export async function importBackupJsonAsync() {
  try {
    const result = await File.pickFileAsync({ mimeTypes: ["application/json"] });
    if (result.canceled) {
      return false;
    }

    const backup = JSON.parse(await result.result.text()) as unknown;
    assertValidBackup(backup);
    const db = await getDatabaseAsync();

    await db.withExclusiveTransactionAsync(async (txn) => {
      await txn.execAsync(`
        DELETE FROM transactions;
        DELETE FROM categories;
        DELETE FROM settings;
      `);

      for (const category of backup.categories) {
        await txn.runAsync(
          `
            INSERT INTO categories (id, name, type, icon_name, color_hex)
            VALUES (?, ?, ?, ?, ?);
          `,
          [category.id, category.name, category.type, category.iconName, category.colorHex],
        );
      }

      for (const transaction of backup.transactions) {
        await txn.runAsync(
          `
            INSERT INTO transactions (id, amount, type, category_id, note, created_at)
            VALUES (?, ?, ?, ?, ?, ?);
          `,
          [
            transaction.id,
            transaction.amount,
            transaction.type,
            transaction.categoryId,
            transaction.note,
            transaction.createdAt,
          ],
        );
      }

      const restoredSettings: SettingsSnapshot = {
        ...settingsDefaults,
        ...backup.settings,
      };

      await txn.runAsync("INSERT INTO settings (key, value) VALUES ('currency_symbol', ?);", [
        restoredSettings.currencySymbol,
      ]);
      await txn.runAsync("INSERT INTO settings (key, value) VALUES ('retention_months', ?);", [
        String(restoredSettings.retentionMonths),
      ]);
      await txn.runAsync("INSERT INTO settings (key, value) VALUES ('daily_reminder_enabled', ?);", [
        String(restoredSettings.dailyReminderEnabled),
      ]);
      await txn.runAsync("INSERT INTO settings (key, value) VALUES ('daily_reminder_time', ?);", [
        restoredSettings.dailyReminderTime,
      ]);
    });

    await executeRollingPurge(db);
    return true;
  } catch (error) {
    console.log("importBackupJsonAsync error:", error);
    throw error;
  }
}

export async function exportTransactionsCsvAsync() {
  try {
    const settings = await getSettingsSnapshot();
    const transactions = await listTransactionsAsync({
      typeFilter: "ALL",
      periodFilter: "ALL_TIME",
    });
    const csv = buildCsvFromTransactions(transactions, settings.currencySymbol);
    const file = new File(Paths.document, `spendwise-transactions-${Date.now()}.csv`);
    file.create({ overwrite: true, intermediates: true });
    file.write(csv);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri, {
        mimeType: "text/csv",
        dialogTitle: "Share SpendWise CSV export",
      });
    }
  } catch (error) {
    console.log("exportTransactionsCsvAsync error:", error);
    throw error;
  }
}

export type {
  AnalyticsSnapshot,
  CategoryBreakdownItem,
  CategoryRow,
  DashboardSnapshot,
  SettingsSnapshot,
  StorageSnapshot,
  TransactionListItem,
  TransactionPeriodFilter,
  TransactionType,
  TransactionTypeFilter,
};
