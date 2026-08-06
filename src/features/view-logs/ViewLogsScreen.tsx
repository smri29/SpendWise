import { Text, View } from "react-native";

import { ScreenFrame } from "@/components/ui/ScreenFrame";
import { SegmentControl } from "@/components/ui/SegmentControl";
import { SummaryPill } from "@/components/ui/SummaryPill";
import { viewLogPeriodOptions, viewLogTypeOptions } from "@/features/view-logs/constants";
import { LogsTable } from "@/features/view-logs/components/LogsTable";
import { ViewLogsEmptyState } from "@/features/view-logs/components/ViewLogsEmptyState";
import { ViewLogsHeader } from "@/features/view-logs/components/ViewLogsHeader";
import { useViewLogs } from "@/features/view-logs/hooks/useViewLogs";
import { viewLogsStyles as styles } from "@/features/view-logs/styles";
import { formatMoney } from "@/utils/format";

export default function ViewLogsScreen() {
  const viewLogs = useViewLogs();

  return (
    <ScreenFrame scrollable={false} contentContainerStyle={styles.content}>
      <ViewLogsHeader
        isExporting={viewLogs.isExporting}
        onExport={() => void viewLogs.handleExport()}
      />

      <SegmentControl
        options={viewLogTypeOptions}
        value={viewLogs.typeFilter}
        onChange={viewLogs.setTypeFilter}
      />
      <SegmentControl
        options={viewLogPeriodOptions}
        value={viewLogs.periodFilter}
        onChange={viewLogs.setPeriodFilter}
      />

      <View style={styles.cardsRow}>
        <SummaryPill
          label="Visible Expenses"
          value={formatMoney(viewLogs.totals.expense, viewLogs.settings.currencySymbol)}
          tone="expense"
        />
        <SummaryPill
          label="Visible Income"
          value={formatMoney(viewLogs.totals.income, viewLogs.settings.currencySymbol)}
          tone="income"
        />
      </View>

      <Text style={styles.tableHint}>
        Hold a row or tap Delete to remove it. Scroll sideways to see the full table.
      </Text>

      {viewLogs.errorMessage ? <Text style={styles.inlineError}>{viewLogs.errorMessage}</Text> : null}

      {viewLogs.rows.length === 0 ? (
        <ViewLogsEmptyState />
      ) : (
        <LogsTable
          rows={viewLogs.rows}
          settings={viewLogs.settings}
          onDelete={(item) => void viewLogs.handleDelete(item)}
        />
      )}
    </ScreenFrame>
  );
}
