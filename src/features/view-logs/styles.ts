import { StyleSheet } from "react-native";

import { SpendWiseTheme } from "@/theme/spendwise";

export const viewLogsStyles = StyleSheet.create({
  content: {
    paddingTop: 118,
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
  tableScrollContent: {
    paddingBottom: 20,
  },
  table: {
    width: 760,
    borderWidth: 2,
    borderColor: "#171717",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  tableHeader: {
    backgroundColor: "rgba(255,255,255,0.22)",
  },
  tableRow: {
    minHeight: 92,
    flexDirection: "row",
    borderBottomWidth: 2,
    borderColor: "#171717",
  },
  headerCell: {
    fontSize: 17,
    fontWeight: "800",
    color: "#000000",
    padding: 16,
  },
  bodyCell: {
    fontSize: 14,
    color: "#1C1C1C",
    padding: 14,
  },
  cellDate: {
    width: 150,
    borderRightWidth: 2,
    borderColor: "#171717",
  },
  cellCategory: {
    width: 170,
    borderRightWidth: 2,
    borderColor: "#171717",
  },
  cellNote: {
    width: 260,
    borderRightWidth: 2,
    borderColor: "#171717",
  },
  cellAmount: {
    width: 180,
  },
  categoryCell: {
    padding: 14,
    justifyContent: "space-between",
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "800",
    color: SpendWiseTheme.colors.text,
  },
  typeBadge: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(26,35,126,0.10)",
    color: SpendWiseTheme.colors.text,
    fontSize: 11,
    fontWeight: "800",
  },
  amountCell: {
    padding: 14,
    justifyContent: "space-between",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "800",
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
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteChipText: {
    color: SpendWiseTheme.colors.expense,
    fontSize: 12,
    fontWeight: "800",
  },
});
