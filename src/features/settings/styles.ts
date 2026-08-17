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
  heroCard: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.70)",
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.46)",
  },
  heroTitle: {
    color: SpendWiseTheme.colors.text,
    fontSize: 30,
    fontWeight: "800",
  },
  heroText: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionCard: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.68)",
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.38)",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: 0.3,
  },
  sectionCaption: {
    color: SpendWiseTheme.colors.textMuted,
    lineHeight: 20,
    fontSize: 14,
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
  metaText: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
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
  stripRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  infoSurface: {
    borderRadius: 20,
    backgroundColor: "rgba(255,253,231,0.84)",
    padding: 16,
    gap: 8,
  },
  infoSurfaceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  infoSurfaceLabel: {
    flex: 1,
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  infoSurfaceValue: {
    color: SpendWiseTheme.colors.text,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },
  toggleCopy: {
    flex: 1,
    gap: 4,
  },
  cloudCard: {
    borderRadius: 22,
    backgroundColor: "rgba(255,253,231,0.88)",
    padding: 16,
    gap: 12,
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  overviewCard: {
    width: "48%",
    minHeight: 124,
    borderRadius: 22,
    backgroundColor: "rgba(255,253,231,0.88)",
    padding: 14,
    gap: 10,
  },
  overviewIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  overviewTitle: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  overviewValue: {
    color: SpendWiseTheme.colors.text,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 22,
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
