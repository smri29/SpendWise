import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { SpendWiseColors } from "@/constants/spendwise";
import { getSettings, updateSettings } from "@/database/expenseDatabase";
import { AppSettings } from "@/database/expenseDatabase.types";
import {
  importBackupFromPicker,
  resetSpendWiseData,
  shareBackupFile,
} from "@/services/backup";
import {
  requestNotificationPermissionIfNeeded,
  resyncAllReminderNotifications,
} from "@/services/notifications";

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>({
    currency: "BDT",
    notifications_enabled: 1,
    monthly_budget_start_day: 1,
  });
  const [budgetStartDay, setBudgetStartDay] = useState("1");

  const loadSettings = useCallback(async () => {
    const nextSettings = await getSettings();
    setSettings(nextSettings);
    setBudgetStartDay(String(nextSettings.monthly_budget_start_day));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [loadSettings]),
  );

  async function toggleNotifications() {
    const nextValue = settings.notifications_enabled === 1 ? 0 : 1;
    if (nextValue === 1) {
      const granted = await requestNotificationPermissionIfNeeded();
      if (!granted) {
        Alert.alert("Permission needed", "Android notification permission was not granted.");
        return;
      }
    }

    await updateSettings({ notifications_enabled: nextValue });
    await resyncAllReminderNotifications();
    await loadSettings();
  }

  async function saveBudgetStartDay() {
    const numeric = Math.min(Math.max(Number(budgetStartDay) || 1, 1), 28);
    await updateSettings({ monthly_budget_start_day: numeric });
    await loadSettings();
    Alert.alert("Saved", "Budget start day updated.");
  }

  function confirmReset() {
    Alert.alert(
      "Reset all SpendWise data?",
      "This deletes expenses, budgets, reminders, and resets settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            await resetSpendWiseData();
            await loadSettings();
            Alert.alert("Reset complete", "SpendWise data has been cleared.");
          },
        },
      ],
    );
  }

  async function handleImport() {
    try {
      const imported = await importBackupFromPicker();
      if (imported) {
        await resyncAllReminderNotifications();
        await loadSettings();
        Alert.alert("Import complete", "Backup restored successfully.");
      }
    } catch (error) {
      console.log("Import backup error:", error);
      Alert.alert("Import failed", "That file could not be imported.");
    }
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Release Settings</Text>
        <Text style={styles.subtitle}>
          SpendWise is configured as a privacy-first Android utility. These settings help prepare the app for a Play Store-ready experience.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Pressable
          style={[styles.toggleCard, settings.notifications_enabled === 1 && styles.toggleCardActive]}
          onPress={toggleNotifications}
        >
          <Text style={styles.toggleTitle}>
            Notifications {settings.notifications_enabled === 1 ? "enabled" : "disabled"}
          </Text>
          <Text style={styles.toggleText}>
            Controls whether SpendWise should actively schedule local Android reminders.
          </Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Budget cycle</Text>
        <Text style={styles.helperText}>
          Choose the day of the month your budgeting cycle should conceptually begin.
        </Text>
        <TextInput
          style={styles.input}
          value={budgetStartDay}
          onChangeText={setBudgetStartDay}
          keyboardType="number-pad"
        />
        <Pressable style={styles.primaryButton} onPress={saveBudgetStartDay}>
          <Text style={styles.primaryButtonText}>Save Budget Start Day</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Backup and restore</Text>
        <Text style={styles.helperText}>
          Export a local JSON backup before changing devices or before your Play release rollout.
        </Text>
        <Pressable style={styles.primaryButton} onPress={shareBackupFile}>
          <Text style={styles.primaryButtonText}>Export Backup</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={handleImport}>
          <Text style={styles.secondaryButtonText}>Import Backup</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <Text style={styles.privacyText}>
          SpendWise stores expenses, budgets, reminders, and settings locally on the device. There is no account system, no cloud sync, and no analytics collection in this version.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About this build</Text>
        <Text style={styles.privacyText}>
          Platform focus: Android only. Currency: {settings.currency}. Ideal release positioning: privacy-first budgeting and reminder-based expense tracking.
        </Text>
      </View>

      <Pressable style={styles.deleteButton} onPress={confirmReset}>
        <Text style={styles.deleteButtonText}>Reset All App Data</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SpendWiseColors.background },
  content: { padding: 20, paddingBottom: 32, gap: 16 },
  card: {
    backgroundColor: SpendWiseColors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
    gap: 10,
  },
  title: { fontSize: 28, fontWeight: "700", color: SpendWiseColors.text },
  subtitle: { fontSize: 14, lineHeight: 21, color: SpendWiseColors.textMuted },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: SpendWiseColors.text },
  helperText: { fontSize: 14, lineHeight: 21, color: SpendWiseColors.textMuted },
  toggleCard: {
    backgroundColor: SpendWiseColors.surfaceMuted,
    borderRadius: 18,
    padding: 16,
  },
  toggleCardActive: { backgroundColor: SpendWiseColors.warningSoft },
  toggleTitle: { fontSize: 15, fontWeight: "700", color: SpendWiseColors.text, marginBottom: 4 },
  toggleText: { fontSize: 13, color: SpendWiseColors.textMuted, lineHeight: 19 },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
  },
  primaryButton: {
    backgroundColor: SpendWiseColors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  secondaryButton: {
    backgroundColor: SpendWiseColors.surfaceMuted,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  secondaryButtonText: { color: SpendWiseColors.text, fontWeight: "700", fontSize: 16 },
  privacyText: { fontSize: 14, color: SpendWiseColors.textMuted, lineHeight: 21 },
  deleteButton: {
    backgroundColor: SpendWiseColors.dangerSoft,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  deleteButtonText: { color: SpendWiseColors.danger, fontWeight: "700", fontSize: 16 },
});
