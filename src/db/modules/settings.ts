import type { SettingsSnapshot } from "@/db/types";
import { getDatabaseAsync } from "@/db/core/database";
import { executeRollingPurge } from "@/db/schema";
import { parseBooleanSetting } from "@/utils/format";

export const settingsDefaults: SettingsSnapshot = {
  currencySymbol: "$",
  retentionMonths: 3,
  dailyReminderEnabled: true,
  dailyReminderTime: "20:00",
  appLockEnabled: false,
  pdfReportLastExportAt: null,
};

export async function getSettingsSnapshot(): Promise<SettingsSnapshot> {
  try {
    const db = await getDatabaseAsync();
    const rows = await db.getAllAsync<{ key: string; value: string }>("SELECT key, value FROM settings;");
    const map = new Map(rows.map((row) => [row.key, row.value]));

    return {
      currencySymbol: map.get("currency_symbol") ?? settingsDefaults.currencySymbol,
      retentionMonths: Number.parseInt(
        map.get("retention_months") ?? String(settingsDefaults.retentionMonths),
        10,
      ),
      dailyReminderEnabled: parseBooleanSetting(
        map.get("daily_reminder_enabled"),
        settingsDefaults.dailyReminderEnabled,
      ),
      dailyReminderTime: map.get("daily_reminder_time") ?? settingsDefaults.dailyReminderTime,
      appLockEnabled: parseBooleanSetting(
        map.get("app_lock_enabled"),
        settingsDefaults.appLockEnabled,
      ),
      pdfReportLastExportAt: parseNullableNumber(
        map.get("pdf_report_last_export_at"),
        settingsDefaults.pdfReportLastExportAt,
      ),
    };
  } catch (error) {
    console.log("getSettingsSnapshot error:", error);
    throw error;
  }
}

export async function saveSettingsSnapshotAsync(settings: SettingsSnapshot) {
  try {
    const db = await getDatabaseAsync();
    const entries: [string, string][] = [
      ["currency_symbol", settings.currencySymbol],
      ["retention_months", String(settings.retentionMonths)],
      ["daily_reminder_enabled", String(settings.dailyReminderEnabled)],
      ["daily_reminder_time", settings.dailyReminderTime],
      ["app_lock_enabled", String(settings.appLockEnabled)],
      ["pdf_report_last_export_at", settings.pdfReportLastExportAt ? String(settings.pdfReportLastExportAt) : ""],
    ];

    for (const [key, value] of entries) {
      await db.runAsync(
        `
          INSERT INTO settings (key, value)
          VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value;
        `,
        [key, value],
      );
    }

    await executeRollingPurge(db);
  } catch (error) {
    console.log("saveSettingsSnapshotAsync error:", error);
    throw error;
  }
}

function parseNullableNumber(value: string | undefined, fallback: number | null) {
  if (!value || !value.trim()) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}
