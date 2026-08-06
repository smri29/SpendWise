import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SQLiteProvider, type SQLiteDatabase } from "expo-sqlite";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SystemUI from "expo-system-ui";

import { initializeDatabaseAsync } from "@/db";
import { prepareDailyReminderNotificationsAsync, syncDailyReminderNotificationAsync } from "@/services/reminders";
import { SpendWiseTheme } from "@/theme/spendwise";

export default function RootLayout() {
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(SpendWiseTheme.colors.background).catch(() => {
      return;
    });
  }, []);

  async function handleDatabaseInit(database: SQLiteDatabase) {
    try {
      await initializeDatabaseAsync(database);
      await prepareDailyReminderNotificationsAsync();
      await syncDailyReminderNotificationAsync();
      setBootstrapError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to initialize SpendWise.";
      console.log("SpendWise bootstrap error:", error);
      setBootstrapError(message);
    }
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SQLiteProvider databaseName="spendwise.db" onInit={handleDatabaseInit}>
        <StatusBar style="dark" />
        {bootstrapError ? (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>Offline database issue</Text>
            <Text style={styles.bannerText}>{bootstrapError}</Text>
          </View>
        ) : null}
        <Slot />
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SpendWiseTheme.colors.background,
  },
  banner: {
    position: "absolute",
    top: 56,
    left: 16,
    right: 16,
    zIndex: 20,
    borderRadius: 18,
    backgroundColor: "#FFF4F4",
    borderWidth: 1,
    borderColor: "#F4B7B7",
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#1A237E",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  bannerTitle: {
    color: SpendWiseTheme.colors.expense,
    fontSize: 14,
    fontWeight: "800",
  },
  bannerText: {
    marginTop: 4,
    color: SpendWiseTheme.colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
});
