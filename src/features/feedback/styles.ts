import { StyleSheet } from "react-native";

import { SpendWiseTheme } from "@/theme/spendwise";

export const feedbackStyles = StyleSheet.create({
  content: {
    paddingTop: 116,
    paddingBottom: 36,
    gap: 22,
  },
  aboutStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.72)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aboutStripText: {
    flex: 1,
    color: SpendWiseTheme.colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  feedbackCard: {
    borderRadius: 24,
    backgroundColor: "rgba(230,227,255,0.78)",
    borderWidth: 1,
    borderColor: "#B7B3F3",
    padding: 20,
    gap: 14,
  },
  cardTitle: {
    color: "#2E239C",
    fontSize: 26,
    fontWeight: "800",
  },
  fieldLabel: {
    color: "#2E239C",
    fontSize: 16,
    fontWeight: "700",
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#7B6FD6",
    backgroundColor: "rgba(255,255,255,0.72)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: SpendWiseTheme.colors.text,
    fontSize: 16,
  },
  messageInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  starRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  submitButton: {
    marginTop: 6,
    borderRadius: 18,
    backgroundColor: "#F499DD",
    paddingVertical: 18,
    alignItems: "center",
  },
  submitText: {
    color: "#2E239C",
    fontSize: 18,
    fontWeight: "800",
  },
  aboutCard: {
    borderRadius: 30,
    backgroundColor: "rgba(255,253,231,0.78)",
    padding: 24,
    gap: 14,
  },
  aboutTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: 0.6,
  },
  aboutText: {
    color: SpendWiseTheme.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
