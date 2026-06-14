export function parseExpenseDate(value: string) {
  return new Date(value.replace(" ", "T"));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(amount: number) {
  return new Intl.NumberFormat("en-BD", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parseExpenseDate(value));
}

export function formatRelativeWindow(total: number, count: number) {
  if (count === 0) {
    return "No spending recorded yet";
  }

  return `${formatCurrency(total)} across ${count} transaction${count === 1 ? "" : "s"}`;
}

export function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function formatTime(hour: number, minute: number) {
  return new Intl.DateTimeFormat("en-BD", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2024, 0, 1, hour, minute));
}

export function formatPercentage(value: number) {
  return `${Math.round(value * 100)}%`;
}
