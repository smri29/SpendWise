import { StyleSheet } from "react-native";

import { SpendWiseTheme } from "@/theme/spendwise";

export const viewLogsStyles = StyleSheet.create({
  content: {
    paddingTop: 118,
    paddingBottom: 36,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  pageTitle: {
    fontSize: 34,
    color: SpendWiseTheme.colors.text,
    fontWeight: "800",
  },
  pageSubtitle: {
    marginTop: 4,
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 14,
  },
  exportButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.78)",
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
  filterPanel: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.64)",
    padding: 18,
    gap: 16,
  },
  filterSection: {
    gap: 10,
  },
  filterLabel: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  tableHint: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  inlineError: {
    color: SpendWiseTheme.colors.expense,
    fontWeight: "700",
    fontSize: 13,
  },
  emptyState: {
    marginTop: 18,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.76)",
    padding: 24,
    borderWidth: 1,
    borderColor: "#F0E8A6",
  },
  emptyTitle: {
    color: SpendWiseTheme.colors.text,
    fontWeight: "800",
    fontSize: 20,
  },
  emptyText: {
    marginTop: 8,
    color: SpendWiseTheme.colors.textMuted,
    lineHeight: 20,
  },
  logsList: {
    gap: 14,
    paddingBottom: 6,
  },
  logCard: {
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.76)",
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(238,229,162,0.95)",
  },
  logCardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  logMainBlock: {
    flex: 1,
    gap: 6,
  },
  logCategory: {
    color: SpendWiseTheme.colors.text,
    fontSize: 23,
    fontWeight: "800",
  },
  logDate: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  logAmountBlock: {
    alignItems: "flex-end",
    gap: 8,
  },
  logAmount: {
    fontSize: 20,
    fontWeight: "900",
  },
  logTypeBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
  },
  expenseBadge: {
    backgroundColor: "rgba(198,40,40,0.10)",
    color: SpendWiseTheme.colors.expense,
  },
  incomeBadge: {
    backgroundColor: "rgba(46,125,50,0.10)",
    color: SpendWiseTheme.colors.income,
  },
  logMetaGrid: {
    gap: 10,
  },
  logMetaItem: {
    borderRadius: 18,
    backgroundColor: "rgba(255,253,231,0.88)",
    padding: 14,
    gap: 6,
  },
  logMetaLabel: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  logMetaValue: {
    color: SpendWiseTheme.colors.text,
    fontSize: 15,
    lineHeight: 21,
  },
  logActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  logActionHint: {
    flex: 1,
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  amountExpense: {
    color: SpendWiseTheme.colors.expense,
  },
  amountIncome: {
    color: SpendWiseTheme.colors.income,
  },
  deleteChip: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  deleteChipText: {
    color: SpendWiseTheme.colors.expense,
    fontSize: 13,
    fontWeight: "800",
  },
});
