import { StyleSheet } from "react-native";

import { SpendWiseTheme } from "@/theme/spendwise";

export const addEntryStyles = StyleSheet.create({
  content: {
    paddingTop: 116,
    paddingBottom: 40,
    gap: 16,
  },
  headerCard: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.64)",
    padding: 20,
    gap: 8,
  },
  pageTitle: {
    color: SpendWiseTheme.colors.text,
    fontSize: 30,
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
  sectionCard: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.64)",
    padding: 18,
    gap: 12,
  },
  sectionTitle: {
    color: SpendWiseTheme.colors.text,
    fontSize: 17,
    fontWeight: "800",
  },
  sectionCaption: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  fakeInput: {
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.84)",
    paddingHorizontal: 22,
    paddingVertical: 18,
    fontSize: 18,
    color: "#111111",
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  amountInput: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: 0.3,
    color: SpendWiseTheme.colors.text,
  },
  multilineInput: {
    minHeight: 124,
    textAlignVertical: "top",
  },
  previewCard: {
    borderRadius: 24,
    backgroundColor: "rgba(255,253,231,0.86)",
    padding: 16,
    gap: 8,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: SpendWiseTheme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  previewValue: {
    fontSize: 18,
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
    width: "48%",
    minHeight: 68,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.78)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.32)",
  },
  categoryChipActive: {
    backgroundColor: SpendWiseTheme.colors.text,
    borderColor: SpendWiseTheme.colors.text,
  },
  categoryChipText: {
    color: SpendWiseTheme.colors.text,
    fontWeight: "800",
    fontSize: 15,
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
    borderRadius: 22,
    backgroundColor: "rgba(255,253,231,0.86)",
    padding: 18,
  },
  inlinePickerLabel: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.3,
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
    justifyContent: "space-between",
    gap: 12,
  },
  resetButton: {
    flex: 0.42,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.76)",
    paddingHorizontal: 18,
    paddingVertical: 18,
    alignItems: "center",
  },
  resetButtonText: {
    color: SpendWiseTheme.colors.text,
    fontSize: 17,
    fontWeight: "700",
  },
  saveButton: {
    flex: 0.58,
    borderRadius: 20,
    backgroundColor: SpendWiseTheme.colors.card,
    paddingHorizontal: 24,
    paddingVertical: 18,
    alignItems: "center",
  },
  saveButtonText: {
    color: SpendWiseTheme.colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
});
