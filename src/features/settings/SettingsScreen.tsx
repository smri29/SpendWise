import DateTimePicker from "@react-native-community/datetimepicker";
import { Text, View } from "react-native";

import { ScreenFrame } from "@/components/ui/ScreenFrame";
import { BackupReportsSection } from "@/features/settings/components/BackupReportsSection";
import { DataRetentionSection } from "@/features/settings/components/DataRetentionSection";
import { DailyReminderSection } from "@/features/settings/components/DailyReminderSection";
import { GeneralPreferencesSection } from "@/features/settings/components/GeneralPreferencesSection";
import { PrivacyAboutSection } from "@/features/settings/components/PrivacyAboutSection";
import { SecuritySection } from "@/features/settings/components/SecuritySection";
import { useSettingsScreen } from "@/features/settings/hooks/useSettingsScreen";
import { settingsStyles as styles } from "@/features/settings/styles";

export default function SettingsScreen() {
  const settingsScreen = useSettingsScreen();

  return (
    <ScreenFrame contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>Settings</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Protection & Backup</Text>
        <Text style={styles.heroText}>
          Control privacy, storage, reminders, reports, and device protection from one place.
        </Text>
      </View>

      <GeneralPreferencesSection
        settings={settingsScreen.settings}
        onCurrencyChange={(value) => void settingsScreen.patchSettings({ currencySymbol: value })}
      />

      <SecuritySection
        appLockEnabled={settingsScreen.settings.appLockEnabled}
        appLockSupported={settingsScreen.appLockSupported}
        onChangeAppLock={(value) => void settingsScreen.handleAppLockToggle(value)}
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

      <BackupReportsSection
        driveBackupEnabled={settingsScreen.settings.driveBackupEnabled}
        driveBackupFrequencyDays={settingsScreen.settings.driveBackupFrequencyDays}
        driveConnectedEmail={settingsScreen.settings.driveConnectedEmail}
        driveConfigured={false}
        driveLastBackupLabel={settingsScreen.driveLastBackupLabel}
        pdfLastExportLabel={settingsScreen.pdfLastExportLabel}
        onConnectDrive={() => void settingsScreen.handleDriveConnect()}
        onExportPdf={() => void settingsScreen.handlePdfExport()}
        onToggleDriveBackup={(value) =>
          void settingsScreen.patchSettings({ driveBackupEnabled: value })
        }
        onFrequencyChange={(value) =>
          void settingsScreen.patchSettings({ driveBackupFrequencyDays: value })
        }
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
