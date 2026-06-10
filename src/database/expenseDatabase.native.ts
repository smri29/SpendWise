import * as SQLite from "expo-sqlite";

export type Expense = {
  id: number;
  amount: number;
  category: string;
  note: string | null;
  created_at: string;
};

export async function getDatabase() {
  const database = await SQLite.openDatabaseAsync("spendwise.db");
  return database;
}

export async function createExpensesTable() {
  const database = await getDatabase();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
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
    [amount, category, note],
  );

  return result.lastInsertRowId;
}

export async function getAllExpenses(): Promise<Expense[]> {
  const database = await getDatabase();

  const expenses = await database.getAllAsync<Expense>(
    `
    SELECT *
    FROM expenses
    ORDER BY id DESC;
    `,
  );

  return expenses;
}
