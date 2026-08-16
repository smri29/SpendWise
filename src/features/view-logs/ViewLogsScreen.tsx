import { Text, View } from "react-native";

import { ScreenFrame } from "@/components/ui/ScreenFrame";
import { SummaryPill } from "@/components/ui/SummaryPill";
import { FilterPanel } from "@/features/view-logs/components/FilterPanel";
import { LogsList } from "@/features/view-logs/components/LogsList";
import { ViewLogsEmptyState } from "@/features/view-logs/components/ViewLogsEmptyState";
import { ViewLogsHeader } from "@/features/view-logs/components/ViewLogsHeader";
import { useViewLogs } from "@/features/view-logs/hooks/useViewLogs";
import { viewLogsStyles as styles } from "@/features/view-logs/styles";
import { formatMoney } from "@/utils/format";

export default function ViewLogsScreen() {
  const viewLogs = useViewLogs();

  return (
    <ScreenFrame contentContainerStyle={styles.content}>
      <ViewLogsHeader
        isExporting={viewLogs.isExporting}
        onExport={() => void viewLogs.handleExport()}
      />

      <FilterPanel
        typeFilter={viewLogs.typeFilter}
        periodFilter={viewLogs.periodFilter}
        onTypeChange={viewLogs.setTypeFilter}
        onPeriodChange={viewLogs.setPeriodFilter}
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
        Every log is shown in a full-width card so you can scan date, category, note, and amount
        without sideways scrolling.
      </Text>

      {viewLogs.errorMessage ? (
        <Text style={styles.inlineError}>{viewLogs.errorMessage}</Text>
      ) : null}

      {viewLogs.rows.length === 0 ? (
        <ViewLogsEmptyState />
      ) : (
        <LogsList
          rows={viewLogs.rows}
          settings={viewLogs.settings}
          onDelete={(item) => void viewLogs.handleDelete(item)}
        />
      )}
    </ScreenFrame>
  );
}
