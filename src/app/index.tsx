import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.appName}>SpendWise</Text>

      <Text style={styles.subtitle}>Track your daily expenses easily</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today&apos;s Expense</Text>
        <Text style={styles.amount}>৳ 0</Text>
      </View>

      <Link href="/add-expense" style={styles.button}>
        <Text style={styles.buttonText}>Add Expense</Text>
      </Link>

      <Link href="/expenses" style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>View Expenses</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
  },
  appName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 18,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },
  amount: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#111827",
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 14,
    textAlign: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  secondaryButton: {
    backgroundColor: "#E5E7EB",
    padding: 16,
    borderRadius: 14,
    textAlign: "center",
  },
  secondaryButtonText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});