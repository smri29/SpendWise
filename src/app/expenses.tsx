import { Expense, getAllExpenses } from "@/database/expenseDatabase";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    async function loadExpenses() {
      try {
        const savedExpenses = await getAllExpenses();
        setExpenses(savedExpenses);
        console.log("Loaded expenses:", savedExpenses);
      } catch (error) {
        console.log("Load expenses error:", error);
      }
    }

    loadExpenses();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expenses</Text>

      {expenses.length === 0 ? (
        <Text style={styles.emptyText}>No expenses found.</Text>
      ) : (
        expenses.map((expense) => (
          <View key={expense.id} style={styles.expenseItem}>
            <Text style={styles.expenseAmount}>৳ {expense.amount}</Text>
            <Text style={styles.expenseCategory}>{expense.category}</Text>
            <Text style={styles.expenseNote}>{expense.note}</Text>
            <Text style={styles.expenseDate}>{expense.created_at}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F5F7FA",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
  },
  expenseItem: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  expenseCategory: {
    fontSize: 15,
    color: "#374151",
    marginTop: 4,
  },
  expenseNote: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  expenseDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 6,
  },
});