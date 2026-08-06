import type { SQLiteDatabase } from "expo-sqlite";

const categorySeeds = [
  ["Food & Dining", "EXPENSE", "restaurant-outline", "#C62828"],
  ["Transport", "EXPENSE", "bus-outline", "#E65100"],
  ["Shopping", "EXPENSE", "bag-handle-outline", "#6A1B9A"],
  ["Bills & Utilities", "EXPENSE", "flash-outline", "#3949AB"],
  ["Entertainment", "EXPENSE", "film-outline", "#00897B"],
  ["Health", "EXPENSE", "medkit-outline", "#D81B60"],
  ["Other Expense", "EXPENSE", "receipt-outline", "#5D4037"],
  ["Salary", "INCOME", "wallet-outline", "#2E7D32"],
  ["Freelance", "INCOME", "briefcase-outline", "#00897B"],
  ["Investments", "INCOME", "trending-up-outline", "#1565C0"],
  ["Gifts", "INCOME", "gift-outline", "#AD1457"],
  ["Other Income", "INCOME", "cash-outline", "#558B2F"],
] as const;

const defaultSettings = [
  ["currency_symbol", "$"],
  ["retention_months", "3"],
  ["daily_reminder_enabled", "true"],
  ["daily_reminder_time", "20:00"],
] as const;

export async function createSchemaAsync(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('EXPENSE', 'INCOME')) NOT NULL,
      icon_name TEXT NOT NULL DEFAULT 'pricetag-outline',
      color_hex TEXT NOT NULL DEFAULT '#1A237E'
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      type TEXT CHECK(type IN ('EXPENSE', 'INCOME')) NOT NULL,
      category_id INTEGER,
      note TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

export async function seedDefaultsAsync(db: SQLiteDatabase) {
  const categoriesCountRow = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM categories;",
  );
  if ((categoriesCountRow?.count ?? 0) === 0) {
    for (const [name, type, iconName, colorHex] of categorySeeds) {
      await db.runAsync(
        "INSERT INTO categories (name, type, icon_name, color_hex) VALUES (?, ?, ?, ?);",
        [name, type, iconName, colorHex],
      );
    }
  }

  const settingsCountRow = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM settings;",
  );
  if ((settingsCountRow?.count ?? 0) === 0) {
    for (const [key, value] of defaultSettings) {
      await db.runAsync("INSERT INTO settings (key, value) VALUES (?, ?);", [key, value]);
    }
  }
}

export async function executeRollingPurge(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'retention_months';",
  );
  const monthsNum = Number.parseInt(row?.value ?? "3", 10);

  if (monthsNum > 0) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsNum);
    const cutoffTimestamp = cutoffDate.getTime();

    await db.runAsync("DELETE FROM transactions WHERE created_at < ?;", [cutoffTimestamp]);
  }
}
