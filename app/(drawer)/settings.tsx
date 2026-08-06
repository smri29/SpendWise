import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { ScreenFrame } from "@/components/ui/ScreenFrame";
import { SegmentControl } from "@/components/ui/SegmentControl";
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
import { formatBytes, formatReminderTime, parseReminderTime } from "@/utils/format";
import { syncDailyReminderNotificationAsync } from "@/services/reminders";
import { SpendWiseTheme } from "@/theme/spendwise";

const currencyOptions: { label: string; value: SettingsSnapshot["currencySymbol"] }[] = [
  { label: "$", value: "$" },
  { label: "€", value: "€" },
  { label: "£", value: "£" },
  { label: "৳", value: "৳" },
  { label: "₹", value: "₹" },
  { label: "¥", value: "¥" },
];

const retentionOptions: { label: string; value: SettingsSnapshot["retentionMonths"] }[] = [
  { label: "1 Month", value: 1 },
  { label: "3 Months", value: 3 },
  { label: "6 Months", value: 6 },
  { label: "Never", value: 0 },
];

const defaultSettings: SettingsSnapshot = {
  currencySymbol: "$",
  retentionMonths: 3,
  dailyReminderEnabled: true,
  dailyReminderTime: "20:00",
};

const defaultStorage: StorageSnapshot = {
  categoriesCount: 0,
  transactionsCount: 0,
  settingsCount: 0,
  estimatedBytes: 0,
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState<SettingsSnapshot>(defaultSettings);
  const [storage, setStorage] = useState<StorageSnapshot>(defaultStorage);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const [nextSettings, nextStorage] = await Promise.all([
        getSettingsSnapshot(),
        getStorageSnapshotAsync(),
      ]);
      setSettings(nextSettings);
      setStorage(nextStorage);
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

  const reminderDate = parseReminderTime(settings.dailyReminderTime);

  return (
    <ScreenFrame contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Settings</Text>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>General Preferences</Text>
        <Text style={styles.rowLabel}>Currency Symbol</Text>
        <SegmentControl options={currencyOptions} value={settings.currencySymbol} onChange={(value) => void patchSettings({ currencySymbol: value })} />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Data Retention & Storage</Text>
        <Text style={styles.rowLabel}>Auto-Delete History</Text>
        <SegmentControl options={retentionOptions} value={settings.retentionMonths} onChange={(value) => void patchSettings({ retentionMonths: value })} />
        <Text style={styles.storageText}>
          Local storage used: {storage.transactionsCount} transactions • {storage.categoriesCount} categories •
          {` ${formatBytes(storage.estimatedBytes)} estimated`}
        </Text>
        <Pressable style={styles.secondaryButton} onPress={handleBackupExport}>
          <Text style={styles.secondaryButtonText}>Backup Data (.json)</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => void handleBackupImport()} disabled={isImporting}>
          <Text style={styles.secondaryButtonText}>
            {isImporting ? "Restoring..." : "Restore Data (.json)"}
          </Text>
        </Pressable>
        <Pressable style={styles.dangerButton} onPress={confirmClearAllData}>
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </Pressable>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Daily Reminder</Text>
        <View style={styles.toggleRow}>
          <View style={styles.toggleCopy}>
            <Text style={styles.rowLabel}>Daily log reminder</Text>
            <Text style={styles.helperText}>
              One local notification reminds you to log spending at your chosen time.
            </Text>
          </View>
          <Switch
            value={settings.dailyReminderEnabled}
            onValueChange={(value) => void patchSettings({ dailyReminderEnabled: value })}
            trackColor={{ false: "#D4D4D8", true: "#D7E454" }}
            thumbColor="#FFFFFF"
          />
        </View>
        <Pressable style={styles.reminderTimeCard} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.rowLabel}>Reminder Time</Text>
          <Text style={styles.timeValue}>{settings.dailyReminderTime}</Text>
        </Pressable>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Privacy & About</Text>
        <Text style={styles.helperText}>
          SpendWise stores everything locally on this device. There are no accounts, remote APIs, or external analytics.
        </Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>

      {errorMessage ? <Text style={styles.inlineError}>{errorMessage}</Text> : null}

      {showTimePicker ? (
        <DateTimePicker
          value={reminderDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      ) : null}
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 116,
    paddingBottom: 36,
    gap: 18,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: SpendWiseTheme.colors.text,
  },
  sectionCard: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.56)",
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: 0.3,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: SpendWiseTheme.colors.text,
  },
  helperText: {
    color: SpendWiseTheme.colors.textMuted,
    lineHeight: 20,
    fontSize: 14,
  },
  storageText: {
    color: SpendWiseTheme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  secondaryButton: {
    borderRadius: 18,
    backgroundColor: "#FFFBE0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: SpendWiseTheme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  dangerButton: {
    borderRadius: 18,
    backgroundColor: "#F9D9D9",
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  dangerButtonText: {
    color: SpendWiseTheme.colors.expense,
    fontSize: 16,
    fontWeight: "800",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  toggleCopy: {
    flex: 1,
    gap: 4,
  },
  reminderTimeCard: {
    borderRadius: 18,
    backgroundColor: "rgba(255,253,231,0.78)",
    padding: 16,
  },
  timeValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "800",
    color: SpendWiseTheme.colors.text,
  },
  versionText: {
    marginTop: 8,
    fontSize: 15,
    color: SpendWiseTheme.colors.text,
    fontWeight: "700",
  },
  inlineError: {
    color: SpendWiseTheme.colors.expense,
    fontSize: 13,
    fontWeight: "700",
  },
});
