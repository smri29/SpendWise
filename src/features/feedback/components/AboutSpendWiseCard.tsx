import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { feedbackStyles as styles } from "@/features/feedback/styles";
import { SpendWiseTheme } from "@/theme/spendwise";

const highlights = [
  "100% offline Android budgeting",
  "SQLite-based local records",
  "Private exports and backups under user control",
] as const;

export function AboutSpendWiseCard() {
  return (
    <View style={styles.aboutCard}>
      <Text style={styles.aboutTitle}>About SpendWise</Text>
      <Text style={styles.aboutSubtitle}>Local • Private • Simple Budgeting</Text>
      <Text style={styles.aboutText}>
        SpendWise is built for people who want confidence in daily spending without handing their
        financial history to external analytics platforms or account systems.
      </Text>
      <Text style={styles.aboutText}>
        Categories, transactions, reminders, reports, and preferences stay on the device unless
        you intentionally export or back them up.
      </Text>

      <View style={styles.highlightList}>
        {highlights.map((item) => (
          <View key={item} style={styles.highlightRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color={SpendWiseTheme.colors.text} />
            <Text style={styles.highlightText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.signatureCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Author</Text>
          <Text style={styles.infoValue}>Shah Mohammad Rizvi</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Slogan</Text>
          <Text style={styles.infoValue}>Confidence on your terms</Text>
        </View>
      </View>
    </View>
  );
}
