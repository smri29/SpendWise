import { Pressable, Text, View } from "react-native";

import type { SettingsSnapshot, TransactionListItem } from "@/db";
import { viewLogsStyles as styles } from "@/features/view-logs/styles";
import { formatMoney, formatShortDateTime } from "@/utils/format";

type LogsListProps = {
  rows: TransactionListItem[];
  settings: SettingsSnapshot;
  onDelete: (item: TransactionListItem) => void;
};

/**
 * Mobile-first list layout for logs.
 * Each row exposes the full story without requiring horizontal scrolling.
 */
export function LogsList({ rows, settings, onDelete }: LogsListProps) {
  return (
    <View style={styles.logsList}>
      {rows.map((item) => {
        const isExpense = item.type === "EXPENSE";

        return (
          <Pressable
            key={item.id}
            onLongPress={() => onDelete(item)}
            style={styles.logCard}
          >
            <View style={styles.logCardTopRow}>
              <View style={styles.logMainBlock}>
                <Text style={styles.logCategory}>{item.categoryName ?? "Uncategorized"}</Text>
                <Text style={styles.logDate}>{formatShortDateTime(item.createdAt)}</Text>
              </View>

              <View style={styles.logAmountBlock}>
                <Text
                  style={[
                    styles.logAmount,
                    isExpense ? styles.amountExpense : styles.amountIncome,
                  ]}
                >
                  {isExpense ? "-" : "+"}
                  {formatMoney(item.amount, settings.currencySymbol)}
                </Text>
                <Text style={[styles.logTypeBadge, isExpense ? styles.expenseBadge : styles.incomeBadge]}>
                  {isExpense ? "Expense" : "Income"}
                </Text>
              </View>
            </View>

            <View style={styles.logMetaGrid}>
              <View style={styles.logMetaItem}>
                <Text style={styles.logMetaLabel}>Note</Text>
                <Text style={styles.logMetaValue}>
                  {item.note.trim() ? item.note : "No note added"}
                </Text>
              </View>
            </View>

            <View style={styles.logActionsRow}>
              <Text style={styles.logActionHint}>Hold card or tap delete to remove</Text>
              <Pressable style={styles.deleteChip} onPress={() => onDelete(item)}>
                <Text style={styles.deleteChipText}>Delete</Text>
              </Pressable>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
