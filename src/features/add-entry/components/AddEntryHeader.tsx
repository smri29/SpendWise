import { Text, View } from "react-native";

import { addEntryStyles as styles } from "@/features/add-entry/styles";

export function AddEntryHeader() {
  return (
    <View style={styles.headerCard}>
      <Text style={styles.pageTitle}>Add Entry</Text>
      <Text style={styles.captionText}>Local | Private | Simple Budgeting</Text>
      <Text style={styles.helperText}>
        Capture one income or expense with a category, note, and timestamp you control.
      </Text>
    </View>
  );
}
