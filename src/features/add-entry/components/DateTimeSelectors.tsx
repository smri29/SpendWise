import { Pressable, Text, View } from "react-native";

import { addEntryStyles as styles } from "@/features/add-entry/styles";
import { formatClockTime, formatLongDate } from "@/utils/format";

type DateTimeSelectorsProps = {
  selectedDate: Date;
  onPressDate: () => void;
  onPressTime: () => void;
};

export function DateTimeSelectors({
  selectedDate,
  onPressDate,
  onPressTime,
}: DateTimeSelectorsProps) {
  return (
    <View style={styles.datePickerRow}>
      <Pressable style={styles.inlinePicker} onPress={onPressDate}>
        <Text style={styles.inlinePickerLabel}>Date</Text>
        <Text style={styles.inlinePickerValue}>{formatLongDate(selectedDate)}</Text>
      </Pressable>
      <Pressable style={styles.inlinePicker} onPress={onPressTime}>
        <Text style={styles.inlinePickerLabel}>Time</Text>
        <Text style={styles.inlinePickerValue}>{formatClockTime(selectedDate)}</Text>
      </Pressable>
    </View>
  );
}
