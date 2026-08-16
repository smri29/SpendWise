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
      <Text style={styles.helperText}>
        SpendWise stores everything locally on this device. There are no accounts, remote APIs, or
        external analytics.
      </Text>
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </View>
  );
}
