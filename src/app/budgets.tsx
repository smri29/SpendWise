import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ExpenseCategories, SpendWiseColors } from "@/constants/spendwise";
import { getBudgetProgress, upsertBudget, deleteBudget } from "@/database/expenseDatabase";
import { BudgetProgress } from "@/database/expenseDatabase.types";
import { formatCurrency, formatPercentage, normalizeText } from "@/utils/formatters";

export default function BudgetsScreen() {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");
  const [budgets, setBudgets] = useState<BudgetProgress[]>([]);

  const loadBudgets = useCallback(async () => {
    try {
      setBudgets(await getBudgetProgress());
    } catch (error) {
      console.log("Load budgets error:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [loadBudgets]),
  );

  async function handleSaveBudget() {
    const normalizedCategory = normalizeText(category);
    const numericLimit = Number(limit);

    if (!normalizedCategory || Number.isNaN(numericLimit) || numericLimit <= 0) {
      Alert.alert("Invalid budget", "Enter a category and a valid monthly limit.");
      return;
    }

    await upsertBudget(normalizedCategory, numericLimit);
    setCategory("");
    setLimit("");
    await loadBudgets();
  }

  function confirmDeleteBudget(budget: BudgetProgress) {
    Alert.alert(
      "Delete budget?",
      `Remove the budget for ${budget.category}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteBudget(budget.id);
            await loadBudgets();
          },
        },
      ],
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.formCard}>
        <Text style={styles.title}>Monthly Budgets</Text>
        <Text style={styles.subtitle}>
          Set category limits so SpendWise can warn you before your spending drifts.
        </Text>

        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          value={category}
          onChangeText={setCategory}
          placeholder="Example: Food"
        />

        <View style={styles.chipsRow}>
          {ExpenseCategories.map((item) => (
            <Pressable key={item} style={styles.chip} onPress={() => setCategory(item)}>
              <Text style={styles.chipText}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Monthly limit</Text>
        <TextInput
          style={styles.input}
          value={limit}
          onChangeText={setLimit}
          placeholder="Example: 5000"
          keyboardType="decimal-pad"
        />

        <Pressable style={styles.primaryButton} onPress={handleSaveBudget}>
          <Text style={styles.primaryButtonText}>Save Budget</Text>
        </Pressable>
      </View>

      {budgets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No budgets set yet</Text>
          <Text style={styles.emptyText}>
            Budgets make the app more proactive by highlighting risky categories before month-end.
          </Text>
        </View>
      ) : (
        budgets.map((budget) => (
          <View key={budget.id} style={styles.budgetCard}>
            <View style={styles.row}>
              <Text style={styles.budgetCategory}>{budget.category}</Text>
              <Text style={styles.budgetPercent}>{formatPercentage(budget.usageRatio)}</Text>
            </View>
            <Text style={styles.budgetMeta}>
              Spent {formatCurrency(budget.spent)} from {formatCurrency(budget.monthly_limit)}
            </Text>
            <Text
              style={[
                styles.budgetStatus,
                budget.status === "over"
                  ? styles.statusOver
                  : budget.status === "warning"
                    ? styles.statusWarning
                    : styles.statusSafe,
              ]}
            >
              {budget.status === "over"
                ? `Over by ${formatCurrency(Math.abs(budget.remaining))}`
                : `Remaining ${formatCurrency(budget.remaining)}`}
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${Math.min(Math.max(budget.usageRatio * 100, 6), 100)}%`,
                    backgroundColor:
                      budget.status === "over"
                        ? SpendWiseColors.danger
                        : budget.status === "warning"
                          ? SpendWiseColors.warning
                          : SpendWiseColors.success,
                  },
                ]}
              />
            </View>
            <Pressable style={styles.deleteButton} onPress={() => confirmDeleteBudget(budget)}>
              <Text style={styles.deleteButtonText}>Delete Budget</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SpendWiseColors.background },
  content: { padding: 20, paddingBottom: 32, gap: 16 },
  formCard: {
    backgroundColor: SpendWiseColors.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
  },
  title: { fontSize: 28, fontWeight: "700", color: SpendWiseColors.text },
  subtitle: { fontSize: 14, lineHeight: 21, color: SpendWiseColors.textMuted, marginTop: 8 },
  label: { fontSize: 15, fontWeight: "700", color: SpendWiseColors.text, marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
  },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  chip: {
    backgroundColor: SpendWiseColors.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chipText: { color: SpendWiseColors.primary, fontWeight: "600" },
  primaryButton: {
    backgroundColor: SpendWiseColors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 18,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  emptyCard: {
    backgroundColor: SpendWiseColors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: SpendWiseColors.text, marginBottom: 6 },
  emptyText: { fontSize: 14, color: SpendWiseColors.textMuted, lineHeight: 21 },
  budgetCard: {
    backgroundColor: SpendWiseColors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
    gap: 8,
  },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  budgetCategory: { fontSize: 17, fontWeight: "700", color: SpendWiseColors.text },
  budgetPercent: { fontSize: 16, fontWeight: "700", color: SpendWiseColors.text },
  budgetMeta: { fontSize: 14, color: SpendWiseColors.textMuted },
  budgetStatus: { fontSize: 14, fontWeight: "700" },
  statusSafe: { color: SpendWiseColors.success },
  statusWarning: { color: SpendWiseColors.warning },
  statusOver: { color: SpendWiseColors.danger },
  barTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: SpendWiseColors.surfaceMuted,
    overflow: "hidden",
    marginTop: 4,
  },
  barFill: { height: "100%", borderRadius: 999 },
  deleteButton: {
    backgroundColor: SpendWiseColors.dangerSoft,
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  deleteButtonText: { color: SpendWiseColors.danger, fontWeight: "700" },
});
