import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

import { DonutChart } from "@/components/charts/DonutChart";
import { ScreenFrame } from "@/components/ui/ScreenFrame";
import {
  exportTransactionsCsvAsync,
  getAnalyticsSnapshotAsync,
  getSettingsSnapshot,
  type AnalyticsSnapshot,
  type SettingsSnapshot,
} from "@/db";
import { formatCurrency } from "@/utils/format";
import { SpendWiseTheme } from "@/theme/spendwise";

const defaultAnalytics: AnalyticsSnapshot = {
  monthlyNetBalance: 0,
  monthlySpent: 0,
  monthlyEarned: 0,
  breakdown: [],
};

const defaultSettings: SettingsSnapshot = {
  currencySymbol: "$",
  retentionMonths: 3,
  dailyReminderEnabled: true,
  dailyReminderTime: "20:00",
};

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(defaultAnalytics);
  const [settings, setSettings] = useState<SettingsSnapshot>(defaultSettings);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const loadAnalytics = useCallback(async () => {
    try {
      const [snapshot, nextSettings] = await Promise.all([
        getAnalyticsSnapshotAsync(),
        getSettingsSnapshot(),
      ]);
      setAnalytics(snapshot);
      setSettings(nextSettings);
      setErrorMessage(null);
    } catch (error) {
      console.log("Analytics load error:", error);
      setErrorMessage("Analytics could not be generated from the local database.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadAnalytics();
    }, [loadAnalytics]),
  );

  async function handleExport() {
    try {
      setIsExporting(true);
      await exportTransactionsCsvAsync();
    } catch (error) {
      console.log("Analytics export error:", error);
      Alert.alert("Export failed", "CSV export could not be completed.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <ScreenFrame contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.pageTitle}>Analytics</Text>
        <Pressable style={styles.exportButton} onPress={handleExport} disabled={isExporting}>
          <Text style={styles.exportText}>{isExporting ? "Exporting..." : "Export"}</Text>
        </Pressable>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>Monthly Net Balance</Text>
        <Text
          style={[
            styles.metricValue,
            analytics.monthlyNetBalance >= 0 ? styles.positiveValue : styles.negativeValue,
          ]}
        >
          {formatCurrency(analytics.monthlyNetBalance, settings.currencySymbol)}
        </Text>
        <Text style={styles.metricMeta}>
          Earned {formatCurrency(analytics.monthlyEarned, settings.currencySymbol)} • Spent{" "}
          {formatCurrency(analytics.monthlySpent, settings.currencySymbol)}
        </Text>
      </View>

      {errorMessage ? <Text style={styles.inlineError}>{errorMessage}</Text> : null}

      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        <DonutChart data={analytics.breakdown} />
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 116,
    paddingBottom: 36,
    gap: 18,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#4B69A8",
  },
  exportButton: {
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.80)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  exportText: {
    color: SpendWiseTheme.colors.text,
    fontWeight: "800",
    fontSize: 16,
  },
  metricCard: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.72)",
    padding: 22,
  },
  metricLabel: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  metricValue: {
    marginTop: 8,
    fontSize: 34,
    fontWeight: "800",
  },
  positiveValue: {
    color: SpendWiseTheme.colors.income,
  },
  negativeValue: {
    color: SpendWiseTheme.colors.expense,
  },
  metricMeta: {
    marginTop: 8,
    color: SpendWiseTheme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  inlineError: {
    color: SpendWiseTheme.colors.expense,
    fontWeight: "700",
    fontSize: 13,
  },
  chartCard: {
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.54)",
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: SpendWiseTheme.colors.text,
  },
});
