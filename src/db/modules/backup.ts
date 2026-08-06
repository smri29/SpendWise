import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { getDatabaseAsync } from "@/db/core/database";
import { getSettingsSnapshot, settingsDefaults } from "@/db/modules/settings";
import { listTransactionsAsync } from "@/db/modules/transactions";
import { executeRollingPurge, seedDefaultsAsync } from "@/db/schema";
import type {
  SettingsSnapshot,
  SpendWiseBackup,
  StorageSnapshot,
  TransactionType,
} from "@/db/types";
import {
  assertValidBackup,
  buildCsvFromTransactions,
  buildStorageEstimateBytes,
} from "@/utils/format";

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
