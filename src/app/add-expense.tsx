import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ExpenseCategories, SpendWiseColors } from "@/constants/spendwise";
import {
  deleteExpense,
  getExpenseById,
  getRecentCategories,
  insertExpense,
  updateExpense,
} from "@/database/expenseDatabase";
import { normalizeText } from "@/utils/formatters";

export default function AddExpenseScreen() {
  const router = useRouter();
  const { expenseId } = useLocalSearchParams<{ expenseId?: string }>();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [recentCategories, setRecentCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const parsedExpenseId = expenseId ? Number(expenseId) : null;
  const isEditing = parsedExpenseId !== null && !Number.isNaN(parsedExpenseId);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadScreen() {
        try {
          const categories = await getRecentCategories();
          if (isActive) {
            setRecentCategories(categories);
          }

          if (isEditing && parsedExpenseId !== null) {
            const expense = await getExpenseById(parsedExpenseId);
            if (isActive && expense) {
              setAmount(String(expense.amount));
              setCategory(expense.category);
              setNote(expense.note ?? "");
            }
          } else if (isActive) {
            setAmount("");
            setCategory("");
            setNote("");
          }
        } catch (error) {
          console.log("Load add-expense screen error:", error);
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      }

      setIsLoading(true);
      loadScreen();

      return () => {
        isActive = false;
      };
    }, [isEditing, parsedExpenseId]),
  );

  async function handleSaveExpense() {
    const normalizedCategory = normalizeText(category);
    const normalizedNote = note.trim();

    if (!amount || !normalizedCategory) {
      Alert.alert("Missing information", "Please enter amount and category.");
      return;
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }

    try {
      setIsSaving(true);

      if (isEditing && parsedExpenseId !== null) {
        await updateExpense(
          parsedExpenseId,
          numericAmount,
          normalizedCategory,
          normalizedNote,
        );
      } else {
        await insertExpense(numericAmount, normalizedCategory, normalizedNote);
      }

      router.replace("/expenses");
    } catch (error) {
      console.log("Save expense error:", error);
      Alert.alert("Error", "Expense could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  function confirmDeleteExpense() {
    if (!isEditing || parsedExpenseId === null) {
      return;
    }

    Alert.alert("Delete expense?", "This action cannot be undone.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteExpense(parsedExpenseId);
            router.replace("/expenses");
          } catch (error) {
            console.log("Delete expense error:", error);
            Alert.alert("Error", "Expense could not be deleted.");
          }
        },
      },
    ]);
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Preparing expense form...</Text>
      </View>
    );
  }

  const suggestedCategories = [...new Set([...recentCategories, ...ExpenseCategories])].slice(0, 10);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.title}>{isEditing ? "Edit Expense" : "Add Expense"}</Text>
          <Text style={styles.subtitle}>
            {isEditing
              ? "Update the amount, category, or note for this entry."
              : "Capture a new expense in a few seconds."}
          </Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: 450"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: Food"
            value={category}
            onChangeText={setCategory}
          />

          <View style={styles.chipsRow}>
            {suggestedCategories.map((item) => {
              const isSelected = item.toLowerCase() === category.trim().toLowerCase();
              return (
                <Pressable
                  key={item}
                  style={[styles.chip, isSelected && styles.chipActive]}
                  onPress={() => setCategory(item)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Note</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="What was this expense for?"
            value={note}
            multiline
            numberOfLines={4}
            onChangeText={setNote}
            textAlignVertical="top"
          />

          <Pressable
            style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
            onPress={handleSaveExpense}
            disabled={isSaving}
          >
            <Text style={styles.primaryButtonText}>
              {isSaving
                ? "Saving..."
                : isEditing
                  ? "Update Expense"
                  : "Save Expense"}
            </Text>
          </Pressable>

          <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </Pressable>

          {isEditing ? (
            <Pressable style={styles.deleteButton} onPress={confirmDeleteExpense}>
              <Text style={styles.deleteButtonText}>Delete Expense</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: SpendWiseColors.background,
    padding: 24,
  },
  loadingText: {
    fontSize: 15,
    color: SpendWiseColors.textMuted,
  },
  headerCard: {
    backgroundColor: SpendWiseColors.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
    gap: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: SpendWiseColors.text,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: SpendWiseColors.textMuted,
  },
  formCard: {
    backgroundColor: SpendWiseColors.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: SpendWiseColors.text,
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: SpendWiseColors.border,
    color: SpendWiseColors.text,
  },
  noteInput: {
    minHeight: 110,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: SpendWiseColors.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: SpendWiseColors.primary,
  },
  chipText: {
    color: SpendWiseColors.primary,
    fontWeight: "600",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  primaryButton: {
    backgroundColor: SpendWiseColors.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 18,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: SpendWiseColors.surfaceMuted,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
  },
  secondaryButtonText: {
    color: SpendWiseColors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  deleteButton: {
    backgroundColor: SpendWiseColors.dangerSoft,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
  },
  deleteButtonText: {
    color: SpendWiseColors.danger,
    fontSize: 16,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
