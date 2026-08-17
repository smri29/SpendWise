import { Switch, Text, View } from "react-native";

import { settingsStyles as styles } from "@/features/settings/styles";

type SecuritySectionProps = {
  appLockEnabled: boolean;
  appLockSupported: boolean;
  onChangeAppLock: (value: boolean) => void;
};

export function SecuritySection({
  appLockEnabled,
  appLockSupported,
  onChangeAppLock,
}: SecuritySectionProps) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>App Security</Text>
      <Text style={styles.sectionCaption}>
        Lock SpendWise after leaving the app. Re-entry requires the device lock system.
      </Text>

      <View style={styles.infoSurface}>
        <View style={styles.infoSurfaceRow}>
          <Text style={styles.infoSurfaceLabel}>Unlock method</Text>
          <Text style={styles.infoSurfaceValue}>
            {appLockSupported ? "Biometric / PIN / Pattern" : "Unavailable"}
          </Text>
        </View>
        <Text style={styles.metaText}>
          {appLockSupported
            ? "SpendWise uses your phone's own secure unlock prompt."
            : "Set up device authentication first, then return here to enable app lock."}
        </Text>
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.toggleCopy}>
          <Text style={styles.rowLabel}>Lock SpendWise</Text>
          <Text style={styles.helperText}>
            Works like a chat lock: after exiting the app, the next open requires unlock.
          </Text>
          <Text style={styles.metaText}>
            {appLockSupported
              ? "Device authentication is available on this phone."
              : "This device has no enrolled authentication method for app lock."}
          </Text>
        </View>
        <Switch
          value={appLockEnabled}
          onValueChange={onChangeAppLock}
          disabled={!appLockSupported}
          trackColor={{ false: "#D4D4D8", true: "#D7E454" }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}
