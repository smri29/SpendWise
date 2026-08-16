import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { type Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Platform } from "react-native";
import * as Haptics from "expo-haptics";

import {
  createTransactionAsync,
  getSettingsSnapshot,
  listCategoriesByTypeAsync,
  type CategoryRow,
  type SettingsSnapshot,
  type TransactionType,
} from "@/db";
import {
  clampNoteLength,
  formatNumericInputForAmount,
  parseAmountInput,
} from "@/utils/format";

/**
 * Owns the add-entry form state so the route component can stay a lean
 * composition layer and the business rules remain easy to test in isolation.
 */
export function useAddEntryForm() {
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
  const [currencySymbol, setCurrencySymbol] = useState<SettingsSnapshot["currencySymbol"]>("$");

  const loadCategories = useCallback(async () => {
    try {
      const [nextCategories, settings] = await Promise.all([
        listCategoriesByTypeAsync(entryType),
        getSettingsSnapshot(),
      ]);
      setCategories(nextCategories);
      setCurrencySymbol(settings.currencySymbol);
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

  function resetForm() {
    setAmountInput("");
    setNote("");
    setSelectedDate(new Date());
    setSelectedCategoryId(categories[0]?.id ?? null);
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

  return {
    amountInput,
    categories,
    currencySymbol,
    entryType,
    errorMessage,
    isSaving,
    note,
    selectedCategory,
    selectedCategoryId,
    selectedDate,
    showDatePicker,
    showTimePicker,
    handleAmountChange,
    handleDateChange,
    handleSave,
    handleTimeChange,
    resetForm,
    setEntryType,
    setNote,
    setSelectedCategoryId,
    setShowDatePicker,
    setShowTimePicker,
  };
}
