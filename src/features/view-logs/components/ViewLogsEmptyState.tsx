import { Text, View } from "react-native";

import { viewLogsStyles as styles } from "@/features/view-logs/styles";

export function ViewLogsEmptyState() {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>No entries found</Text>
      <Text style={styles.emptyText}>
        Try a different filter or create your first transaction from the Add screen.
      </Text>
    </View>
  );
}
