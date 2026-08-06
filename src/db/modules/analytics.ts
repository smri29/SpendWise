import type { AnalyticsSnapshot, CategoryBreakdownItem } from "@/db/types";
import { getDatabaseAsync } from "@/db/core/database";
import { getSettingsSnapshot } from "@/db/modules/settings";
import { getMonthRange } from "@/utils/format";

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
