import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";

import {
  clearAllDataAsync,
  exportBackupJsonAsync,
  getSettingsSnapshot,
  getStorageSnapshotAsync,
  importBackupJsonAsync,
  saveSettingsSnapshotAsync,
  type SettingsSnapshot,
  type StorageSnapshot,
} from "@/db";
import { getAppLockAvailabilityAsync } from "@/services/appLock";
import { exportPdfReportAsync } from "@/services/pdfReport";
import { syncDailyReminderNotificationAsync } from "@/services/reminders";
import {
  formatReminderTime,
  formatShortDateTime,
  parseReminderTime,
} from "@/utils/format";

const defaultSettings: SettingsSnapshot = {
  currencySymbol: "$",
  retentionMonths: 3,
  dailyReminderEnabled: true,
  dailyReminderTime: "20:00",
  appLockEnabled: false,
  pdfReportLastExportAt: null,
  driveBackupEnabled: false,
  driveBackupFrequencyDays: 15,
  driveBackupLastRunAt: null,
  driveConnectedEmail: null,
};

const defaultStorage: StorageSnapshot = {
  categoriesCount: 0,
  transactionsCount: 0,
  settingsCount: 0,
  estimatedBytes: 0,
};

export function useSettingsScreen() {
  const [settings, setSettings] = useState<SettingsSnapshot>(defaultSettings);
  const [storage, setStorage] = useState<StorageSnapshot>(defaultStorage);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [appLockSupported, setAppLockSupported] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const [nextSettings, nextStorage, appLockAvailability] = await Promise.all([
        getSettingsSnapshot(),
        getStorageSnapshotAsync(),
        getAppLockAvailabilityAsync(),
      ]);
      setSettings(nextSettings);
      setStorage(nextStorage);
      setAppLockSupported(appLockAvailability.available);
      setErrorMessage(null);
    } catch (error) {
      console.log("Settings load error:", error);
      setErrorMessage("Unable to read app settings from local storage.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSettings();
    }, [loadSettings]),
  );

  async function patchSettings(partial: Partial<SettingsSnapshot>) {
    const nextSettings = { ...settings, ...partial };
    setSettings(nextSettings);
    try {
      await saveSettingsSnapshotAsync(nextSettings);
      await syncDailyReminderNotificationAsync();
      await loadSettings();
    } catch (error) {
      console.log("Settings save error:", error);
      Alert.alert("Save failed", "Your change could not be saved locally.");
    }
  }

  async function handleAppLockToggle(value: boolean) {
    if (value && !appLockSupported) {
      Alert.alert(
        "Authentication unavailable",
        "Set up a device PIN, pattern, passcode, or biometrics first, then try again.",
      );
      return;
    }

    await patchSettings({ appLockEnabled: value });
  }

  function handleTimeChange(event: DateTimePickerEvent, nextDate?: Date) {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (event.type === "dismissed" || !nextDate) {
      return;
    }

    const value = formatReminderTime(nextDate);
    void patchSettings({ dailyReminderTime: value });
  }

  function confirmClearAllData() {
    Alert.alert("Clear all data?", "This deletes all local categories, transactions, and settings.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Continue",
        style: "destructive",
        onPress: () => {
          Alert.alert("Are you sure?", "This cannot be undone.", [
            { text: "Keep Data", style: "cancel" },
            {
              text: "Delete Everything",
              style: "destructive",
              onPress: async () => {
                try {
                  await clearAllDataAsync();
                  await syncDailyReminderNotificationAsync();
                  await loadSettings();
                } catch (error) {
                  console.log("Clear data error:", error);
                  Alert.alert("Delete failed", "Local data could not be cleared.");
                }
              },
            },
          ]);
        },
      },
    ]);
  }

  async function handleBackupExport() {
    try {
      await exportBackupJsonAsync();
    } catch (error) {
      console.log("Backup export error:", error);
      Alert.alert("Backup failed", "The JSON backup could not be created.");
    }
  }

  async function handleBackupImport() {
    try {
      setIsImporting(true);
      const didImport = await importBackupJsonAsync();
      if (didImport) {
        await syncDailyReminderNotificationAsync();
        await loadSettings();
      }
    } catch (error) {
      console.log("Backup import error:", error);
      Alert.alert("Restore failed", "The selected backup file could not be restored.");
    } finally {
      setIsImporting(false);
    }
  }

  async function handlePdfExport() {
    try {
      await exportPdfReportAsync();
      await patchSettings({ pdfReportLastExportAt: Date.now() });
    } catch (error) {
      console.log("PDF export error:", error);
      Alert.alert("PDF export failed", "SpendWise could not generate the PDF report.");
    }
  }

  async function handleDriveConnect() {
    Alert.alert(
      "Google Drive setup required",
      "Drive backup needs Google OAuth client configuration and a development build or release build. The current codebase can now represent this flow, but final connection details must be supplied from Google Cloud Console.",
    );
  }

  const reminderDate = useMemo(
    () => parseReminderTime(settings.dailyReminderTime),
    [settings.dailyReminderTime],
  );

  const retentionSummary =
    settings.retentionMonths > 0
      ? `Auto-delete after ${settings.retentionMonths} month${
          settings.retentionMonths === 1 ? "" : "s"
        }`
      : "Auto-delete disabled";

  const appLockStatusLabel = appLockSupported
    ? settings.appLockEnabled
      ? "Enabled"
      : "Off"
    : "Unavailable";

  const reminderStatusLabel = settings.dailyReminderEnabled
    ? settings.dailyReminderTime
    : "Off";

  const driveBackupStatusLabel = settings.driveConnectedEmail
    ? settings.driveBackupEnabled
      ? "Connected"
      : "Connected, off"
    : "Setup required";

  const pdfLastExportLabel = settings.pdfReportLastExportAt
    ? formatShortDateTime(settings.pdfReportLastExportAt)
    : "Never";

  const driveLastBackupLabel = settings.driveBackupLastRunAt
    ? formatShortDateTime(settings.driveBackupLastRunAt)
    : "Never";

  return {
    appLockSupported,
    appLockStatusLabel,
    driveBackupStatusLabel,
    driveLastBackupLabel,
    errorMessage,
    isImporting,
    pdfLastExportLabel,
    reminderDate,
    reminderStatusLabel,
    retentionSummary,
    settings,
    showTimePicker,
    storage,
    confirmClearAllData,
    handleAppLockToggle,
    handleBackupExport,
    handleBackupImport,
    handleDriveConnect,
    handlePdfExport,
    handleTimeChange,
    patchSettings,
    setShowTimePicker,
  };
}
