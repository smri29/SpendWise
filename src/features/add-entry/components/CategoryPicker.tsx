import { Pressable, Text, View } from "react-native";

import type { CategoryRow } from "@/db";
import { addEntryStyles as styles } from "@/features/add-entry/styles";

type CategoryPickerProps = {
  categories: CategoryRow[];
  selectedCategoryId: number | null;
  onSelect: (id: number) => void;
};

export function CategoryPicker({
  categories,
  selectedCategoryId,
  onSelect,
}: CategoryPickerProps) {
  return (
    <View style={styles.categoryGrid}>
      {categories.map((item) => {
        const active = item.id === selectedCategoryId;
        return (
          <Pressable
            key={item.id}
            style={[styles.categoryChip, active && styles.categoryChipActive]}
            onPress={() => onSelect(item.id)}
          >
            <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
              {item.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
