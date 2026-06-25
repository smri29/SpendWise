import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { SpendWiseColors } from "@/constants/spendwise";
import { buildSmartTips, createEmptySummary } from "@/database/expenseAnalytics";
import {
  getBudgetProgress,
  getCategoryBreakdown,
  getExpenseSummary,
  getSettings,
} from "@/database/expenseDatabase";
import {
  AppSettings,
  BudgetProgress,
  CategoryBreakdown,
  ExpenseSummary,
} from "@/database/expenseDatabase.types";
import { formatCurrencyWithCode, formatPercentage } from "@/utils/formatters";

export default function InsightsScreen() {
  const [summary, setSummary] = useState<ExpenseSummary>(createEmptySummary());
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    currency: "BDT",
    notifications_enabled: 1,
    monthly_budget_start_day: 1,
  });

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadInsights() {
        try {
          const [nextSummary, nextBreakdown, nextBudgets, nextSettings] =
            await Promise.all([
              getExpenseSummary(),
              getCategoryBreakdown(),
              getBudgetProgress(),
              getSettings(),
            ]);

          if (!isActive) {
            return;
          }

          setSummary(nextSummary);
          setBreakdown(nextBreakdown);
          setBudgets(nextBudgets);
          setSettings(nextSettings);
        } catch (error) {
          console.log("Insights load error:", error);
        }
      }

      loadInsights();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const tips = useMemo(
    () => buildSmartTips(summary, breakdown, budgets),
    [summary, breakdown, budgets],
  );

  const strongestBudget = budgets[0];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.title}>Spending Insights</Text>
        <Text style={styles.subtitle}>
          SpendWise turns your expense log into a practical coaching layer for the month ahead.
        </Text>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Average Expense</Text>
          <Text style={styles.metricValue}>
            {formatCurrencyWithCode(summary.averageTransaction, settings.currency)}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Transactions</Text>
          <Text style={styles.metricValue}>{summary.transactionCount}</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Top Category</Text>
          <Text style={styles.metricValueText}>{summary.topCategory ?? "None yet"}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Month Total</Text>
          <Text style={styles.metricValue}>
            {formatCurrencyWithCode(summary.monthTotal, settings.currency)}
          </Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Budget Pressure</Text>
        {strongestBudget ? (
          <>
            <Text style={styles.focusText}>
              {strongestBudget.category} is currently the most pressured budget.
            </Text>
            <Text style={styles.focusValue}>{formatPercentage(strongestBudget.usageRatio)}</Text>
            <Text style={styles.focusMeta}>
              {formatCurrencyWithCode(strongestBudget.spent, settings.currency)} spent from{" "}
              {formatCurrencyWithCode(
                strongestBudget.monthly_limit,
                settings.currency,
              )}
            </Text>
          </>
        ) : (
          <Text style={styles.emptyText}>
            Create budgets to unlock budget pressure analysis and warnings.
          </Text>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        {breakdown.length === 0 ? (
          <Text style={styles.emptyText}>
            Add a few expenses and SpendWise will show your category distribution here.
          </Text>
        ) : (
          breakdown.map((item, index) => (
            <View key={item.category} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownCategory}>{item.category}</Text>
                <Text style={styles.breakdownAmount}>
                  {formatCurrencyWithCode(item.total, settings.currency)}
                </Text>
              </View>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.max(item.share * 100, 6)}%`,
                      backgroundColor:
                        SpendWiseColors.chart[index % SpendWiseColors.chart.length],
                    },
                  ]}
                />
              </View>
              <Text style={styles.breakdownMeta}>
                {item.count} transaction{item.count === 1 ? "" : "s"} •{" "}
                {(item.share * 100).toFixed(0)}% of total
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Smart Tips</Text>
        <View style={styles.tipsList}>
          {tips.map((tip) => (
            <View key={tip} style={styles.tipCard}>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SpendWiseColors.background },
  content: { padding: 20, paddingBottom: 32, gap: 16 },
  heroCard: {
    backgroundColor: SpendWiseColors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
    gap: 8,
  },
  title: { fontSize: 30, fontWeight: "bold", color: SpendWiseColors.text },
  subtitle: { fontSize: 15, lineHeight: 22, color: SpendWiseColors.textMuted },
  metricsGrid: { flexDirection: "row", gap: 12 },
  metricCard: {
    flex: 1,
    backgroundColor: SpendWiseColors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
  },
  metricLabel: { fontSize: 13, color: SpendWiseColors.textMuted, marginBottom: 8 },
  metricValue: { fontSize: 20, fontWeight: "700", color: SpendWiseColors.text },
  metricValueText: { fontSize: 18, fontWeight: "700", color: SpendWiseColors.text },
  sectionCard: {
    backgroundColor: SpendWiseColors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
    gap: 14,
  },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: SpendWiseColors.text },
  emptyText: { fontSize: 14, lineHeight: 21, color: SpendWiseColors.textMuted },
  focusText: { fontSize: 14, color: SpendWiseColors.textMuted },
  focusValue: { fontSize: 34, fontWeight: "bold", color: SpendWiseColors.warning },
  focusMeta: { fontSize: 14, color: SpendWiseColors.textMuted },
  breakdownItem: { gap: 8 },
  breakdownHeader: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  breakdownCategory: { fontSize: 16, fontWeight: "700", color: SpendWiseColors.text },
  breakdownAmount: { fontSize: 15, fontWeight: "700", color: SpendWiseColors.text },
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: SpendWiseColors.surfaceMuted,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 999 },
  breakdownMeta: { fontSize: 13, color: SpendWiseColors.textMuted },
  tipsList: { gap: 10 },
  tipCard: {
    backgroundColor: SpendWiseColors.surfaceMuted,
    borderRadius: 16,
    padding: 14,
  },
  tipText: { fontSize: 14, lineHeight: 21, color: SpendWiseColors.text },
});
