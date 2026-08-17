import { Pressable, Text, View } from "react-native";

import { settingsStyles as styles } from "@/features/settings/styles";

type BackupReportsSectionProps = {
  pdfLastExportLabel: string;
  onExportPdf: () => void;
};

export function BackupReportsSection({
  pdfLastExportLabel,
  onExportPdf,
}: BackupReportsSectionProps) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Reports & Backup</Text>
      <Text style={styles.sectionCaption}>
        Keep a portable PDF summary and use local exports when you want a copy outside the app.
      </Text>

      <View style={styles.infoSurface}>
        <View style={styles.infoSurfaceRow}>
          <Text style={styles.infoSurfaceLabel}>Last PDF report</Text>
          <Text style={styles.infoSurfaceValue}>{pdfLastExportLabel}</Text>
        </View>
        <Text style={styles.metaText}>
          The PDF includes logs, totals, and analytics so your records stay readable outside the
          app.
        </Text>
      </View>

      <Pressable style={styles.secondaryButton} onPress={onExportPdf}>
        <Text style={styles.secondaryButtonText}>Export PDF Report</Text>
      </Pressable>

      <Text style={styles.metaText}>
        For a restorable copy of your local database, use JSON backup and restore in the storage
        section above.
      </Text>
    </View>
  );
}
