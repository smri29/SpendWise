import { type Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenFrame } from "@/components/ui/ScreenFrame";
import { SummaryPill } from "@/components/ui/SummaryPill";
import { getDashboardSnapshot, getSettingsSnapshot, type DashboardSnapshot, type SettingsSnapshot } from "@/db";
import { formatClockTime, formatCurrency, formatLongDate, getRetentionNotice } from "@/utils/format";
import { SpendWiseTheme } from "@/theme/spendwise";

const defaultSummary: DashboardSnapshot = {
  todaySpent: 0,
  todayEarned: 0,
  totalTransactions: 0,
};

const defaultSettings: SettingsSnapshot = {
  currencySymbol: "$",
  retentionMonths: 3,
  dailyReminderEnabled: true,
  dailyReminderTime: "20:00",
};

export default function HomeScreen() {
  const router = useRouter();
  const [now, setNow] = useState(() => new Date());
  const [summary, setSummary] = useState<DashboardSnapshot>(defaultSummary);
  const [settings, setSettings] = useState<SettingsSnapshot>(defaultSettings);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const [nextSummary, nextSettings] = await Promise.all([
        getDashboardSnapshot(),
        getSettingsSnapshot(),
      ]);
      setSummary(nextSummary);
      setSettings(nextSettings);
      setErrorMessage(null);
    } catch (error) {
      console.log("Home load error:", error);
      setErrorMessage("Unable to load today’s balance from local storage.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

  return (
    <ScreenFrame contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.title}>Welcome !</Text>
        <Text style={styles.subtitle}>Local • Private • Simple Budgeting</Text>
      </View>

      <View style={styles.datetimeBlock}>
        <Text style={styles.dateText}>Today is {formatLongDate(now)}</Text>
        <View style={styles.divider} />
        <Text style={styles.dateText}>Time: {formatClockTime(now)}</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.cardsRow}>
        <SummaryPill
          label="Today's Spent"
          value={formatCurrency(summary.todaySpent, settings.currencySymbol)}
          tone="expense"
        />
        <SummaryPill
          label="Today's Earned"
          value={formatCurrency(summary.todayEarned, settings.currencySymbol)}
          tone="income"
        />
      </View>

      <Text style={styles.smallMeta}>
        {summary.totalTransactions} transaction{summary.totalTransactions === 1 ? "" : "s"} saved on
        this device.
      </Text>

      {errorMessage ? <Text style={styles.inlineError}>{errorMessage}</Text> : null}

      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={() => router.push("/add" as Href)}>
          <Text style={styles.primaryButtonText}>+ Add Entry</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => router.push("/view" as Href)}>
          <Text style={styles.secondaryButtonText}>View Logs</Text>
        </Pressable>
      </View>

      <View style={styles.noticeCard}>
        <Text style={styles.noticeText}>{getRetentionNotice(settings.retentionMonths)}</Text>
      </View>

      <Text style={styles.footerText}>Confidence in your spending, completely on your terms.</Text>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 148,
    paddingBottom: 36,
    justifyContent: "space-between",
  },
  hero: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 46,
    lineHeight: 50,
    fontWeight: "800",
    color: SpendWiseTheme.colors.text,
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 15,
    color: SpendWiseTheme.colors.textMuted,
    fontWeight: "600",
  },
  datetimeBlock: {
    marginTop: 36,
    gap: 22,
  },
  dateText: {
    fontSize: 18,
    color: SpendWiseTheme.colors.text,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#AFBDF2",
  },
  cardsRow: {
    marginTop: 34,
    flexDirection: "row",
    gap: 14,
  },
  smallMeta: {
    marginTop: 14,
    fontSize: 13,
    color: SpendWiseTheme.colors.textMuted,
  },
  inlineError: {
    marginTop: 12,
    fontSize: 13,
    color: SpendWiseTheme.colors.expense,
    fontWeight: "700",
  },
  actions: {
    marginTop: 38,
    gap: 22,
  },
  primaryButton: {
    borderRadius: 28,
    backgroundColor: SpendWiseTheme.colors.card,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1A237E",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  primaryButtonText: {
    fontSize: 22,
    color: SpendWiseTheme.colors.text,
    fontWeight: "700",
  },
  secondaryButton: {
    borderRadius: 28,
    backgroundColor: "#F8F8FB",
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1A237E",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 9 },
    elevation: 5,
  },
  secondaryButtonText: {
    fontSize: 22,
    color: "#111111",
    fontWeight: "600",
  },
  noticeCard: {
    marginTop: 28,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.76)",
    borderWidth: 1,
    borderColor: "#EEE5A2",
    padding: 16,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 19,
    color: SpendWiseTheme.colors.text,
  },
  footerText: {
    marginTop: 22,
    textAlign: "center",
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
