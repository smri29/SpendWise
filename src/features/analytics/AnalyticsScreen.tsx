import { Pressable, Text, View } from "react-native";

import { DonutChart } from "@/components/charts/DonutChart";
import { ScreenFrame } from "@/components/ui/ScreenFrame";
import { SummaryPill } from "@/components/ui/SummaryPill";
import { analyticsStyles as styles } from "@/features/analytics/styles";
import { useAnalyticsScreen } from "@/features/analytics/useAnalyticsScreen";
import { formatMoney } from "@/utils/format";

export default function AnalyticsScreen() {
  const { analytics, errorMessage, isExporting, settings, topCategory, handleExport } =
    useAnalyticsScreen();

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
              ? `${topCategory.sharePercent.toFixed(0)}% of this month's expenses`
              : "Add a few transactions to unlock category insights"}
          </Text>
        </View>
      </View>

      {errorMessage ? <Text style={styles.inlineError}>{errorMessage}</Text> : null}

      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        <DonutChart data={analytics.breakdown} />
      </View>
    </ScreenFrame>
  );
}
