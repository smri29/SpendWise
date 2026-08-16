import { Text, View } from "react-native";

import { SegmentControl } from "@/components/ui/SegmentControl";
import { currencyOptions } from "@/features/settings/constants";
import { settingsStyles as styles } from "@/features/settings/styles";
import type { SettingsSnapshot } from "@/db";

type GeneralPreferencesSectionProps = {
  settings: SettingsSnapshot;
  onCurrencyChange: (value: SettingsSnapshot["currencySymbol"]) => void;
};

export function GeneralPreferencesSection({
  settings,
  onCurrencyChange,
}: GeneralPreferencesSectionProps) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>General Preferences</Text>
      <Text style={styles.sectionCaption}>
        Set how money appears across home, logs, analytics, and exports.
      </Text>
      <Text style={styles.rowLabel}>Currency</Text>
      <SegmentControl
        options={currencyOptions}
        value={settings.currencySymbol}
        onChange={onCurrencyChange}
      />
    </View>
  );
}
