import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { type CategoryBreakdownItem } from "@/db/types";
import { formatCurrency } from "@/utils/format";
import { SpendWiseTheme } from "@/theme/spendwise";

type DonutChartProps = {
  data: CategoryBreakdownItem[];
};

export function DonutChart({ data }: DonutChartProps) {
  const size = 240;
  const strokeWidth = 36;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.totalAmount, 0);
  const segments = data.map((item, index) => {
    const fraction = total <= 0 ? 0 : item.totalAmount / total;
    const dashOffset =
      -data
        .slice(0, index)
        .reduce((sum, previousItem) => sum + previousItem.totalAmount / total, 0) *
      circumference;

    return {
      item,
      color: SpendWiseTheme.chart[index % SpendWiseTheme.chart.length],
      strokeDasharray: `${fraction * circumference} ${circumference}`,
      strokeDashoffset: dashOffset,
    };
  });

  if (total <= 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyTitle}>No monthly category data yet</Text>
        <Text style={styles.emptyText}>
          Add transactions this month to see a categorical breakdown and exportable trends.
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.wrapper}>
      <View style={styles.chartWrap}>
        <Svg width={size} height={size}>
          {segments.map(({ item, color, strokeDasharray, strokeDashoffset }) => {
            return (
              <Circle
                key={item.categoryName}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                rotation="-90"
                origin={`${size / 2}, ${size / 2}`}
                strokeLinecap="butt"
              />
            );
          })}
        </Svg>

        <View style={styles.centerLabel}>
          <Text style={styles.centerLabelTitle}>This Month</Text>
          <Text style={styles.centerLabelValue}>{formatCurrency(total, "")}</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {data.map((item, index) => (
          <View key={item.categoryName} style={styles.legendRow}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: SpendWiseTheme.chart[index % SpendWiseTheme.chart.length] },
              ]}
            />
            <View style={styles.legendCopy}>
              <Text style={styles.legendName}>{item.categoryName}</Text>
              <Text style={styles.legendMeta}>
                {item.sharePercent.toFixed(0)}% • {formatCurrency(item.totalAmount, item.currencySymbol)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 18,
    gap: 20,
  },
  chartWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    position: "absolute",
    alignItems: "center",
  },
  centerLabelTitle: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  centerLabelValue: {
    marginTop: 6,
    color: SpendWiseTheme.colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  legend: {
    gap: 12,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.66)",
    padding: 14,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  legendCopy: {
    flex: 1,
  },
  legendName: {
    color: SpendWiseTheme.colors.text,
    fontSize: 15,
    fontWeight: "800",
  },
  legendMeta: {
    marginTop: 4,
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 13,
  },
  emptyWrap: {
    marginTop: 18,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.66)",
    padding: 22,
  },
  emptyTitle: {
    color: SpendWiseTheme.colors.text,
    fontWeight: "800",
    fontSize: 18,
  },
  emptyText: {
    marginTop: 8,
    color: SpendWiseTheme.colors.textMuted,
    lineHeight: 20,
  },
});
