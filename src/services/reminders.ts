import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import { getSettingsSnapshot } from "@/db";
import { parseReminderTime } from "@/utils/format";

const CHANNEL_ID = "spendwise-daily-log";
const DAILY_REMINDER_IDENTIFIER = "spendwise-daily-reminder";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function prepareDailyReminderNotificationsAsync() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "SpendWise daily reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

async function requestPermissionIfNeeded() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }

  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function syncDailyReminderNotificationAsync() {
  if (Platform.OS !== "android") {
    return;
  }

  const settings = await getSettingsSnapshot();
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_IDENTIFIER).catch(() => {
    return;
  });

  if (!settings.dailyReminderEnabled) {
    return;
  }

  const granted = await requestPermissionIfNeeded();
  if (!granted) {
    return;
  }

  const time = parseReminderTime(settings.dailyReminderTime);
  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_IDENTIFIER,
    content: {
      title: "SpendWise reminder",
      body: "Log today's spending while it is still fresh.",
      sound: false,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: time.getHours(),
      minute: time.getMinutes(),
      channelId: CHANNEL_ID,
    },
  });
}
