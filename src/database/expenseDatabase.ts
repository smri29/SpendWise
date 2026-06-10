export type Expense = {
  id: number;
  amount: number;
  category: string;
  note: string | null;
  created_at: string;
};

export async function createExpensesTable() {
  console.log("SQLite table creation skipped on web");
}

export async function insertExpense(
  amount: number,
  category: string,
  note: string,
) {
  console.log("SQLite insert skipped on web:", {
    amount,
    category,
    note,
  });

  return Date.now();
}

export async function getAllExpenses(): Promise<Expense[]> {
  console.log("SQLite fetch skipped on web");

  return [];
}
