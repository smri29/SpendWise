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
  insightStrip: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.64)",
    padding: 18,
    gap: 12,
  },
  stripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  stripTitle: {
    color: SpendWiseTheme.colors.text,
    fontSize: 19,
    fontWeight: "800",
  },
  stripBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.84)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  stripBadgeText: {
    color: SpendWiseTheme.colors.text,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  stripText: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  relationBarTrack: {
    height: 14,
    borderRadius: 999,
    backgroundColor: "rgba(26,35,126,0.10)",
    overflow: "hidden",
    flexDirection: "row",
  },
  relationBarIncome: {
    backgroundColor: SpendWiseTheme.colors.income,
  },
  relationBarExpense: {
    backgroundColor: SpendWiseTheme.colors.expense,
  },
  relationLegendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  relationLegendText: {
    color: SpendWiseTheme.colors.text,
    fontSize: 13,
    fontWeight: "700",
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
  chartSubtext: {
    marginTop: 6,
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: SpendWiseTheme.colors.text,
  },
});
