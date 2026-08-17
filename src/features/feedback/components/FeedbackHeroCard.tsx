import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { feedbackStyles as styles } from "@/features/feedback/styles";
import { SpendWiseTheme } from "@/theme/spendwise";

const signals = [
  "100% local-first data",
  "No account required",
  "Email-based feedback only",
] as const;

export function FeedbackHeroCard() {
  return (
    <View style={styles.heroCard}>
      <Text style={styles.pageTitle}>Feedback & About</Text>
      <Text style={styles.heroText}>
        Share what feels smooth, what feels messy, and what should be improved next.
      </Text>

      <View style={styles.signalRow}>
        {signals.map((signal) => (
          <View key={signal} style={styles.signalPill}>
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color={SpendWiseTheme.colors.text}
            />
            <Text style={styles.signalText}>{signal}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
