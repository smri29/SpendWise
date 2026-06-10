import { insertExpense } from "@/database/expenseDatabase";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Expense = {
  id: number;
  amount: string;
  category: string;
  note: string;
};

export default function AddExpenseScreen() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");

  const [expenses, setExpenses] = useState<Expense[]>([]);

  async function handleSaveExpense() {
    if (!amount || !category) {
      Alert.alert("Missing information", "Please enter amount and category.");
      return;
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }

    try {
      const insertedId = await insertExpense(numericAmount, category, note);

      const newExpense: Expense = {
        id: insertedId,
        amount: amount,
        category: category,
        note: note,
      };

      setExpenses([newExpense, ...expenses]);

      setAmount("");
      setCategory("");
      setNote("");

      console.log("Expense saved:", newExpense);
    } catch (error) {
      console.log("Save expense error:", error);
      Alert.alert("Error", "Expense could not be saved.");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Expense</Text>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="Example: 120"
        keyboardType="numeric"
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

      <Text style={styles.label}>Note</Text>
      <TextInput
        style={styles.input}
        placeholder="Example: Lunch"
        value={note}
        onChangeText={setNote}
      />

      <TouchableOpacity style={styles.button} onPress={handleSaveExpense}>
        <Text style={styles.buttonText}>Save Expense</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Saved Expenses</Text>

      {expenses.map((expense) => (
        <View key={expense.id} style={styles.expenseItem}>
          <Text style={styles.expenseAmount}>৳ {expense.amount}</Text>
          <Text style={styles.expenseCategory}>{expense.category}</Text>
          <Text style={styles.expenseNote}>{expense.note}</Text>
        </View>
      ))}
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
    marginBottom: 28,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginTop: 28,
    marginBottom: 12,
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
});