import type {
  CategoryRow,
  CreateTransactionInput,
  DashboardSnapshot,
  TransactionListItem,
  TransactionPeriodFilter,
  TransactionType,
  TransactionTypeFilter,
} from "@/db/types";
import { getDatabaseAsync } from "@/db/core/database";
import { getLocalDayRange, getMonthRange } from "@/utils/format";

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
