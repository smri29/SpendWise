import { Pressable, Switch, Text, View } from "react-native";

import { settingsStyles as styles } from "@/features/settings/styles";
import type { SettingsSnapshot } from "@/db";

type DailyReminderSectionProps = {
  settings: SettingsSnapshot;
  onChangeEnabled: (value: boolean) => void;
  onPressTime: () => void;
};

export function DailyReminderSection({
  settings,
  onChangeEnabled,
  onPressTime,
}: DailyReminderSectionProps) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>Daily Reminder</Text>
      <Text style={styles.sectionCaption}>
        One privacy-safe local notification helps you keep logging on time.
      </Text>
      <View style={styles.toggleRow}>
        <View style={styles.toggleCopy}>
          <Text style={styles.rowLabel}>Daily log reminder</Text>
          <Text style={styles.helperText}>
            One local notification reminds you to log spending at your chosen time.
          </Text>
        </View>
        <Switch
          value={settings.dailyReminderEnabled}
          onValueChange={onChangeEnabled}
          trackColor={{ false: "#D4D4D8", true: "#D7E454" }}
          thumbColor="#FFFFFF"
        />
      </View>
      <Pressable style={styles.reminderTimeCard} onPress={onPressTime}>
        <Text style={styles.rowLabel}>Reminder Time</Text>
        <Text style={styles.timeValue}>{settings.dailyReminderTime}</Text>
        <Text style={styles.metaText}>Uses only local device notifications.</Text>
      </Pressable>
    </View>
  );
}
