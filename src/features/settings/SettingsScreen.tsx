import DateTimePicker from "@react-native-community/datetimepicker";
import { Text } from "react-native";

import { ScreenFrame } from "@/components/ui/ScreenFrame";
import { DataRetentionSection } from "@/features/settings/components/DataRetentionSection";
import { DailyReminderSection } from "@/features/settings/components/DailyReminderSection";
import { GeneralPreferencesSection } from "@/features/settings/components/GeneralPreferencesSection";
import { PrivacyAboutSection } from "@/features/settings/components/PrivacyAboutSection";
import { useSettingsScreen } from "@/features/settings/hooks/useSettingsScreen";
import { settingsStyles as styles } from "@/features/settings/styles";

export default function SettingsScreen() {
  const settingsScreen = useSettingsScreen();

  return (
    <ScreenFrame contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Settings</Text>

      <GeneralPreferencesSection
        settings={settingsScreen.settings}
        onCurrencyChange={(value) => void settingsScreen.patchSettings({ currencySymbol: value })}
      />

      <DataRetentionSection
        isImporting={settingsScreen.isImporting}
        retentionSummary={settingsScreen.retentionSummary}
        settings={settingsScreen.settings}
        storage={settingsScreen.storage}
        onBackupExport={() => void settingsScreen.handleBackupExport()}
        onBackupImport={() => void settingsScreen.handleBackupImport()}
        onClearAllData={settingsScreen.confirmClearAllData}
        onRetentionChange={(value) => void settingsScreen.patchSettings({ retentionMonths: value })}
      />

      <DailyReminderSection
        settings={settingsScreen.settings}
        onChangeEnabled={(value) =>
          void settingsScreen.patchSettings({ dailyReminderEnabled: value })
        }
        onPressTime={() => settingsScreen.setShowTimePicker(true)}
      />

      <PrivacyAboutSection />

      {settingsScreen.errorMessage ? (
        <Text style={styles.inlineError}>{settingsScreen.errorMessage}</Text>
      ) : null}

      {settingsScreen.showTimePicker ? (
        <DateTimePicker
          value={settingsScreen.reminderDate}
          mode="time"
          display="default"
          onChange={settingsScreen.handleTimeChange}
        />
      ) : null}
    </ScreenFrame>
  );
}
