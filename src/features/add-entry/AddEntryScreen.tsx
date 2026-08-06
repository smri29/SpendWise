import DateTimePicker from "@react-native-community/datetimepicker";
import { Pressable, Text, TextInput, View } from "react-native";

import { ScreenFrame } from "@/components/ui/ScreenFrame";
import { SegmentControl } from "@/components/ui/SegmentControl";
import { addEntryTypeOptions } from "@/features/add-entry/constants";
import { AddEntryHeader } from "@/features/add-entry/components/AddEntryHeader";
import { CategoryPicker } from "@/features/add-entry/components/CategoryPicker";
import { DateTimeSelectors } from "@/features/add-entry/components/DateTimeSelectors";
import { useAddEntryForm } from "@/features/add-entry/hooks/useAddEntryForm";
import { addEntryStyles as styles } from "@/features/add-entry/styles";
import { SpendWiseTheme } from "@/theme/spendwise";
import { clampNoteLength, formatMoney, parseAmountInput } from "@/utils/format";

export default function AddEntryScreen() {
  const form = useAddEntryForm();

  return (
    <ScreenFrame contentContainerStyle={styles.content}>
      <AddEntryHeader />

      <SegmentControl
        options={addEntryTypeOptions}
        value={form.entryType}
        onChange={form.setEntryType}
      />

      <TextInput
        value={form.amountInput}
        onChangeText={form.handleAmountChange}
        placeholder="Amount"
        style={styles.fakeInput}
        placeholderTextColor={SpendWiseTheme.colors.textMuted}
        keyboardType="decimal-pad"
      />

      <View style={styles.previewCard}>
        <Text style={styles.previewLabel}>Selected category</Text>
        <Text style={styles.previewValue}>
          {form.selectedCategory?.name ?? "Choose a category"}
        </Text>
        <Text style={styles.previewMeta}>
          {form.amountInput.trim()
            ? `Preview: ${formatMoney(parseAmountInput(form.amountInput) ?? 0, "$")}`
            : "Enter an amount and choose a category"}
        </Text>
      </View>

      <CategoryPicker
        categories={form.categories}
        selectedCategoryId={form.selectedCategoryId}
        onSelect={form.setSelectedCategoryId}
      />

      <TextInput
        value={form.note}
        onChangeText={(value) => form.setNote(clampNoteLength(value))}
        placeholder="Description eg. Fare, bill, restaurant"
        style={[styles.fakeInput, styles.multilineInput]}
        placeholderTextColor={SpendWiseTheme.colors.textMuted}
        multiline
        maxLength={100}
      />

      <DateTimeSelectors
        selectedDate={form.selectedDate}
        onPressDate={() => form.setShowDatePicker(true)}
        onPressTime={() => form.setShowTimePicker(true)}
      />

      {form.errorMessage ? <Text style={styles.inlineError}>{form.errorMessage}</Text> : null}

      <View style={styles.actionsRow}>
        <Pressable style={styles.resetButton} onPress={form.resetForm}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </Pressable>
        <Pressable
          style={styles.saveButton}
          onPress={() => void form.handleSave()}
          disabled={form.isSaving}
        >
          <Text style={styles.saveButtonText}>{form.isSaving ? "Saving..." : "Save"}</Text>
        </Pressable>
      </View>

      {form.showDatePicker ? (
        <DateTimePicker
          value={form.selectedDate}
          mode="date"
          display="default"
          onChange={form.handleDateChange}
        />
      ) : null}

      {form.showTimePicker ? (
        <DateTimePicker
          value={form.selectedDate}
          mode="time"
          display="default"
          onChange={form.handleTimeChange}
        />
      ) : null}
    </ScreenFrame>
  );
}
