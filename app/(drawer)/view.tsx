import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenFrame } from "@/components/ui/ScreenFrame";
import { SegmentControl } from "@/components/ui/SegmentControl";
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
import { formatCurrency, formatShortDateTime } from "@/utils/format";
import { SpendWiseTheme } from "@/theme/spendwise";

const typeOptions: { label: string; value: TransactionTypeFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Expenses", value: "EXPENSE" },
  { label: "Income", value: "INCOME" },
];

const periodOptions: { label: string; value: TransactionPeriodFilter }[] = [
  { label: "All Time", value: "ALL_TIME" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Last Month", value: "LAST_MONTH" },
];

const defaultSettings: SettingsSnapshot = {
  currencySymbol: "$",
  retentionMonths: 3,
  dailyReminderEnabled: true,
  dailyReminderTime: "20:00",
};

export default function ViewLogsScreen() {
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

  return (
    <ScreenFrame scrollable={false} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>View Logs</Text>
          <Text style={styles.pageSubtitle}>Chronological local history, newest first.</Text>
        </View>
        <Pressable style={styles.exportButton} onPress={handleExport} disabled={isExporting}>
          <Text style={styles.exportText}>{isExporting ? "Exporting..." : "Export"}</Text>
        </Pressable>
      </View>

      <SegmentControl options={typeOptions} value={typeFilter} onChange={setTypeFilter} />
      <SegmentControl options={periodOptions} value={periodFilter} onChange={setPeriodFilter} />

      {errorMessage ? <Text style={styles.inlineError}>{errorMessage}</Text> : null}

      {rows.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No entries found</Text>
          <Text style={styles.emptyText}>
            Try a different filter or create your first transaction from the Add screen.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tableScrollContent}
        >
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.headerCell, styles.cellDate]}>Date</Text>
              <Text style={[styles.headerCell, styles.cellCategory]}>Category</Text>
              <Text style={[styles.headerCell, styles.cellNote]}>Note</Text>
              <Text style={[styles.headerCell, styles.cellAmount]}>Amount</Text>
            </View>

            {rows.map((item) => (
              <Pressable
                key={item.id}
                onLongPress={() => void handleDelete(item)}
                style={styles.tableRow}
              >
                <Text style={[styles.bodyCell, styles.cellDate]}>
                  {formatShortDateTime(item.createdAt)}
                </Text>
                <View style={[styles.cellCategory, styles.categoryCell]}>
                  <Text style={styles.categoryName}>{item.categoryName ?? "Uncategorized"}</Text>
                  <Text style={styles.typeBadge}>{item.type}</Text>
                </View>
                <Text style={[styles.bodyCell, styles.cellNote]} numberOfLines={2}>
                  {item.note.trim() ? item.note : "No note"}
                </Text>
                <View style={[styles.cellAmount, styles.amountCell]}>
                  <Text
                    style={[
                      styles.amountText,
                      item.type === "EXPENSE" ? styles.amountExpense : styles.amountIncome,
                    ]}
                  >
                    {item.type === "EXPENSE" ? "-" : "+"}
                    {formatCurrency(item.amount, settings.currencySymbol)}
                  </Text>
                  <Pressable style={styles.deleteChip} onPress={() => void handleDelete(item)}>
                    <Text style={styles.deleteChipText}>Delete</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 118,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  pageTitle: {
    fontSize: 34,
    color: SpendWiseTheme.colors.text,
    fontWeight: "800",
  },
  pageSubtitle: {
    marginTop: 4,
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 14,
  },
  exportButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.78)",
  },
  exportText: {
    color: SpendWiseTheme.colors.text,
    fontWeight: "800",
    fontSize: 16,
  },
  inlineError: {
    color: SpendWiseTheme.colors.expense,
    fontWeight: "700",
    fontSize: 13,
  },
  emptyState: {
    marginTop: 18,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.76)",
    padding: 24,
    borderWidth: 1,
    borderColor: "#F0E8A6",
  },
  emptyTitle: {
    color: SpendWiseTheme.colors.text,
    fontWeight: "800",
    fontSize: 20,
  },
  emptyText: {
    marginTop: 8,
    color: SpendWiseTheme.colors.textMuted,
    lineHeight: 20,
  },
  tableScrollContent: {
    paddingBottom: 20,
  },
  table: {
    width: 760,
    borderWidth: 2,
    borderColor: "#171717",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  tableHeader: {
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  tableRow: {
    minHeight: 92,
    flexDirection: "row",
    borderBottomWidth: 2,
    borderColor: "#171717",
  },
  headerCell: {
    fontSize: 17,
    fontWeight: "800",
    color: "#000000",
    padding: 16,
  },
  bodyCell: {
    fontSize: 14,
    color: "#1C1C1C",
    padding: 14,
  },
  cellDate: {
    width: 150,
    borderRightWidth: 2,
    borderColor: "#171717",
  },
  cellCategory: {
    width: 170,
    borderRightWidth: 2,
    borderColor: "#171717",
  },
  cellNote: {
    width: 260,
    borderRightWidth: 2,
    borderColor: "#171717",
  },
  cellAmount: {
    width: 180,
  },
  categoryCell: {
    padding: 14,
    justifyContent: "space-between",
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "800",
    color: SpendWiseTheme.colors.text,
  },
  typeBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(26,35,126,0.10)",
    color: SpendWiseTheme.colors.text,
    fontSize: 11,
    fontWeight: "800",
  },
  amountCell: {
    padding: 14,
    justifyContent: "space-between",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "800",
  },
  amountExpense: {
    color: SpendWiseTheme.colors.expense,
  },
  amountIncome: {
    color: SpendWiseTheme.colors.income,
  },
  deleteChip: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteChipText: {
    color: SpendWiseTheme.colors.expense,
    fontSize: 12,
    fontWeight: "800",
  },
});
