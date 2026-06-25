import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { HistoryFilters, SpendWiseColors } from "@/constants/spendwise";
import {
  filterExpensesByPeriod,
  searchExpenses,
} from "@/database/expenseAnalytics";
import {
  deleteExpense,
  getAllExpenses,
  getSettings,
} from "@/database/expenseDatabase";
import { AppSettings, Expense, HistoryFilter } from "@/database/expenseDatabase.types";
import {
  formatCurrencyWithCode,
  formatDateTime,
  formatRelativeWindow,
} from "@/utils/formatters";

export default function ExpensesScreen() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [settings, setSettings] = useState<AppSettings>({
    currency: "BDT",
    notifications_enabled: 1,
    monthly_budget_start_day: 1,
  });

  const filteredExpenses = useMemo(() => {
    return filterExpensesByPeriod(searchExpenses(expenses, query), filter);
  }, [expenses, filter, query]);

  const filteredTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadExpenses() {
        try {
            const [savedExpenses, nextSettings] = await Promise.all([
              getAllExpenses(),
              getSettings(),
            ]);
            if (isActive) {
              setExpenses(savedExpenses);
              setSettings(nextSettings);
            }
        } catch (error) {
          console.log("Load expenses error:", error);
        }
      }

      loadExpenses();

      return () => {
        isActive = false;
      };
    }, []),
  );

  function confirmDelete(expense: Expense) {
    Alert.alert(
      "Delete expense?",
      `${expense.category} - ${formatCurrencyWithCode(expense.amount, settings.currency)}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense(expense.id);
              setExpenses((current) =>
                current.filter((currentExpense) => currentExpense.id !== expense.id),
              );
            } catch (error) {
              console.log("Delete expense error:", error);
              Alert.alert("Error", "Expense could not be deleted.");
            }
          },
        },
      ],
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={filteredExpenses}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Expense History</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrencyWithCode(filteredTotal, settings.currency)}
            </Text>
            <Text style={styles.summaryMeta}>
              {formatRelativeWindow(
                filteredTotal,
                filteredExpenses.length,
                settings.currency,
              )}
            </Text>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by category or note"
            value={query}
            onChangeText={setQuery}
          />

          <View style={styles.filterRow}>
            {HistoryFilters.map((item) => {
              const active = item.key === filter;
              return (
                <Pressable
                  key={item.key}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setFilter(item.key)}
                >
                  <Text
                    style={[styles.filterChipText, active && styles.filterChipTextActive]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No matching expenses</Text>
          <Text style={styles.emptyText}>
            Try another filter or add a new expense to build your history.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.expenseItem}>
          <Pressable
            style={styles.expenseMain}
            onPress={() =>
              router.push({
                pathname: "/add-expense",
                params: { expenseId: String(item.id) },
              })
            }
          >
            <View style={styles.expenseHeader}>
              <Text style={styles.expenseCategory}>{item.category}</Text>
              <Text style={styles.expenseAmount}>
                {formatCurrencyWithCode(item.amount, settings.currency)}
              </Text>
            </View>
            <Text style={styles.expenseNote}>{item.note?.trim() ? item.note : "No note"}</Text>
            <Text style={styles.expenseDate}>{formatDateTime(item.created_at)}</Text>
          </Pressable>
          <View style={styles.actionButtons}>
            <Pressable
              style={styles.editButton}
              onPress={() =>
                router.push({
                  pathname: "/add-expense",
                  params: { expenseId: String(item.id) },
                })
              }
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
            <Pressable
              style={styles.deleteButton}
              onPress={() => confirmDelete(item)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SpendWiseColors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 32,
    gap: 14,
  },
  header: {
    gap: 14,
    marginBottom: 14,
  },
  summaryCard: {
    backgroundColor: SpendWiseColors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: SpendWiseColors.text,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: SpendWiseColors.text,
  },
  summaryMeta: {
    fontSize: 14,
    color: SpendWiseColors.textMuted,
    marginTop: 6,
  },
  searchInput: {
    backgroundColor: SpendWiseColors.surface,
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: SpendWiseColors.surfaceMuted,
  },
  filterChipActive: {
    backgroundColor: SpendWiseColors.primary,
  },
  filterChipText: {
    color: SpendWiseColors.primary,
    fontWeight: "700",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  emptyCard: {
    backgroundColor: SpendWiseColors.surface,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: SpendWiseColors.text,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: SpendWiseColors.textMuted,
    lineHeight: 21,
  },
  expenseItem: {
    backgroundColor: SpendWiseColors.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
    gap: 14,
  },
  expenseMain: {
    gap: 6,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: SpendWiseColors.success,
  },
  expenseCategory: {
    fontSize: 17,
    fontWeight: "700",
    color: SpendWiseColors.text,
  },
  expenseNote: {
    fontSize: 14,
    color: SpendWiseColors.textMuted,
  },
  expenseDate: {
    fontSize: 13,
    color: SpendWiseColors.textMuted,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: SpendWiseColors.surfaceMuted,
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  editButtonText: {
    color: SpendWiseColors.text,
    fontWeight: "700",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: SpendWiseColors.dangerSoft,
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  deleteButtonText: {
    color: SpendWiseColors.danger,
    fontWeight: "700",
  },
});
