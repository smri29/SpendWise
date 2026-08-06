import { StyleSheet, Text, View } from "react-native";

import { SpendWiseTheme } from "@/theme/spendwise";

type SummaryPillProps = {
  label: string;
  value: string;
  tone: "income" | "expense";
};

export function SummaryPill({ label, value, tone }: SummaryPillProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, tone === "income" ? styles.income : styles.expense]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.76)",
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  label: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
  },
  value: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: "800",
  },
  income: {
    color: SpendWiseTheme.colors.income,
  },
  expense: {
    color: SpendWiseTheme.colors.expense,
  },
});
