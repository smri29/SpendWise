import { Pressable, Text, View } from "react-native";

import { SegmentControl } from "@/components/ui/SegmentControl";
import { retentionOptions } from "@/features/settings/constants";
import { settingsStyles as styles } from "@/features/settings/styles";
import { formatBytes } from "@/utils/format";
import type { SettingsSnapshot, StorageSnapshot } from "@/db";

type DataRetentionSectionProps = {
  isImporting: boolean;
  retentionSummary: string;
  settings: SettingsSnapshot;
  storage: StorageSnapshot;
  onBackupExport: () => void;
  onBackupImport: () => void;
  onClearAllData: () => void;
  onRetentionChange: (value: SettingsSnapshot["retentionMonths"]) => void;
};

export function DataRetentionSection({
  isImporting,
  retentionSummary,
  settings,
  storage,
  onBackupExport,
  onBackupImport,
  onClearAllData,
  onRetentionChange,
}: DataRetentionSectionProps) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Data Retention & Storage</Text>
      <Text style={styles.sectionCaption}>
        Decide how long local history stays on this device and manage manual backup files.
      </Text>
      <View style={styles.infoSurface}>
        <View style={styles.infoSurfaceRow}>
          <Text style={styles.infoSurfaceLabel}>Local database</Text>
          <Text style={styles.infoSurfaceValue}>{formatBytes(storage.estimatedBytes)}</Text>
        </View>
        <Text style={styles.metaText}>
          {storage.transactionsCount} transactions, {storage.categoriesCount} categories,{" "}
          {storage.settingsCount} settings entries stored offline on this device.
        </Text>
      </View>
      <Text style={styles.rowLabel}>Auto-Delete History</Text>
      <SegmentControl
        options={retentionOptions}
        value={settings.retentionMonths}
        onChange={onRetentionChange}
      />
      <Text style={styles.storageText}>{retentionSummary}</Text>
      <Text style={styles.storageText}>
        Export a JSON backup before clearing data or switching to a new device.
      </Text>
      <Pressable style={styles.secondaryButton} onPress={onBackupExport}>
        <Text style={styles.secondaryButtonText}>Backup Data (.json)</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={onBackupImport} disabled={isImporting}>
        <Text style={styles.secondaryButtonText}>
          {isImporting ? "Restoring..." : "Restore Data (.json)"}
        </Text>
      </Pressable>
      <Pressable style={styles.dangerButton} onPress={onClearAllData}>
        <Text style={styles.dangerButtonText}>Clear All Data</Text>
      </Pressable>
      <Text style={styles.metaText}>
        Clear All Data deletes transactions, categories, reminders, and saved preferences from this
        phone.
      </Text>
    </View>
  );
}
