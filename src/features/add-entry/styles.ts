import { StyleSheet } from "react-native";

import { SpendWiseTheme } from "@/theme/spendwise";

export const addEntryStyles = StyleSheet.create({
  content: {
    paddingTop: 120,
    paddingBottom: 40,
    gap: 18,
  },
  headerCard: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.64)",
    padding: 20,
    gap: 8,
  },
  pageTitle: {
    color: SpendWiseTheme.colors.text,
    fontSize: 32,
    fontWeight: "800",
  },
  captionText: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 13,
  },
  helperText: {
    color: SpendWiseTheme.colors.text,
    lineHeight: 20,
    fontSize: 14,
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
  previewCard: {
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.50)",
    padding: 18,
    gap: 6,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: SpendWiseTheme.colors.textMuted,
  },
  previewValue: {
    fontSize: 20,
    fontWeight: "800",
    color: SpendWiseTheme.colors.text,
  },
  previewMeta: {
    fontSize: 13,
    lineHeight: 18,
    color: SpendWiseTheme.colors.textMuted,
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
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  resetButton: {
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.56)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: "center",
  },
  resetButtonText: {
    color: SpendWiseTheme.colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  saveButton: {
    minWidth: 164,
    borderRadius: 18,
    backgroundColor: SpendWiseTheme.colors.card,
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
