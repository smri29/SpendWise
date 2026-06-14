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

  const currentReminders = await getAllReminders();
  for (const reminder of currentReminders) {
    await cancelReminderNotification(reminder.notification_id);
  }

  const result = await File.pickFileAsync({
    mimeTypes: ["application/json"],
  });

  if (result.canceled) {
    return false;
  }

  const text = await result.result.text();
  const parsed = JSON.parse(text) as SpendWiseBackup;
  if (parsed.schemaVersion !== 1 || !Array.isArray(parsed.expenses)) {
    throw new Error("Invalid SpendWise backup file.");
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
