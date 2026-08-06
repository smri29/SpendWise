import { StyleSheet } from "react-native";

import { SpendWiseTheme } from "@/theme/spendwise";

export const homeStyles = StyleSheet.create({
  content: {
    paddingTop: 148,
    paddingBottom: 36,
    justifyContent: "space-between",
  },
  hero: {
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 46,
    lineHeight: 50,
    fontWeight: "800",
    color: SpendWiseTheme.colors.text,
    letterSpacing: 0.4,
  },
  subtitle: {
    fontSize: 15,
    color: SpendWiseTheme.colors.textMuted,
    fontWeight: "600",
  },
  datetimeBlock: {
    marginTop: 36,
    gap: 22,
  },
  dateText: {
    fontSize: 18,
    color: SpendWiseTheme.colors.text,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#AFBDF2",
  },
  cardsRow: {
    marginTop: 28,
    flexDirection: "row",
    gap: 14,
  },
  statusCard: {
    marginTop: 16,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.62)",
    padding: 18,
    gap: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: SpendWiseTheme.colors.text,
  },
  statusLine: {
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  inlineError: {
    marginTop: 12,
    fontSize: 13,
    color: SpendWiseTheme.colors.expense,
    fontWeight: "700",
  },
  actions: {
    marginTop: 34,
    gap: 18,
  },
  primaryButton: {
    borderRadius: 28,
    backgroundColor: SpendWiseTheme.colors.card,
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1A237E",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  primaryButtonText: {
    fontSize: 22,
    color: SpendWiseTheme.colors.text,
    fontWeight: "700",
  },
  secondaryButton: {
    borderRadius: 28,
    backgroundColor: "#F8F8FB",
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1A237E",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 9 },
    elevation: 5,
  },
  secondaryButtonText: {
    fontSize: 22,
    color: "#111111",
    fontWeight: "600",
  },
  noticeCard: {
    marginTop: 24,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.76)",
    borderWidth: 1,
    borderColor: "#EEE5A2",
    padding: 16,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 19,
    color: SpendWiseTheme.colors.text,
  },
  footerText: {
    marginTop: 18,
    textAlign: "center",
    color: SpendWiseTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
