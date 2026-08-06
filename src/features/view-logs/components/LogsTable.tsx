import { Pressable, ScrollView, Text, View } from "react-native";

import type { SettingsSnapshot, TransactionListItem } from "@/db";
import { viewLogsStyles as styles } from "@/features/view-logs/styles";
import { formatMoney, formatShortDateTime } from "@/utils/format";

type LogsTableProps = {
  rows: TransactionListItem[];
  settings: SettingsSnapshot;
  onDelete: (item: TransactionListItem) => void;
};

export function LogsTable({ rows, settings, onDelete }: LogsTableProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tableScrollContent}
    >
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.headerCell, styles.cellDate]}>Date</Text>
          <Text style={[styles.headerCell, styles.cellCategory]}>Category</Text>
          <Text style={[styles.headerCell, styles.cellNote]}>Note</Text>
          <Text style={[styles.headerCell, styles.cellAmount]}>Amount</Text>
        </View>

        {rows.map((item) => (
          <Pressable key={item.id} onLongPress={() => onDelete(item)} style={styles.tableRow}>
            <Text style={[styles.bodyCell, styles.cellDate]}>
              {formatShortDateTime(item.createdAt)}
            </Text>
            <View style={[styles.cellCategory, styles.categoryCell]}>
              <Text style={styles.categoryName}>{item.categoryName ?? "Uncategorized"}</Text>
              <Text style={styles.typeBadge}>{item.type}</Text>
            </View>
            <Text style={[styles.bodyCell, styles.cellNote]} numberOfLines={2}>
              {item.note.trim() ? item.note : "No note"}
            </Text>
            <View style={[styles.cellAmount, styles.amountCell]}>
              <Text
                style={[
                  styles.amountText,
                  item.type === "EXPENSE" ? styles.amountExpense : styles.amountIncome,
                ]}
              >
                {item.type === "EXPENSE" ? "-" : "+"}
                {formatMoney(item.amount, settings.currencySymbol)}
              </Text>
              <Pressable style={styles.deleteChip} onPress={() => onDelete(item)}>
                <Text style={styles.deleteChipText}>Delete</Text>
              </Pressable>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
