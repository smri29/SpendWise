import { type Href, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { ScreenFrame } from "@/components/ui/ScreenFrame";
import { SummaryPill } from "@/components/ui/SummaryPill";
import { homeStyles as styles } from "@/features/home/homeStyles";
import { useHomeDashboard } from "@/features/home/useHomeDashboard";
import {
  formatClockTime,
  formatLongDate,
  formatMoney,
  getRetentionNotice,
} from "@/utils/format";

export default function HomeScreen() {
  const router = useRouter();
  const { errorMessage, now, reminderLabel, settings, summary } = useHomeDashboard();

  return (
    <ScreenFrame contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>Local | Private | Simple Budgeting</Text>
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
          value={formatMoney(summary.todaySpent, settings.currencySymbol)}
          tone="expense"
        />
        <SummaryPill
          label="Today's Earned"
          value={formatMoney(summary.todayEarned, settings.currencySymbol)}
          tone="income"
        />
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Quick status</Text>
        <Text style={styles.statusLine}>
          {summary.totalTransactions} transaction{summary.totalTransactions === 1 ? "" : "s"} saved
          on this device
        </Text>
        <Text style={styles.statusLine}>{reminderLabel}</Text>
      </View>

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

      <Text style={styles.footerText}>
        Confidence in your spending, completely on your terms.
      </Text>
    </ScreenFrame>
  );
}
