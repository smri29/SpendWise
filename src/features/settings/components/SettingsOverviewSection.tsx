import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { settingsStyles as styles } from "@/features/settings/styles";
import { SpendWiseTheme } from "@/theme/spendwise";

type SettingsOverviewSectionProps = {
  appLockLabel: string;
  reminderLabel: string;
  retentionLabel: string;
  reportsLabel: string;
};

export function SettingsOverviewSection({
  appLockLabel,
  reminderLabel,
  retentionLabel,
  reportsLabel,
}: SettingsOverviewSectionProps) {
  const items = [
    { icon: "shield-checkmark-outline" as const, title: "App Lock", value: appLockLabel },
    { icon: "notifications-outline" as const, title: "Reminder", value: reminderLabel },
    { icon: "archive-outline" as const, title: "Retention", value: retentionLabel },
    { icon: "document-text-outline" as const, title: "Reports", value: reportsLabel },
  ];

  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>At a Glance</Text>
      <Text style={styles.sectionCaption}>
        Review protection, reminders, retention, and backup readiness in one place.
      </Text>

      <View style={styles.overviewGrid}>
        {items.map((item) => (
          <View key={item.title} style={styles.overviewCard}>
            <View style={styles.overviewIconWrap}>
              <Ionicons name={item.icon} size={20} color={SpendWiseTheme.colors.text} />
            </View>
            <Text style={styles.overviewTitle}>{item.title}</Text>
            <Text style={styles.overviewValue}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
