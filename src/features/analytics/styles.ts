import { StyleSheet } from "react-native";

import { SpendWiseTheme } from "@/theme/spendwise";

export const analyticsStyles = StyleSheet.create({
  content: {
    paddingTop: 116,
    paddingBottom: 36,
    gap: 18,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#4B69A8",
  },
  pageSubtitle: {
    marginTop: 4,
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 14,
  },
  exportButton: {
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.80)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  exportText: {
    color: SpendWiseTheme.colors.text,
    fontWeight: "800",
    fontSize: 16,
  },
  cardsRow: {
    flexDirection: "row",
    gap: 14,
  },
  highlightCard: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.72)",
    padding: 16,
    gap: 8,
  },
  highlightLabel: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  highlightValue: {
    color: SpendWiseTheme.colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  highlightMeta: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  inlineError: {
    color: SpendWiseTheme.colors.expense,
    fontWeight: "700",
    fontSize: 13,
  },
  chartCard: {
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.54)",
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: SpendWiseTheme.colors.text,
  },
});
