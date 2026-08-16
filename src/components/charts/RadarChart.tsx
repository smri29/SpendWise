import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Polygon, Text as SvgText } from "react-native-svg";

import { SpendWiseTheme } from "@/theme/spendwise";

export type RadarMetric = {
  label: string;
  value: number;
};

type RadarChartProps = {
  metrics: RadarMetric[];
};

function polarToCartesian(center: number, radius: number, angle: number) {
  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

export function RadarChart({ metrics }: RadarChartProps) {
  const size = 300;
  const center = size / 2;
  const levels = 4;
  const radius = 104;

  if (metrics.length < 3) {
    return null;
  }

  const angleStep = (Math.PI * 2) / metrics.length;
  const startAngle = -Math.PI / 2;

  const polygons = Array.from({ length: levels }, (_, index) => {
    const ringRadius = radius * ((index + 1) / levels);
    return metrics
      .map((_, metricIndex) => {
        const point = polarToCartesian(
          center,
          ringRadius,
          startAngle + metricIndex * angleStep,
        );
        return `${point.x},${point.y}`;
      })
      .join(" ");
  });

  const dataPoints = metrics
    .map((metric, metricIndex) => {
      const point = polarToCartesian(
        center,
        radius * Math.max(0, Math.min(10, metric.value)) / 10,
        startAngle + metricIndex * angleStep,
      );
      return `${point.x},${point.y}`;
    })
    .join(" ");

  return (
    <View style={styles.wrapper}>
      <Svg width={size} height={size}>
        {polygons.map((points, index) => (
          <Polygon
            key={`grid-${index}`}
            points={points}
            fill="transparent"
            stroke="rgba(26,35,126,0.16)"
            strokeWidth={1}
          />
        ))}

        {metrics.map((metric, index) => {
          const angle = startAngle + index * angleStep;
          const edge = polarToCartesian(center, radius, angle);
          const label = polarToCartesian(center, radius + 28, angle);

          return (
            <View key={metric.label}>
              <Line
                x1={center}
                y1={center}
                x2={edge.x}
                y2={edge.y}
                stroke="rgba(26,35,126,0.18)"
                strokeWidth={1}
              />
              <SvgText
                x={label.x}
                y={label.y}
                fontSize="11"
                fontWeight="700"
                fill={SpendWiseTheme.colors.textMuted}
                textAnchor="middle"
              >
                {metric.label}
              </SvgText>
            </View>
          );
        })}

        <Polygon
          points={dataPoints}
          fill="rgba(26,35,126,0.18)"
          stroke={SpendWiseTheme.colors.text}
          strokeWidth={2}
        />

        {metrics.map((metric, index) => {
          const point = polarToCartesian(
            center,
            radius * Math.max(0, Math.min(10, metric.value)) / 10,
            startAngle + index * angleStep,
          );

          return (
            <Circle
              key={`point-${metric.label}`}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={SpendWiseTheme.colors.text}
            />
          );
        })}
      </Svg>

      <Text style={styles.scaleLabel}>Scale: 0 to 10</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 14,
    alignItems: "center",
  },
  scaleLabel: {
    marginTop: 8,
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
});
