import type {
  SettingsSnapshot,
  SpendWiseBackup,
  TransactionListItem,
} from "@/db/types";

function getOrdinalSuffix(day: number) {
  const remainder10 = day % 10;
  const remainder100 = day % 100;

  if (remainder10 === 1 && remainder100 !== 11) {
    return "st";
  }
  if (remainder10 === 2 && remainder100 !== 12) {
    return "nd";
  }
  if (remainder10 === 3 && remainder100 !== 13) {
    return "rd";
  }
  return "th";
}

export function formatLongDate(date: Date) {
  const day = date.getDate();
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(date);
  return `${day}${getOrdinalSuffix(day)} ${month}, ${date.getFullYear()}`;
}

export function formatClockTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatShortDateTime(timestamp: number) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export function formatCurrency(amount: number, currencySymbol: string) {
  const absolute = Math.abs(amount);
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absolute);
  return `${currencySymbol}${formatted}`;
}

export function formatNumericInputForAmount(value: string) {
  const normalized = value.replace(/[^0-9.]/g, "");
  const [whole = "", ...rest] = normalized.split(".");
  const decimals = rest.join("").slice(0, 2);
  const limitedWhole = whole.slice(0, 9);
  return decimals ? `${limitedWhole}.${decimals}` : limitedWhole;
}

export function parseAmountInput(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function clampNoteLength(value: string, maxLength = 100) {
  return value.slice(0, maxLength);
}

export function normalizeEmailInput(value: string) {
  return value.trim().toLowerCase();
}

export function getLocalDayRange(date: Date) {
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  const endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
  return {
    start: startDate.getTime(),
    end: endDate.getTime(),
  };
}

export function getMonthRange(date: Date) {
  const startDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);
  return {
    start: startDate.getTime(),
    end: endDate.getTime(),
  };
}

export function getRetentionNotice(months: number) {
  if (months <= 0) {
    return "Notice: Auto-purge is disabled. Backups remain available in Settings for manual export and restore.";
  }

  const days = months * 30;
  return `Notice: Data older than ${days} days is automatically purged. Export backups in Settings.`;
}

export function parseBooleanSetting(value: string | undefined, fallback: boolean) {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function buildStorageEstimateBytes(payload: SpendWiseBackup) {
  return new TextEncoder().encode(JSON.stringify(payload)).length;
}

export function buildCsvFromTransactions(
  items: TransactionListItem[],
  currencySymbol: string,
) {
  const header = "Date,Type,Category,Note,Amount,Currency";
  const rows = items.map((item) => {
    const values = [
      new Date(item.createdAt).toISOString(),
      item.type,
      item.categoryName ?? "Uncategorized",
      item.note.replaceAll('"', '""'),
      item.amount.toFixed(2),
      currencySymbol,
    ];

    return values.map((value) => `"${String(value)}"`).join(",");
  });

  return [header, ...rows].join("\n");
}

export function formatReminderTime(date: Date) {
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

export function parseReminderTime(value: string) {
  const [hourRaw, minuteRaw] = value.split(":");
  const hour = Number.parseInt(hourRaw ?? "20", 10);
  const minute = Number.parseInt(minuteRaw ?? "0", 10);
  return new Date(2026, 7, 6, Number.isFinite(hour) ? hour : 20, Number.isFinite(minute) ? minute : 0);
}

function isTransactionType(value: unknown): value is "EXPENSE" | "INCOME" {
  return value === "EXPENSE" || value === "INCOME";
}

function isSettingsSnapshot(value: unknown): value is SettingsSnapshot {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const settings = value as Record<string, unknown>;
  return (
    typeof settings.currencySymbol === "string" &&
    typeof settings.retentionMonths === "number" &&
    typeof settings.dailyReminderEnabled === "boolean" &&
    typeof settings.dailyReminderTime === "string"
  );
}

export function assertValidBackup(value: unknown): asserts value is SpendWiseBackup {
  if (typeof value !== "object" || value === null) {
    throw new Error("Backup file is not a valid JSON object.");
  }

  const backup = value as Record<string, unknown>;
  if (backup.schemaVersion !== 1 || typeof backup.exportedAt !== "number") {
    throw new Error("Backup file version is not supported.");
  }

  if (!Array.isArray(backup.categories) || !Array.isArray(backup.transactions) || !isSettingsSnapshot(backup.settings)) {
    throw new Error("Backup payload is missing required data.");
  }

  for (const category of backup.categories) {
    if (typeof category !== "object" || category === null) {
      throw new Error("Backup contains an invalid category.");
    }
    const record = category as Record<string, unknown>;
    if (
      typeof record.id !== "number" ||
      typeof record.name !== "string" ||
      !isTransactionType(record.type) ||
      typeof record.iconName !== "string" ||
      typeof record.colorHex !== "string"
    ) {
      throw new Error("Backup contains a malformed category.");
    }
  }

  for (const transaction of backup.transactions) {
    if (typeof transaction !== "object" || transaction === null) {
      throw new Error("Backup contains an invalid transaction.");
    }
    const record = transaction as Record<string, unknown>;
    if (
      typeof record.id !== "number" ||
      typeof record.amount !== "number" ||
      !isTransactionType(record.type) ||
      !(typeof record.categoryId === "number" || record.categoryId === null) ||
      typeof record.note !== "string" ||
      typeof record.createdAt !== "number"
    ) {
      throw new Error("Backup contains a malformed transaction.");
    }
  }
}
