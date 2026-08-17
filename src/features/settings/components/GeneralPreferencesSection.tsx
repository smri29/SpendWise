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
      <View style={styles.infoSurface}>
        <View style={styles.infoSurfaceRow}>
          <Text style={styles.infoSurfaceLabel}>Current currency</Text>
          <Text style={styles.infoSurfaceValue}>{settings.currencySymbol}</Text>
        </View>
        <Text style={styles.metaText}>
          This changes labels and export formatting only. It does not convert amounts.
        </Text>
      </View>
      <Text style={styles.rowLabel}>Currency</Text>
      <SegmentControl
        options={currencyOptions}
        value={settings.currencySymbol}
        onChange={onCurrencyChange}
      />
    </View>
  );
}
