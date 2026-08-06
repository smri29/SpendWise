import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getDashboardSnapshot,
  getSettingsSnapshot,
  type DashboardSnapshot,
  type SettingsSnapshot,
} from "@/db";

const defaultSummary: DashboardSnapshot = {
  todaySpent: 0,
  todayEarned: 0,
  totalTransactions: 0,
};

const defaultSettings: SettingsSnapshot = {
  currencySymbol: "$",
  retentionMonths: 3,
  dailyReminderEnabled: true,
  dailyReminderTime: "20:00",
};

/**
 * Keeps the home screen focused on glanceable UI while data orchestration,
 * refresh rules, and derived labels live in a dedicated hook.
 */
export function useHomeDashboard() {
  const [now, setNow] = useState(() => new Date());
  const [summary, setSummary] = useState<DashboardSnapshot>(defaultSummary);
  const [settings, setSettings] = useState<SettingsSnapshot>(defaultSettings);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const [nextSummary, nextSettings] = await Promise.all([
        getDashboardSnapshot(),
        getSettingsSnapshot(),
      ]);
      setSummary(nextSummary);
      setSettings(nextSettings);
      setErrorMessage(null);
    } catch (error) {
      console.log("Home load error:", error);
      setErrorMessage("Unable to load today's balance from local storage.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

  const reminderLabel = useMemo(() => {
    return settings.dailyReminderEnabled
      ? `Daily reminder at ${settings.dailyReminderTime}`
      : "Daily reminder is off";
  }, [settings.dailyReminderEnabled, settings.dailyReminderTime]);

  return {
    errorMessage,
    now,
    reminderLabel,
    settings,
    summary,
  };
}
