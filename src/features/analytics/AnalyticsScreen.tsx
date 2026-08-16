import { Pressable, Text, View } from "react-native";

import { DonutChart } from "@/components/charts/DonutChart";
import { RadarChart } from "@/components/charts/RadarChart";
import { ScreenFrame } from "@/components/ui/ScreenFrame";
import { SummaryPill } from "@/components/ui/SummaryPill";
import { analyticsStyles as styles } from "@/features/analytics/styles";
import { useAnalyticsScreen } from "@/features/analytics/useAnalyticsScreen";
import { formatMoney } from "@/utils/format";

export default function AnalyticsScreen() {
  const { analytics, errorMessage, insights, isExporting, settings, topCategory, handleExport } =
    useAnalyticsScreen();
  const incomeWidth: `${number}%` = `${Math.max(6, insights.incomeSharePercent)}%`;
  const expenseWidth: `${number}%` = `${Math.max(6, insights.expenseSharePercent)}%`;
  const ratioText = Number.isFinite(insights.expenseToIncomeRatio)
    ? `${insights.expenseToIncomeRatio.toFixed(2)}x expense-to-income`
    : "Spending without recorded income";

  return (
    <ScreenFrame contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Analytics</Text>
          <Text style={styles.pageSubtitle}>Monthly balance and category trends.</Text>
        </View>
        <Pressable style={styles.exportButton} onPress={handleExport} disabled={isExporting}>
          <Text style={styles.exportText}>{isExporting ? "Exporting..." : "Export"}</Text>
        </Pressable>
      </View>

      <View style={styles.cardsRow}>
        <SummaryPill
          label="Net Balance"
          value={formatMoney(analytics.monthlyNetBalance, settings.currencySymbol)}
          tone={analytics.monthlyNetBalance >= 0 ? "income" : "expense"}
        />
        <SummaryPill
          label="Spent This Month"
          value={formatMoney(analytics.monthlySpent, settings.currencySymbol)}
          tone="expense"
        />
      </View>

      <View style={styles.cardsRow}>
        <SummaryPill
          label="Earned This Month"
          value={formatMoney(analytics.monthlyEarned, settings.currencySymbol)}
          tone="income"
        />
        <View style={styles.highlightCard}>
          <Text style={styles.highlightLabel}>Top expense category</Text>
          <Text style={styles.highlightValue}>{topCategory?.categoryName ?? "No data yet"}</Text>
          <Text style={styles.highlightMeta}>
            {topCategory
              ? `${topCategory.sharePercent.toFixed(0)}% of this month expenses`
              : "Add a few transactions to unlock category insights"}
          </Text>
        </View>
      </View>

      {errorMessage ? <Text style={styles.inlineError}>{errorMessage}</Text> : null}

      <View style={styles.insightStrip}>
        <View style={styles.stripHeader}>
          <Text style={styles.stripTitle}>Income vs Expense Relation</Text>
          <View style={styles.stripBadge}>
            <Text style={styles.stripBadgeText}>{insights.netDirection}</Text>
          </View>
        </View>
        <Text style={styles.stripText}>
          {ratioText}. This helps users understand whether monthly cash coming in is supporting the
          money going out.
        </Text>
        <View style={styles.relationBarTrack}>
          <View style={[styles.relationBarIncome, { width: incomeWidth }]} />
          <View style={[styles.relationBarExpense, { width: expenseWidth }]} />
        </View>
        <View style={styles.relationLegendRow}>
          <Text style={styles.relationLegendText}>
            Income {insights.incomeSharePercent.toFixed(0)}%
          </Text>
          <Text style={styles.relationLegendText}>
            Expense {insights.expenseSharePercent.toFixed(0)}%
          </Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Financial Balance Radar</Text>
        <Text style={styles.chartSubtext}>
          Spider view of coverage, net health, category diversity, concentration spread, and
          spending control.
        </Text>
        <RadarChart metrics={insights.radarMetrics} />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        <Text style={styles.chartSubtext}>
          Donut chart shows where this month expense total is concentrated across categories.
        </Text>
        <DonutChart data={analytics.breakdown} />
      </View>
    </ScreenFrame>
  );
}
