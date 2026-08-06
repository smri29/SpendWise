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
    settings,
    topCategory,
    handleExport,
  };
}
