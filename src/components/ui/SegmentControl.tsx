import { Pressable, StyleSheet, Text, View } from "react-native";

import { SpendWiseTheme } from "@/theme/spendwise";

type Option<T extends string | number> = {
  label: string;
  value: T;
};

type SegmentControlProps<T extends string | number> = {
  options: Option<T>[];
  value: T;
  onChange: (nextValue: T) => void;
};

export function SegmentControl<T extends string | number>({
  options,
  value,
  onChange,
}: SegmentControlProps<T>) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  segment: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.55)",
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  segmentActive: {
    backgroundColor: SpendWiseTheme.colors.text,
  },
  label: {
    color: SpendWiseTheme.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  labelActive: {
    color: "#FFFFFF",
  },
});
