import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import {
  getAllReminders,
  getSettings,
  updateReminderNotificationId,
} from "@/database/expenseDatabase";
import {
  Reminder,
  ReminderDraft,
} from "@/database/expenseDatabase.types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const REMINDER_CHANNEL_ID = "spendwise-reminders";

export async function prepareNotificationsAsync() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: "SpendWise reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 150, 100, 150],
  });
}

export async function requestNotificationPermissionIfNeeded() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

function buildTrigger(reminder: Pick<ReminderDraft, "frequency" | "hour" | "minute" | "day_of_week" | "day_of_month">) {
  if (reminder.frequency === "daily") {
    return {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: reminder.hour,
      minute: reminder.minute,
      channelId: REMINDER_CHANNEL_ID,
    } as const;
  }

  if (reminder.frequency === "weekly") {
    return {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: reminder.day_of_week ?? 1,
      hour: reminder.hour,
      minute: reminder.minute,
      channelId: REMINDER_CHANNEL_ID,
    } as const;
  }

  return {
    type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
    day: reminder.day_of_month ?? 1,
    hour: reminder.hour,
    minute: reminder.minute,
    channelId: REMINDER_CHANNEL_ID,
  } as const;
}

export async function scheduleReminderNotification(reminder: Reminder | ReminderDraft) {
  const granted = await requestNotificationPermissionIfNeeded();
  if (!granted) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: reminder.title,
      body:
        reminder.note?.trim() ||
        "Time to log your planned expense in SpendWise.",
      sound: false,
    },
    trigger: buildTrigger(reminder),
  });
}

export async function cancelReminderNotification(notificationId: string | null | undefined) {
  if (!notificationId) {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.log("Cancel notification error:", error);
  }
}

export async function resyncAllReminderNotifications() {
  const settings = await getSettings();
  const reminders = await getAllReminders();

  for (const reminder of reminders) {
    await cancelReminderNotification(reminder.notification_id);

    if (settings.notifications_enabled !== 1 || reminder.enabled !== 1) {
      await updateReminderNotificationId(reminder.id, null);
      continue;
    }

    const notificationId = await scheduleReminderNotification(reminder);
    await updateReminderNotificationId(reminder.id, notificationId);
  }
}
