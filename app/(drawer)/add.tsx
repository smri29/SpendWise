import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { type Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import * as Haptics from "expo-haptics";

import { ScreenFrame } from "@/components/ui/ScreenFrame";
import { SegmentControl } from "@/components/ui/SegmentControl";
import { createTransactionAsync, listCategoriesByTypeAsync, type CategoryRow, type TransactionType } from "@/db";
import {
  clampNoteLength,
  formatClockTime,
  formatLongDate,
  formatNumericInputForAmount,
  parseAmountInput,
} from "@/utils/format";
import { SpendWiseTheme } from "@/theme/spendwise";

const typeOptions: { label: string; value: TransactionType }[] = [
  { label: "Expense", value: "EXPENSE" },
  { label: "Income", value: "INCOME" },
];

export default function AddEntryScreen() {
  const router = useRouter();
  const [entryType, setEntryType] = useState<TransactionType>("EXPENSE");
  const [amountInput, setAmountInput] = useState("");
  const [note, setNote] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const nextCategories = await listCategoriesByTypeAsync(entryType);
      setCategories(nextCategories);
      setSelectedCategoryId((current) => {
        if (current && nextCategories.some((item) => item.id === current)) {
          return current;
        }
        return nextCategories[0]?.id ?? null;
      });
      setErrorMessage(null);
    } catch (error) {
      console.log("Load categories error:", error);
      setErrorMessage("Unable to load categories from local storage.");
    }
  }, [entryType]);

  useFocusEffect(
    useCallback(() => {
      void loadCategories();
    }, [loadCategories]),
  );

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  function handleAmountChange(value: string) {
    setAmountInput(formatNumericInputForAmount(value));
  }

  function handleDateChange(event: DateTimePickerEvent, nextDate?: Date) {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "dismissed" || !nextDate) {
      return;
    }

    setSelectedDate((current) => {
      const updated = new Date(current);
      updated.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
      return updated;
    });
  }

  function handleTimeChange(event: DateTimePickerEvent, nextDate?: Date) {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }

    if (event.type === "dismissed" || !nextDate) {
      return;
    }

    setSelectedDate((current) => {
      const updated = new Date(current);
      updated.setHours(nextDate.getHours(), nextDate.getMinutes(), 0, 0);
      return updated;
    });
  }

  async function handleSave() {
    const parsedAmount = parseAmountInput(amountInput);

    if (parsedAmount === null || parsedAmount < 0.01 || parsedAmount > 999_999_999.99) {
      Alert.alert("Invalid amount", "Enter a value between 0.01 and 999,999,999.99.");
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert("Missing category", "Choose a category before saving.");
      return;
    }

    try {
      setIsSaving(true);
      await createTransactionAsync({
        amount: parsedAmount,
        type: entryType,
        categoryId: selectedCategoryId,
        note: clampNoteLength(note),
        createdAt: selectedDate.getTime(),
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {
        return;
      });
      router.replace("/view" as Href);
    } catch (error) {
      console.log("Save transaction error:", error);
      Alert.alert("Save failed", "The entry could not be saved locally.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScreenFrame contentContainerStyle={styles.content}>
      <View style={styles.dateRow}>
        <Text style={styles.dateText}>Date: {formatLongDate(selectedDate)}</Text>
        <Pressable style={styles.smallButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.smallButtonText}>Change</Text>
        </Pressable>
      </View>

      <Text style={styles.captionText}>Local • Private • Simple Budgeting</Text>

      <SegmentControl options={typeOptions} value={entryType} onChange={setEntryType} />

      <TextInput
        value={selectedCategory?.name ?? ""}
        editable={false}
        placeholder="Category"
        style={styles.fakeInput}
        placeholderTextColor={SpendWiseTheme.colors.textMuted}
      />

      <View style={styles.categoryGrid}>
        {categories.map((item) => {
          const active = item.id === selectedCategoryId;
          return (
            <Pressable
              key={item.id}
              style={[styles.categoryChip, active && styles.categoryChipActive]}
              onPress={() => setSelectedCategoryId(item.id)}
            >
              <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <TextInput
        value={note}
        onChangeText={(value) => setNote(clampNoteLength(value))}
        placeholder="Description eg. Fare, bill, restaurant"
        style={[styles.fakeInput, styles.multilineInput]}
        placeholderTextColor={SpendWiseTheme.colors.textMuted}
        multiline
        maxLength={100}
      />

      <TextInput
        value={amountInput}
        onChangeText={handleAmountChange}
        placeholder="Amount"
        style={styles.fakeInput}
        placeholderTextColor={SpendWiseTheme.colors.textMuted}
        keyboardType="decimal-pad"
      />

      <View style={styles.datePickerRow}>
        <Pressable style={styles.inlinePicker} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.inlinePickerLabel}>Date</Text>
          <Text style={styles.inlinePickerValue}>{formatLongDate(selectedDate)}</Text>
        </Pressable>
        <Pressable style={styles.inlinePicker} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.inlinePickerLabel}>Time</Text>
          <Text style={styles.inlinePickerValue}>{formatClockTime(selectedDate)}</Text>
        </Pressable>
      </View>

      {errorMessage ? <Text style={styles.inlineError}>{errorMessage}</Text> : null}

      <Pressable style={styles.saveButton} onPress={() => void handleSave()} disabled={isSaving}>
        <Text style={styles.saveButtonText}>{isSaving ? "Saving..." : "Save"}</Text>
      </Pressable>

      {showDatePicker ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      ) : null}

      {showTimePicker ? (
        <DateTimePicker
          value={selectedDate}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      ) : null}
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 120,
    paddingBottom: 40,
    gap: 18,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  dateText: {
    flex: 1,
    color: "#4B69A8",
    fontSize: 24,
    fontWeight: "500",
  },
  smallButton: {
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.75)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  smallButtonText: {
    color: SpendWiseTheme.colors.text,
    fontWeight: "700",
  },
  captionText: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
  fakeInput: {
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.74)",
    paddingHorizontal: 22,
    paddingVertical: 24,
    fontSize: 20,
    color: "#111111",
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  multilineInput: {
    minHeight: 132,
    textAlignVertical: "top",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryChip: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.58)",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  categoryChipActive: {
    backgroundColor: SpendWiseTheme.colors.text,
  },
  categoryChipText: {
    color: SpendWiseTheme.colors.text,
    fontWeight: "700",
  },
  categoryChipTextActive: {
    color: "#FFFFFF",
  },
  datePickerRow: {
    flexDirection: "row",
    gap: 12,
  },
  inlinePicker: {
    flex: 1,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.66)",
    padding: 18,
  },
  inlinePickerLabel: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  inlinePickerValue: {
    marginTop: 6,
    color: SpendWiseTheme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  inlineError: {
    color: SpendWiseTheme.colors.expense,
    fontWeight: "700",
    fontSize: 13,
  },
  saveButton: {
    alignSelf: "flex-end",
    minWidth: 164,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.56)",
    paddingHorizontal: 28,
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#111111",
    fontSize: 20,
    fontWeight: "700",
  },
});
