import { Text, View } from "react-native";

import { settingsStyles as styles } from "@/features/settings/styles";

export function PrivacyAboutSection() {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Privacy & About</Text>
      <Text style={styles.sectionCaption}>
        SpendWise is designed for offline-first budgeting with direct user control over backups and
        device access.
      </Text>
      <View style={styles.infoSurface}>
        <View style={styles.infoSurfaceRow}>
          <Text style={styles.infoSurfaceLabel}>Author</Text>
          <Text style={styles.infoSurfaceValue}>Shah Mohammad Rizvi</Text>
        </View>
        <View style={styles.infoSurfaceRow}>
          <Text style={styles.infoSurfaceLabel}>Version</Text>
          <Text style={styles.infoSurfaceValue}>1.0.0</Text>
        </View>
      </View>
      <Text style={styles.helperText}>
        SpendWise stores everything locally on this device. There are no accounts, remote APIs, or
        external analytics.
      </Text>
      <Text style={styles.helperText}>
        Cloud backup requires explicit user setup and remains separate from the app&apos;s offline-first
        core behavior.
      </Text>
      <Text style={styles.versionText}>Confidence in your spending, completely on your terms.</Text>
    </View>
  );
}
