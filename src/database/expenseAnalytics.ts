import {
  Budget,
  BudgetProgress,
  CategoryBreakdown,
  Expense,
  ExpenseSummary,
  HistoryFilter,
} from "@/database/expenseDatabase.types";
import { parseExpenseDate } from "@/utils/formatters";

export function createEmptySummary(): ExpenseSummary {
  return {
    total: 0,
    todayTotal: 0,
    weekTotal: 0,
    monthTotal: 0,
    transactionCount: 0,
    averageTransaction: 0,
    topCategory: null,
  };
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getStartOfWeek(date: Date) {
  const copy = new Date(date);
  const day = copy.getDay();
  const diff = day === 0 ? 6 : day - 1;
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - diff);
  return copy;
}

function isInCurrentWeek(date: Date, now: Date) {
  const start = getStartOfWeek(now);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return date >= start && date < end;
}

function isInCurrentMonth(date: Date, now: Date) {
  return (
    date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
  );
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function getBudgetCycleRange(startDay: number, now = new Date()) {
  const normalizedStartDay = Math.min(Math.max(startDay, 1), 28);
  const currentMonthStartDay = Math.min(
    normalizedStartDay,
    getDaysInMonth(now.getFullYear(), now.getMonth()),
  );

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    currentMonthStartDay,
    0,
    0,
    0,
    0,
  );

  if (now < start) {
    start.setMonth(start.getMonth() - 1);
  }

  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  return { start, end };
}

export function filterExpensesByPeriod(expenses: Expense[], filter: HistoryFilter) {
  if (filter === "all") {
    return expenses;
  }

  const now = new Date();
  return expenses.filter((expense) => {
    const date = parseExpenseDate(expense.created_at);

    if (filter === "today") {
      return isSameDay(date, now);
    }

    if (filter === "week") {
      return isInCurrentWeek(date, now);
    }

    return isInCurrentMonth(date, now);
  });
}

export function searchExpenses(expenses: Expense[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return expenses;
  }

  return expenses.filter((expense) => {
    const note = expense.note ?? "";
    return (
      expense.category.toLowerCase().includes(normalizedQuery) ||
      note.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function buildCategoryBreakdown(expenses: Expense[]): CategoryBreakdown[] {
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const buckets = new Map<string, { total: number; count: number }>();

  for (const expense of expenses) {
    const current = buckets.get(expense.category) ?? { total: 0, count: 0 };
    current.total += expense.amount;
    current.count += 1;
    buckets.set(expense.category, current);
  }

  return [...buckets.entries()]
    .map(([category, value]) => ({
      category,
      total: value.total,
      count: value.count,
      share: total === 0 ? 0 : value.total / total,
    }))
    .sort((a, b) => b.total - a.total);
}

export function buildExpenseSummary(expenses: Expense[]): ExpenseSummary {
  if (expenses.length === 0) {
    return createEmptySummary();
  }

  const now = new Date();
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const todayTotal = expenses.reduce((sum, expense) => {
    const date = parseExpenseDate(expense.created_at);
    return isSameDay(date, now) ? sum + expense.amount : sum;
  }, 0);
  const weekTotal = expenses.reduce((sum, expense) => {
    const date = parseExpenseDate(expense.created_at);
    return isInCurrentWeek(date, now) ? sum + expense.amount : sum;
  }, 0);
  const monthTotal = expenses.reduce((sum, expense) => {
    const date = parseExpenseDate(expense.created_at);
    return isInCurrentMonth(date, now) ? sum + expense.amount : sum;
  }, 0);
  const categoryBreakdown = buildCategoryBreakdown(expenses);

  return {
    total,
    todayTotal,
    weekTotal,
    monthTotal,
    transactionCount: expenses.length,
    averageTransaction: total / expenses.length,
    topCategory: categoryBreakdown[0]?.category ?? null,
  };
}

export function getRecentCategories(expenses: Expense[], limit = 6) {
  const seen = new Set<string>();
  const categories: string[] = [];

  for (const expense of expenses) {
    if (seen.has(expense.category)) {
      continue;
    }

    seen.add(expense.category);
    categories.push(expense.category);

    if (categories.length >= limit) {
      break;
    }
  }

  return categories;
}

export function buildSmartTips(
  summary: ExpenseSummary,
  breakdown: CategoryBreakdown[],
  budgets: BudgetProgress[] = [],
) {
  const tips: string[] = [];

  if (summary.transactionCount === 0) {
    return [
      "Add your first expense to start seeing trends, budgets, and reminder-based nudges.",
    ];
  }

  tips.push(
    `This month you logged ${summary.transactionCount} expense${
      summary.transactionCount === 1 ? "" : "s"
    } with an average spend of ${summary.averageTransaction.toFixed(0)}.`,
  );

  if (breakdown[0]) {
    tips.push(
      `${breakdown[0].category} is your biggest category so far at ${(
        breakdown[0].share * 100
      ).toFixed(0)}% of total spending.`,
    );
  }

  const overBudget = budgets.find((budget) => budget.status === "over");
  const warningBudget = budgets.find((budget) => budget.status === "warning");

  if (overBudget) {
    tips.push(
      `${overBudget.category} is already over budget. Review the latest purchases in that category first.`,
    );
  } else if (warningBudget) {
    tips.push(
      `${warningBudget.category} is close to its monthly limit. A smaller spend there would keep you on track.`,
    );
  }

  if (summary.todayTotal > 0 && summary.weekTotal > summary.todayTotal) {
    tips.push("Today's total is below your weekly pace, which helps keep the week balanced.");
  } else if (summary.todayTotal > 0) {
    tips.push(
      "Today carries a large share of this week's spending, so it may be worth reviewing recent purchases.",
    );
  }

  return tips;
}

export function buildBudgetProgress(
  budgets: Budget[],
  expenses: Expense[],
  budgetStartDay = 1,
): BudgetProgress[] {
  const { start, end } = getBudgetCycleRange(budgetStartDay);
  const cycleExpenses = expenses.filter((expense) => {
    const date = parseExpenseDate(expense.created_at);
    return date >= start && date < end;
  });

  return budgets
    .map((budget) => {
      const spent = cycleExpenses
        .filter(
          (expense) =>
            expense.category.toLowerCase() === budget.category.toLowerCase(),
        )
        .reduce((sum, expense) => sum + expense.amount, 0);
      const remaining = budget.monthly_limit - spent;
      const usageRatio = budget.monthly_limit <= 0 ? 0 : spent / budget.monthly_limit;

      let status: BudgetProgress["status"] = "safe";
      if (usageRatio >= 1) {
        status = "over";
      } else if (usageRatio >= 0.8) {
        status = "warning";
      }

      return {
        ...budget,
        spent,
        remaining,
        usageRatio,
        status,
      };
    })
    .sort((a, b) => b.usageRatio - a.usageRatio);
}

export function getUpcomingReminderLabel(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
