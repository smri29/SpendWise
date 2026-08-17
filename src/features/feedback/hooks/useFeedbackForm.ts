import { useMemo, useState } from "react";
import { Alert, Linking } from "react-native";

import { clampNoteLength, normalizeEmailInput } from "@/utils/format";

const ratingCopy = {
  0: {
    label: "Choose a rating",
    summary: "Your feedback goes directly through the phone's email app.",
  },
  1: {
    label: "Needs work",
    summary: "Tell us what blocked you or felt confusing.",
  },
  2: {
    label: "Below expectations",
    summary: "Share the rough edges that need immediate attention.",
  },
  3: {
    label: "Good foundation",
    summary: "Point out what works and what still feels unfinished.",
  },
  4: {
    label: "Strong experience",
    summary: "Let us know what felt useful and reliable.",
  },
  5: {
    label: "Excellent",
    summary: "Tell us what made the experience feel complete.",
  },
} as const;

export function useFeedbackForm() {
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [message, setMessage] = useState("");

  const normalizedEmail = useMemo(() => normalizeEmailInput(email), [email]);
  const ratingInfo = ratingCopy[rating];
  const remainingCharacters = 400 - message.length;

  async function openSupportEmail() {
    const mailto = [
      "mailto:feedback@spendwise.app",
      `?subject=${encodeURIComponent("SpendWise Support Request")}`,
      `&body=${encodeURIComponent(
        `Email: ${normalizedEmail || "Not provided"}\n\nHow can we help?\n`,
      )}`,
    ].join("");

    const canOpen = await Linking.canOpenURL(mailto);
    if (!canOpen) {
      Alert.alert("No email app", "An email app is required to contact SpendWise from this device.");
      return;
    }

    await Linking.openURL(mailto);
  }

  async function submitFeedback() {
    if (!rating) {
      Alert.alert("Select a rating", "Choose a star rating before sending feedback.");
      return;
    }

    const mailto = [
      "mailto:feedback@spendwise.app",
      `?subject=${encodeURIComponent(`SpendWise Feedback (${rating}/5)`)}`,
      `&body=${encodeURIComponent(
        `Email: ${normalizedEmail || "Not provided"}\nRating: ${rating}/5 - ${
          ratingInfo.label
        }\n\nFeedback:\n${message.trim() || "No message provided."}`,
      )}`,
    ].join("");

    const canOpen = await Linking.canOpenURL(mailto);
    if (!canOpen) {
      Alert.alert("No email app", "An email app is required to send feedback from this device.");
      return;
    }

    await Linking.openURL(mailto);
    Alert.alert(
      "Ready to send",
      "Your phone's email app has been opened with the feedback draft.",
    );
  }

  return {
    email,
    message,
    normalizedEmail,
    openSupportEmail,
    rating,
    ratingInfo,
    remainingCharacters,
    setEmail,
    setMessage: (value: string) => setMessage(clampNoteLength(value, 400)),
    setRating,
    submitFeedback,
  };
}
