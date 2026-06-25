import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { SpendWiseColors } from "@/constants/spendwise";
import {
  createEmptySummary,
  getUpcomingReminderLabel,
} from "@/database/expenseAnalytics";
import {
  getAllExpenses,
  getAllReminders,
  getBudgetProgress,
  getExpenseSummary,
  getSettings,
} from "@/database/expenseDatabase";
import {
  AppSettings,
  BudgetProgress,
  Expense,
  ExpenseSummary,
  Reminder,
} from "@/database/expenseDatabase.types";
import {
  formatCompactCurrency,
  formatCurrencyWithCode,
  formatDateTime,
  formatPercentage,
} from "@/utils/formatters";

export default function HomeScreen() {
  const router = useRouter();
  const [summary, setSummary] = useState<ExpenseSummary>(createEmptySummary());
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    currency: "BDT",
    notifications_enabled: 1,
    monthly_budget_start_day: 1,
  });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadDashboard() {
        try {
          const [dashboardSummary, expenses, budgetProgress, allReminders, nextSettings] =
            await Promise.all([
              getExpenseSummary(),
              getAllExpenses(),
              getBudgetProgress(),
              getAllReminders(),
              getSettings(),
            ]);

          if (!isActive) {
            return;
          }

          setSummary(dashboardSummary);
          setRecentExpenses(expenses.slice(0, 4));
          setBudgets(budgetProgress.slice(0, 3));
          setReminders(allReminders.filter((item) => item.enabled === 1).slice(0, 2));
          setSettings(nextSettings);
        } catch (error) {
          console.log("Dashboard load error:", error);
        }
      }

      loadDashboard();

      return () => {
        isActive = false;
      };
    }, []),
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Android-first money companion</Text>
        <Text style={styles.appName}>SpendWise</Text>
        <Text style={styles.subtitle}>
          Track spending, control budgets, and stay ahead with reminders and smart insights.
        </Text>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Tracked Spending</Text>
        <Text style={styles.totalAmount}>
          {formatCurrencyWithCode(summary.total, settings.currency)}
        </Text>
        <Text style={styles.totalMeta}>
          {summary.transactionCount} transaction{summary.transactionCount === 1 ? "" : "s"} logged
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Today</Text>
          <Text style={styles.statValue}>
            {formatCompactCurrency(summary.todayTotal, settings.currency)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>This Week</Text>
          <Text style={styles.statValue}>
            {formatCompactCurrency(summary.weekTotal, settings.currency)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>This Month</Text>
          <Text style={styles.statValue}>
            {formatCompactCurrency(summary.monthTotal, settings.currency)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Top Category</Text>
          <Text style={styles.statValueSmall}>{summary.topCategory ?? "None yet"}</Text>
        </View>
      </View>

      <View style={styles.quickGrid}>
        <Pressable style={styles.quickCardPrimary} onPress={() => router.push("/add-expense")}>
          <Text style={styles.quickTitlePrimary}>Add Expense</Text>
          <Text style={styles.quickTextPrimary}>Capture today’s spending instantly.</Text>
        </Pressable>
        <Pressable style={styles.quickCard} onPress={() => router.push("/expenses")}>
          <Text style={styles.quickTitle}>History</Text>
          <Text style={styles.quickText}>Search, filter, edit, and review all entries.</Text>
        </Pressable>
        <Pressable style={styles.quickCard} onPress={() => router.push("/budgets")}>
          <Text style={styles.quickTitle}>Budgets</Text>
          <Text style={styles.quickText}>Set monthly limits and spot trouble early.</Text>
        </Pressable>
        <Pressable style={styles.quickCard} onPress={() => router.push("/reminders")}>
          <Text style={styles.quickTitle}>Reminders</Text>
          <Text style={styles.quickText}>Schedule recurring nudges to log planned spending.</Text>
        </Pressable>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Budget Snapshot</Text>
        <Pressable onPress={() => router.push("/budgets")}>
          <Text style={styles.sectionAction}>Manage</Text>
        </Pressable>
      </View>

      {budgets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No budgets yet</Text>
          <Text style={styles.emptyText}>
            Create category budgets to make SpendWise feel proactive, not just reactive.
          </Text>
        </View>
      ) : (
        budgets.map((budget) => (
          <Pressable
            key={budget.id}
            style={styles.budgetCard}
            onPress={() => router.push("/budgets")}
          >
            <View style={styles.expenseRow}>
              <Text style={styles.expenseCategory}>{budget.category}</Text>
              <Text style={styles.expenseAmount}>{formatPercentage(budget.usageRatio)}</Text>
            </View>
            <Text style={styles.budgetMeta}>
              {formatCurrencyWithCode(budget.spent, settings.currency)} of{" "}
              {formatCurrencyWithCode(budget.monthly_limit, settings.currency)}
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min(Math.max(budget.usageRatio * 100, 6), 100)}%`,
                    backgroundColor:
                      budget.status === "over"
                        ? SpendWiseColors.danger
                        : budget.status === "warning"
                          ? SpendWiseColors.warning
                          : SpendWiseColors.success,
                  },
                ]}
              />
            </View>
          </Pressable>
        ))
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
        <Pressable onPress={() => router.push("/reminders")}>
          <Text style={styles.sectionAction}>Edit</Text>
        </Pressable>
      </View>

      {reminders.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No reminders enabled</Text>
          <Text style={styles.emptyText}>
            Add daily, weekly, or monthly reminders so important expenses never slip through.
          </Text>
        </View>
      ) : (
        reminders.map((reminder) => (
          <Pressable
            key={reminder.id}
            style={styles.reminderCard}
            onPress={() => router.push("/reminders")}
          >
            <Text style={styles.reminderTitle}>{reminder.title}</Text>
            <Text style={styles.reminderMeta}>
              {reminder.frequency} at {getUpcomingReminderLabel(reminder.hour, reminder.minute)}
            </Text>
          </Pressable>
        ))
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Expenses</Text>
        <Pressable onPress={() => router.push("/expenses")}>
          <Text style={styles.sectionAction}>See all</Text>
        </Pressable>
      </View>

      {recentExpenses.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No expenses yet</Text>
          <Text style={styles.emptyText}>
            Start by adding your first expense and SpendWise will build your dashboard automatically.
          </Text>
        </View>
      ) : (
        recentExpenses.map((expense) => (
          <Pressable
            key={expense.id}
            style={styles.expenseCard}
            onPress={() =>
              router.push({
                pathname: "/add-expense",
                params: { expenseId: String(expense.id) },
              })
            }
          >
            <View style={styles.expenseRow}>
              <View style={styles.expenseCopy}>
                <Text style={styles.expenseCategory}>{expense.category}</Text>
                <Text style={styles.expenseNote}>
                  {expense.note?.trim() ? expense.note : "No note"}
                </Text>
              </View>
              <Text style={styles.expenseAmount}>
                {formatCurrencyWithCode(expense.amount, settings.currency)}
              </Text>
            </View>
            <Text style={styles.expenseDate}>{formatDateTime(expense.created_at)}</Text>
          </Pressable>
        ))
      )}

      <Pressable style={styles.footerButton} onPress={() => router.push("/settings")}>
        <Text style={styles.footerButtonText}>Open Settings and Backup Tools</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SpendWiseColors.background },
  content: { padding: 20, paddingBottom: 32, gap: 16 },
  hero: { paddingTop: 28, gap: 8 },
  eyebrow: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: SpendWiseColors.primary,
  },
  appName: { fontSize: 38, fontWeight: "bold", color: SpendWiseColors.text },
  subtitle: { fontSize: 16, color: SpendWiseColors.textMuted, lineHeight: 24 },
  totalCard: { backgroundColor: SpendWiseColors.primary, padding: 24, borderRadius: 24 },
  totalLabel: { color: "#DCEAFE", fontSize: 14, marginBottom: 10 },
  totalAmount: { fontSize: 34, fontWeight: "bold", color: "#FFFFFF" },
  totalMeta: { marginTop: 8, color: "#DCEAFE", fontSize: 14 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    width: "48%",
    backgroundColor: SpendWiseColors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
  },
  statLabel: { fontSize: 13, color: SpendWiseColors.textMuted, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: "700", color: SpendWiseColors.text },
  statValueSmall: { fontSize: 18, fontWeight: "700", color: SpendWiseColors.text },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quickCardPrimary: {
    width: "48%",
    minHeight: 126,
    backgroundColor: SpendWiseColors.text,
    borderRadius: 20,
    padding: 18,
    justifyContent: "space-between",
  },
  quickCard: {
    width: "48%",
    minHeight: 126,
    backgroundColor: SpendWiseColors.surface,
    borderRadius: 20,
    padding: 18,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
  },
  quickTitlePrimary: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  quickTextPrimary: { fontSize: 13, color: "#D1D5DB", lineHeight: 20 },
  quickTitle: { fontSize: 18, fontWeight: "700", color: SpendWiseColors.text },
  quickText: { fontSize: 13, color: SpendWiseColors.textMuted, lineHeight: 20 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: SpendWiseColors.text },
  sectionAction: { fontSize: 14, fontWeight: "700", color: SpendWiseColors.primary },
  emptyCard: {
    backgroundColor: SpendWiseColors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: SpendWiseColors.text, marginBottom: 6 },
  emptyText: { fontSize: 14, color: SpendWiseColors.textMuted, lineHeight: 21 },
  budgetCard: {
    backgroundColor: SpendWiseColors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
    gap: 10,
  },
  budgetMeta: { fontSize: 13, color: SpendWiseColors.textMuted },
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: SpendWiseColors.surfaceMuted,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 999 },
  reminderCard: {
    backgroundColor: SpendWiseColors.warningSoft,
    padding: 18,
    borderRadius: 20,
    gap: 4,
  },
  reminderTitle: { fontSize: 16, fontWeight: "700", color: SpendWiseColors.text },
  reminderMeta: { fontSize: 14, color: SpendWiseColors.textMuted },
  expenseCard: {
    backgroundColor: SpendWiseColors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
    gap: 10,
  },
  expenseRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  expenseCopy: { flex: 1, gap: 4 },
  expenseCategory: { fontSize: 17, fontWeight: "700", color: SpendWiseColors.text },
  expenseNote: { fontSize: 14, color: SpendWiseColors.textMuted },
  expenseAmount: { fontSize: 16, fontWeight: "700", color: SpendWiseColors.success },
  expenseDate: { fontSize: 13, color: SpendWiseColors.textMuted },
  footerButton: {
    backgroundColor: SpendWiseColors.surfaceMuted,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
  },
  footerButtonText: { color: SpendWiseColors.text, fontWeight: "700", fontSize: 15 },
});
