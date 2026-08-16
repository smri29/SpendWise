import { Text, View } from "react-native";

import { SegmentControl } from "@/components/ui/SegmentControl";
import { viewLogPeriodOptions, viewLogTypeOptions } from "@/features/view-logs/constants";
import { viewLogsStyles as styles } from "@/features/view-logs/styles";
import type { TransactionPeriodFilter, TransactionTypeFilter } from "@/db";

type FilterPanelProps = {
  typeFilter: TransactionTypeFilter;
  periodFilter: TransactionPeriodFilter;
  onTypeChange: (value: TransactionTypeFilter) => void;
  onPeriodChange: (value: TransactionPeriodFilter) => void;
};

export function FilterPanel({
  typeFilter,
  periodFilter,
  onTypeChange,
  onPeriodChange,
}: FilterPanelProps) {
  return (
    <View style={styles.filterPanel}>
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Transaction Type</Text>
        <SegmentControl options={viewLogTypeOptions} value={typeFilter} onChange={onTypeChange} />
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Time Range</Text>
        <SegmentControl
          options={viewLogPeriodOptions}
          value={periodFilter}
          onChange={onPeriodChange}
        />
      </View>
    </View>
  );
}
