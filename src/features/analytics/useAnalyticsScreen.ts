import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

import {
  exportTransactionsCsvAsync,
  getAnalyticsSnapshotAsync,
  getSettingsSnapshot,
  type AnalyticsSnapshot,
  type SettingsSnapshot,
} from "@/db";
import type { RadarMetric } from "@/components/charts/RadarChart";

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
  appLockEnabled: false,
  pdfReportLastExportAt: null,
};

export function useAnalyticsScreen() {
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

  const topCategory = useMemo(() => analytics.breakdown[0] ?? null, [analytics.breakdown]);
  const insights = useMemo(() => {
    const earned = analytics.monthlyEarned;
    const spent = analytics.monthlySpent;
    const totalFlow = earned + spent;
    const topShare = topCategory?.sharePercent ?? 0;
    const categoryCount = analytics.breakdown.length;
    const dominantValue = Math.max(earned, spent, 1);
    const incomeCoverage = spent <= 0 ? (earned > 0 ? 10 : 0) : Math.min(10, (earned / spent) * 10);
    const netHealth =
      earned <= 0 && spent <= 0
        ? 0
        : Math.max(0, Math.min(10, ((earned - spent) / dominantValue) * 5 + 5));
    const diversity = Math.min(10, (categoryCount / 5) * 10);
    const concentrationSafety = Math.max(0, 10 - topShare / 10);
    const spendingIntensity =
      totalFlow <= 0 ? 0 : Math.max(0, Math.min(10, 10 - (spent / totalFlow) * 10));

    const radarMetrics: RadarMetric[] = [
      { label: "Coverage", value: incomeCoverage },
      { label: "Net", value: netHealth },
      { label: "Diversity", value: diversity },
      { label: "Spread", value: concentrationSafety },
      { label: "Control", value: spendingIntensity },
    ];

    const expenseToIncomeRatio =
      earned > 0 ? spent / earned : spent > 0 ? Number.POSITIVE_INFINITY : 0;

    const incomeSharePercent = totalFlow > 0 ? (earned / totalFlow) * 100 : 0;
    const expenseSharePercent = totalFlow > 0 ? (spent / totalFlow) * 100 : 0;
    const netDirection = analytics.monthlyNetBalance >= 0 ? "surplus" : "deficit";

    return {
      expenseSharePercent,
      expenseToIncomeRatio,
      incomeSharePercent,
      netDirection,
      radarMetrics,
    };
  }, [
    analytics.breakdown.length,
    analytics.monthlyEarned,
    analytics.monthlyNetBalance,
    analytics.monthlySpent,
    topCategory?.sharePercent,
  ]);

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

  return {
    analytics,
    errorMessage,
    isExporting,
    insights,
    settings,
    topCategory,
    handleExport,
  };
}
