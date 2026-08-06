import { Pressable, Text, View } from "react-native";

import { viewLogsStyles as styles } from "@/features/view-logs/styles";

type ViewLogsHeaderProps = {
  isExporting: boolean;
  onExport: () => void;
};

export function ViewLogsHeader({ isExporting, onExport }: ViewLogsHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.pageTitle}>View Logs</Text>
        <Text style={styles.pageSubtitle}>Chronological local history, newest first.</Text>
      </View>
      <Pressable style={styles.exportButton} onPress={onExport} disabled={isExporting}>
        <Text style={styles.exportText}>{isExporting ? "Exporting..." : "Export"}</Text>
      </Pressable>
    </View>
  );
}
