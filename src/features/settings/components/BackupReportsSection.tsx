import { Pressable, Switch, Text, View } from "react-native";

import { SegmentControl } from "@/components/ui/SegmentControl";
import { settingsStyles as styles } from "@/features/settings/styles";

const frequencyOptions = [
  { label: "15 Days", value: 15 },
  { label: "30 Days", value: 30 },
] as const;

type BackupReportsSectionProps = {
  driveBackupEnabled: boolean;
  driveBackupFrequencyDays: number;
  driveConnectedEmail: string | null;
  driveConfigured: boolean;
  driveLastBackupLabel: string;
  pdfLastExportLabel: string;
  onConnectDrive: () => void;
  onExportPdf: () => void;
  onToggleDriveBackup: (value: boolean) => void;
  onFrequencyChange: (value: 15 | 30) => void;
};

export function BackupReportsSection({
  driveBackupEnabled,
  driveBackupFrequencyDays,
  driveConnectedEmail,
  driveConfigured,
  driveLastBackupLabel,
  pdfLastExportLabel,
  onConnectDrive,
  onExportPdf,
  onToggleDriveBackup,
  onFrequencyChange,
}: BackupReportsSectionProps) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Reports & Backup</Text>
      <Text style={styles.sectionCaption}>
        Keep a portable PDF summary and prepare optional Drive backup for device loss or switching.
      </Text>

      <Pressable style={styles.secondaryButton} onPress={onExportPdf}>
        <Text style={styles.secondaryButtonText}>Export PDF Report</Text>
      </Pressable>
      <Text style={styles.metaText}>Last PDF export: {pdfLastExportLabel}</Text>

      <View style={styles.cloudCard}>
        <View style={styles.stripRow}>
          <View style={styles.toggleCopy}>
            <Text style={styles.rowLabel}>Google Drive backup</Text>
            <Text style={styles.helperText}>
              Stores PDF reports inside a `SpendWise` folder in the connected Google Drive.
            </Text>
            <Text style={styles.metaText}>
              {driveConnectedEmail
                ? `Connected account: ${driveConnectedEmail}`
                : driveConfigured
                  ? "Google Drive is not connected yet."
                  : "Google Drive is not configured in this build yet."}
            </Text>
          </View>
          <Switch
            value={driveBackupEnabled}
            onValueChange={onToggleDriveBackup}
            disabled={!driveConfigured}
            trackColor={{ false: "#D4D4D8", true: "#D7E454" }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Pressable style={styles.secondaryButton} onPress={onConnectDrive}>
          <Text style={styles.secondaryButtonText}>
            {driveConnectedEmail ? "Reconnect Google Drive" : "Connect Google Drive"}
          </Text>
        </Pressable>

        <Text style={styles.rowLabel}>Backup Frequency</Text>
        <SegmentControl
          options={frequencyOptions.map((item) => ({ ...item }))}
          value={driveBackupFrequencyDays === 30 ? 30 : 15}
          onChange={(value) => {
            if (!driveConfigured) {
              return;
            }

            onFrequencyChange(value);
          }}
        />

        <Text style={styles.metaText}>Last cloud backup: {driveLastBackupLabel}</Text>
        <Text style={styles.metaText}>
          Android background work is best-effort. A 15 day interval is treated as a minimum, not an
          exact schedule.
        </Text>
        {!driveConfigured ? (
          <Text style={styles.metaText}>
            Final Google Drive backup still needs Google OAuth credentials and build-time setup for
            this app.
          </Text>
        ) : null}
      </View>
    </View>
  );
}
