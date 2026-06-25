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

import {
  ExpenseCategories,
  ReminderFrequencies,
  SpendWiseColors,
  Weekdays,
} from "@/constants/spendwise";
import {
  deleteReminder,
  getAllReminders,
  getSettings,
  insertReminder,
  updateReminder,
  updateReminderNotificationId,
} from "@/database/expenseDatabase";
import {
  AppSettings,
  Reminder,
  ReminderDraft,
  ReminderFrequency,
} from "@/database/expenseDatabase.types";
import {
  cancelReminderNotification,
  scheduleReminderNotification,
} from "@/services/notifications";
import {
  formatCurrencyWithCode,
  formatTime,
  normalizeCategory,
  normalizeText,
} from "@/utils/formatters";

const initialDraft: ReminderDraft = {
  title: "",
  category: "",
  note: "",
  amount_hint: null,
  frequency: "daily",
  hour: 20,
  minute: 0,
  day_of_week: 2,
  day_of_month: 1,
  enabled: 1,
};

export default function RemindersScreen() {
  const [draft, setDraft] = useState<ReminderDraft>(initialDraft);
  const [amountHint, setAmountHint] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    currency: "BDT",
    notifications_enabled: 1,
    monthly_budget_start_day: 1,
  });

  const loadReminders = useCallback(async () => {
    try {
      const [nextReminders, nextSettings] = await Promise.all([
        getAllReminders(),
        getSettings(),
      ]);
      setReminders(nextReminders);
      setSettings(nextSettings);
    } catch (error) {
      console.log("Load reminders error:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [loadReminders]),
  );

  function resetForm() {
    setDraft(initialDraft);
    setAmountHint("");
    setEditingId(null);
  }

  function applyReminder(reminder: Reminder) {
    setEditingId(reminder.id);
    setDraft({
      title: reminder.title,
      category: reminder.category ?? "",
      note: reminder.note ?? "",
      amount_hint: reminder.amount_hint,
      frequency: reminder.frequency,
      hour: reminder.hour,
      minute: reminder.minute,
      day_of_week: reminder.day_of_week,
      day_of_month: reminder.day_of_month,
      enabled: reminder.enabled,
    });
    setAmountHint(reminder.amount_hint ? String(reminder.amount_hint) : "");
  }

  async function syncNotification(
    existing: Reminder | null,
    reminderId: number,
    nextDraft: ReminderDraft,
  ) {
    if (existing?.notification_id) {
      await cancelReminderNotification(existing.notification_id);
    }

    const settings = await getSettings();

    if (nextDraft.enabled !== 1 || settings.notifications_enabled !== 1) {
      await updateReminderNotificationId(reminderId, null);
      return;
    }

    const notificationId = await scheduleReminderNotification(nextDraft);
    await updateReminderNotificationId(reminderId, notificationId);

    return Boolean(notificationId);
  }

  async function handleSaveReminder() {
    const normalizedTitle = normalizeText(draft.title);
    const normalizedCategory = normalizeCategory(draft.category);
    const nextAmount = amountHint ? Number(amountHint) : null;

    if (!normalizedTitle) {
      Alert.alert("Missing title", "Give this reminder a short title.");
      return;
    }

    if (amountHint && (nextAmount === null || Number.isNaN(nextAmount) || nextAmount <= 0)) {
      Alert.alert("Invalid amount", "Amount hint must be a positive number.");
      return;
    }

    const nextDraft: ReminderDraft = {
      ...draft,
      title: normalizedTitle,
      category: normalizedCategory,
      amount_hint: nextAmount,
    };

    try {
      if (editingId !== null) {
        const existing = reminders.find((item) => item.id === editingId) ?? null;
        await updateReminder(editingId, nextDraft);
        const didSchedule = await syncNotification(existing, editingId, nextDraft);
        if (!didSchedule && nextDraft.enabled === 1 && settings.notifications_enabled === 1) {
          Alert.alert(
            "Reminder saved without scheduling",
            "Android notification permission is missing or scheduling failed. Enable permission and save again.",
          );
        }
      } else {
        const reminderId = await insertReminder(nextDraft);
        const didSchedule = await syncNotification(null, reminderId, nextDraft);
        if (!didSchedule && nextDraft.enabled === 1 && settings.notifications_enabled === 1) {
          Alert.alert(
            "Reminder saved without scheduling",
            "Android notification permission is missing or scheduling failed. Enable permission and save again.",
          );
        }
      }

      resetForm();
      await loadReminders();
    } catch (error) {
      console.log("Save reminder error:", error);
      Alert.alert("Error", "Reminder could not be saved.");
    }
  }

  async function handleToggleReminder(reminder: Reminder) {
    const nextDraft: ReminderDraft = {
      title: reminder.title,
      category: reminder.category ?? "",
      note: reminder.note ?? "",
      amount_hint: reminder.amount_hint,
      frequency: reminder.frequency,
      hour: reminder.hour,
      minute: reminder.minute,
      day_of_week: reminder.day_of_week,
      day_of_month: reminder.day_of_month,
      enabled: reminder.enabled === 1 ? 0 : 1,
    };

    await updateReminder(reminder.id, nextDraft);
    await syncNotification(reminder, reminder.id, nextDraft);
    await loadReminders();
  }

  function confirmDelete(reminder: Reminder) {
    Alert.alert("Delete reminder?", reminder.title, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await cancelReminderNotification(reminder.notification_id);
          await deleteReminder(reminder.id);
          if (editingId === reminder.id) {
            resetForm();
          }
          await loadReminders();
        },
      },
    ]);
  }

  function setFrequency(frequency: ReminderFrequency) {
    setDraft((current) => ({ ...current, frequency }));
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.formCard}>
        <Text style={styles.title}>Recurring Reminders</Text>
        <Text style={styles.subtitle}>
          Schedule Android reminders for rent, utilities, subscriptions, or any planned spending.
        </Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={draft.title}
          onChangeText={(title) => setDraft((current) => ({ ...current, title }))}
          placeholder="Example: Rent payment"
        />

        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          value={draft.category}
          onChangeText={(category) => setDraft((current) => ({ ...current, category }))}
          placeholder="Optional category"
        />

        <View style={styles.chipsRow}>
          {ExpenseCategories.map((item) => (
            <Pressable key={item} style={styles.chip} onPress={() => setDraft((current) => ({ ...current, category: item }))}>
              <Text style={styles.chipText}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Amount hint</Text>
        <TextInput
          style={styles.input}
          value={amountHint}
          onChangeText={setAmountHint}
          placeholder="Optional expected amount"
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Note</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          value={draft.note}
          onChangeText={(note) => setDraft((current) => ({ ...current, note }))}
          placeholder="Optional details for the reminder"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Frequency</Text>
        <View style={styles.chipsRow}>
          {ReminderFrequencies.map((item) => {
            const active = draft.frequency === item.key;
            return (
              <Pressable
                key={item.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFrequency(item.key)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.inlineRow}>
          <View style={styles.inlineField}>
            <Text style={styles.label}>Hour</Text>
            <TextInput
              style={styles.input}
              value={String(draft.hour)}
              onChangeText={(value) =>
                setDraft((current) => ({ ...current, hour: Math.min(Math.max(Number(value) || 0, 0), 23) }))
              }
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.inlineField}>
            <Text style={styles.label}>Minute</Text>
            <TextInput
              style={styles.input}
              value={String(draft.minute)}
              onChangeText={(value) =>
                setDraft((current) => ({ ...current, minute: Math.min(Math.max(Number(value) || 0, 0), 59) }))
              }
              keyboardType="number-pad"
            />
          </View>
        </View>

        {draft.frequency === "weekly" ? (
          <>
            <Text style={styles.label}>Day of week</Text>
            <View style={styles.chipsRow}>
              {Weekdays.map((item) => {
                const active = draft.day_of_week === item.value;
                return (
                  <Pressable
                    key={item.value}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setDraft((current) => ({ ...current, day_of_week: item.value }))}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {draft.frequency === "monthly" ? (
          <>
            <Text style={styles.label}>Day of month</Text>
            <TextInput
              style={styles.input}
              value={String(draft.day_of_month ?? 1)}
              onChangeText={(value) =>
                setDraft((current) => ({
                  ...current,
                  day_of_month: Math.min(Math.max(Number(value) || 1, 1), 28),
                }))
              }
              keyboardType="number-pad"
            />
          </>
        ) : null}

        <Pressable
          style={[styles.toggleCard, draft.enabled === 1 && styles.toggleCardActive]}
          onPress={() =>
            setDraft((current) => ({ ...current, enabled: current.enabled === 1 ? 0 : 1 }))
          }
        >
          <Text style={styles.toggleTitle}>Notifications enabled</Text>
          <Text style={styles.toggleText}>
            {draft.enabled === 1 ? "This reminder will schedule a local Android notification." : "This reminder stays saved but does not notify."}
          </Text>
        </Pressable>

        <Pressable style={styles.primaryButton} onPress={handleSaveReminder}>
          <Text style={styles.primaryButtonText}>
            {editingId !== null ? "Update Reminder" : "Save Reminder"}
          </Text>
        </Pressable>

        {editingId !== null ? (
          <Pressable style={styles.secondaryButton} onPress={resetForm}>
            <Text style={styles.secondaryButtonText}>Cancel Edit</Text>
          </Pressable>
        ) : null}
      </View>

      {reminders.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No reminders yet</Text>
          <Text style={styles.emptyText}>
            Create reminders for recurring expenses so the app helps you stay consistent.
          </Text>
        </View>
      ) : (
        reminders.map((reminder) => (
          <View key={reminder.id} style={styles.reminderCard}>
            <Text style={styles.reminderTitle}>{reminder.title}</Text>
            <Text style={styles.reminderMeta}>
            {reminder.frequency} at {formatTime(reminder.hour, reminder.minute)}
          </Text>
          {reminder.amount_hint ? (
              <Text style={styles.reminderMeta}>
                Hint: {formatCurrencyWithCode(reminder.amount_hint, settings.currency)}
              </Text>
          ) : null}
            <Text style={styles.reminderMeta}>
              {settings.notifications_enabled !== 1
                ? "Paused by app notification settings"
                : reminder.enabled === 1 && reminder.notification_id
                  ? "Scheduled"
                  : reminder.enabled === 1
                    ? "Needs notification permission"
                    : "Saved without notification"}
            </Text>
            {reminder.note ? <Text style={styles.reminderNote}>{reminder.note}</Text> : null}
            <View style={styles.actionRow}>
              <Pressable style={styles.editButton} onPress={() => applyReminder(reminder)}>
                <Text style={styles.editButtonText}>Edit</Text>
              </Pressable>
              <Pressable
                style={styles.editButton}
                onPress={() => handleToggleReminder(reminder)}
              >
                <Text style={styles.editButtonText}>
                  {reminder.enabled === 1 ? "Disable" : "Enable"}
                </Text>
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={() => confirmDelete(reminder)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SpendWiseColors.background },
  content: { padding: 20, paddingBottom: 32, gap: 16 },
  formCard: {
    backgroundColor: SpendWiseColors.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
  },
  title: { fontSize: 28, fontWeight: "700", color: SpendWiseColors.text },
  subtitle: { fontSize: 14, lineHeight: 21, color: SpendWiseColors.textMuted, marginTop: 8 },
  label: { fontSize: 15, fontWeight: "700", color: SpendWiseColors.text, marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
  },
  noteInput: { minHeight: 84 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  chip: {
    backgroundColor: SpendWiseColors.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chipActive: { backgroundColor: SpendWiseColors.primary },
  chipText: { color: SpendWiseColors.primary, fontWeight: "600" },
  chipTextActive: { color: "#FFFFFF" },
  inlineRow: { flexDirection: "row", gap: 12 },
  inlineField: { flex: 1 },
  toggleCard: {
    marginTop: 16,
    backgroundColor: SpendWiseColors.surfaceMuted,
    borderRadius: 18,
    padding: 16,
  },
  toggleCardActive: { backgroundColor: SpendWiseColors.warningSoft },
  toggleTitle: { fontSize: 15, fontWeight: "700", color: SpendWiseColors.text, marginBottom: 4 },
  toggleText: { fontSize: 13, color: SpendWiseColors.textMuted, lineHeight: 19 },
  primaryButton: {
    backgroundColor: SpendWiseColors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 18,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  secondaryButton: {
    backgroundColor: SpendWiseColors.surfaceMuted,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
  },
  secondaryButtonText: { color: SpendWiseColors.text, fontWeight: "700" },
  emptyCard: {
    backgroundColor: SpendWiseColors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: SpendWiseColors.text, marginBottom: 6 },
  emptyText: { fontSize: 14, color: SpendWiseColors.textMuted, lineHeight: 21 },
  reminderCard: {
    backgroundColor: SpendWiseColors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
    gap: 6,
  },
  reminderTitle: { fontSize: 17, fontWeight: "700", color: SpendWiseColors.text },
  reminderMeta: { fontSize: 14, color: SpendWiseColors.textMuted },
  reminderNote: { fontSize: 14, color: SpendWiseColors.text },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  editButton: {
    flex: 1,
    backgroundColor: SpendWiseColors.surfaceMuted,
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  editButtonText: { color: SpendWiseColors.text, fontWeight: "700" },
  deleteButton: {
    flex: 1,
    backgroundColor: SpendWiseColors.dangerSoft,
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  deleteButtonText: { color: SpendWiseColors.danger, fontWeight: "700" },
});
