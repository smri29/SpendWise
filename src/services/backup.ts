import { Alert, Platform } from "react-native";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import {
  clearAllData,
  exportSpendWiseBackup,
  getAllReminders,
  importSpendWiseBackup,
} from "@/database/expenseDatabase";
import { SpendWiseBackup } from "@/database/expenseDatabase.types";
import { cancelReminderNotification } from "@/services/notifications";

const BACKUP_FILE_NAME = "spendwise-backup.json";

function createBackupFile() {
  return new File(Paths.document, BACKUP_FILE_NAME);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidExpense(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.amount === "number" &&
    typeof value.category === "string" &&
    (typeof value.note === "string" || value.note === null) &&
    typeof value.created_at === "string"
  );
}

function isValidBudget(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.category === "string" &&
    typeof value.monthly_limit === "number" &&
    typeof value.created_at === "string"
  );
}

function isValidReminder(value: unknown) {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.title === "string" &&
    (typeof value.category === "string" || value.category === null) &&
    (typeof value.note === "string" || value.note === null) &&
    (typeof value.amount_hint === "number" || value.amount_hint === null) &&
    typeof value.frequency === "string" &&
    typeof value.hour === "number" &&
    typeof value.minute === "number" &&
    (typeof value.day_of_week === "number" || value.day_of_week === null) &&
    (typeof value.day_of_month === "number" || value.day_of_month === null) &&
    typeof value.enabled === "number" &&
    (typeof value.notification_id === "string" || value.notification_id === null) &&
    typeof value.created_at === "string"
  );
}

function isValidBackup(value: unknown): value is SpendWiseBackup {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value.schemaVersion === 1 &&
    typeof value.exportedAt === "string" &&
    Array.isArray(value.expenses) &&
    value.expenses.every(isValidExpense) &&
    Array.isArray(value.budgets) &&
    value.budgets.every(isValidBudget) &&
    Array.isArray(value.reminders) &&
    value.reminders.every(isValidReminder) &&
    isRecord(value.settings) &&
    typeof value.settings.currency === "string" &&
    typeof value.settings.notifications_enabled === "number" &&
    typeof value.settings.monthly_budget_start_day === "number"
  );
}

export async function shareBackupFile() {
  const backup = await exportSpendWiseBackup();
  const file = createBackupFile();

  file.create({ overwrite: true, intermediates: true });
  file.write(JSON.stringify(backup, null, 2));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      dialogTitle: "Share SpendWise backup",
      mimeType: "application/json",
    });
    return;
  }

  Alert.alert("Backup saved", `Saved locally at ${file.uri}`);
}

export async function importBackupFromPicker() {
  if (Platform.OS !== "android") {
    throw new Error("Backup import is only enabled for Android in this build.");
  }

  const result = await File.pickFileAsync({
    mimeTypes: ["application/json"],
  });

  if (result.canceled) {
    return false;
  }

  const text = await result.result.text();
  const parsed = JSON.parse(text) as unknown;
  if (!isValidBackup(parsed)) {
    throw new Error("Invalid SpendWise backup file.");
  }

  const currentReminders = await getAllReminders();
  for (const reminder of currentReminders) {
    await cancelReminderNotification(reminder.notification_id);
  }

  await importSpendWiseBackup(parsed);
  return true;
}

export async function resetSpendWiseData() {
  const reminders = await getAllReminders();
  for (const reminder of reminders) {
    await cancelReminderNotification(reminder.notification_id);
  }
  await clearAllData();
}
