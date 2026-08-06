import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

import {
  deleteTransactionByIdAsync,
  exportTransactionsCsvAsync,
  getSettingsSnapshot,
  listTransactionsAsync,
  type SettingsSnapshot,
  type TransactionListItem,
  type TransactionPeriodFilter,
  type TransactionTypeFilter,
} from "@/db";

const defaultSettings: SettingsSnapshot = {
  currencySymbol: "$",
  retentionMonths: 3,
  dailyReminderEnabled: true,
  dailyReminderTime: "20:00",
};

export function useViewLogs() {
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>("ALL");
  const [periodFilter, setPeriodFilter] = useState<TransactionPeriodFilter>("ALL_TIME");
  const [rows, setRows] = useState<TransactionListItem[]>([]);
  const [settings, setSettings] = useState<SettingsSnapshot>(defaultSettings);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const loadRows = useCallback(async () => {
    try {
      const [nextRows, nextSettings] = await Promise.all([
        listTransactionsAsync({ typeFilter, periodFilter }),
        getSettingsSnapshot(),
      ]);
      setRows(nextRows);
      setSettings(nextSettings);
      setErrorMessage(null);
    } catch (error) {
      console.log("View logs load error:", error);
      setErrorMessage("Unable to read local transactions.");
    }
  }, [periodFilter, typeFilter]);

  useFocusEffect(
    useCallback(() => {
      void loadRows();
    }, [loadRows]),
  );

  const totals = useMemo(() => {
    return rows.reduce(
      (summary, row) => {
        if (row.type === "EXPENSE") {
          summary.expense += row.amount;
        } else {
          summary.income += row.amount;
        }
        return summary;
      },
      { expense: 0, income: 0 },
    );
  }, [rows]);

  async function handleDelete(item: TransactionListItem) {
    Alert.alert("Delete entry?", "This entry will be removed from local storage.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTransactionByIdAsync(item.id);
            await loadRows();
          } catch (error) {
            console.log("Delete entry error:", error);
            Alert.alert("Delete failed", "The row could not be deleted.");
          }
        },
      },
    ]);
  }

  async function handleExport() {
    try {
      setIsExporting(true);
      await exportTransactionsCsvAsync();
    } catch (error) {
      console.log("CSV export error:", error);
      Alert.alert("Export failed", "CSV export could not be completed.");
    } finally {
      setIsExporting(false);
    }
  }

  return {
    errorMessage,
    isExporting,
    periodFilter,
    rows,
    settings,
    totals,
    typeFilter,
    handleDelete,
    handleExport,
    setPeriodFilter,
    setTypeFilter,
  };
}
