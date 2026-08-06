import { StyleSheet } from "react-native";

import { SpendWiseTheme } from "@/theme/spendwise";

export const settingsStyles = StyleSheet.create({
  content: {
    paddingTop: 116,
    paddingBottom: 36,
    gap: 18,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: SpendWiseTheme.colors.text,
  },
  sectionCard: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.56)",
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: 0.3,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: SpendWiseTheme.colors.text,
  },
  helperText: {
    color: SpendWiseTheme.colors.textMuted,
    lineHeight: 20,
    fontSize: 14,
  },
  storageText: {
    color: SpendWiseTheme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  secondaryButton: {
    borderRadius: 18,
    backgroundColor: "#FFFBE0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: SpendWiseTheme.colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  dangerButton: {
    borderRadius: 18,
    backgroundColor: "#F9D9D9",
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  dangerButtonText: {
    color: SpendWiseTheme.colors.expense,
    fontSize: 16,
    fontWeight: "800",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  toggleCopy: {
    flex: 1,
    gap: 4,
  },
  reminderTimeCard: {
    borderRadius: 18,
    backgroundColor: "rgba(255,253,231,0.78)",
    padding: 16,
  },
  timeValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "800",
    color: SpendWiseTheme.colors.text,
  },
  versionText: {
    marginTop: 8,
    fontSize: 15,
    color: SpendWiseTheme.colors.text,
    fontWeight: "700",
  },
  inlineError: {
    color: SpendWiseTheme.colors.expense,
    fontSize: 13,
    fontWeight: "700",
  },
});
