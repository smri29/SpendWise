import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Linking, Pressable, Text, TextInput, View } from "react-native";

import { ScreenFrame } from "@/components/ui/ScreenFrame";
import { feedbackStyles as styles } from "@/features/feedback/styles";
import { SpendWiseTheme } from "@/theme/spendwise";
import { clampNoteLength, normalizeEmailInput } from "@/utils/format";

export default function FeedbackScreen() {
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");

  async function handleSendFeedback() {
    if (!rating) {
      Alert.alert("Select a rating", "Choose a star rating before sending feedback.");
      return;
    }

    const mailto = [
      "mailto:feedback@spendwise.app",
      `?subject=${encodeURIComponent(`SpendWise Feedback (${rating}/5)`)}`,
      `&body=${encodeURIComponent(
        `Email: ${normalizeEmailInput(email) || "Not provided"}\nRating: ${rating}/5\n\nFeedback:\n${
          message.trim() || "No message provided."
        }`,
      )}`,
    ].join("");

    const canOpen = await Linking.canOpenURL(mailto);
    if (!canOpen) {
      Alert.alert("No email app", "An email app is required to send feedback from this device.");
      return;
    }

    await Linking.openURL(mailto);
  }

  return (
    <ScreenFrame contentContainerStyle={styles.content}>
      <View style={styles.aboutStrip}>
        <Ionicons
          name="shield-checkmark-outline"
          size={20}
          color={SpendWiseTheme.colors.text}
        />
        <Text style={styles.aboutStripText}>
          No login | No remote APIs | No analytics tracking
        </Text>
      </View>

      <View style={styles.feedbackCard}>
        <Text style={styles.cardTitle}>Feedback Survey</Text>

        <Text style={styles.fieldLabel}>Your email</Text>
        <TextInput
          value={email}
          onChangeText={(value) => setEmail(normalizeEmailInput(value))}
          style={styles.input}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={SpendWiseTheme.colors.textMuted}
        />

        <Text style={styles.fieldLabel}>How would you rate our service overall?</Text>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <Pressable key={value} onPress={() => setRating(value)}>
              <Ionicons
                name={value <= rating ? "star" : "star-outline"}
                size={34}
                color={SpendWiseTheme.colors.text}
              />
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Please share the reason for your rating.</Text>
        <TextInput
          value={message}
          onChangeText={(value) => setMessage(clampNoteLength(value, 400))}
          style={[styles.input, styles.messageInput]}
          placeholder="What worked well? What should change?"
          multiline
          maxLength={400}
          placeholderTextColor={SpendWiseTheme.colors.textMuted}
        />

        <Pressable style={styles.submitButton} onPress={() => void handleSendFeedback()}>
          <Text style={styles.submitText}>Submit Feedback</Text>
        </Pressable>
      </View>

      <View style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>About SpendWise</Text>
        <Text style={styles.aboutText}>
          SpendWise is a 100% offline Android expense tracker built for people who want confidence
          in their spending without giving up privacy.
        </Text>
        <Text style={styles.aboutText}>
          Your categories, transactions, exports, and reminder preferences stay on this device
          unless you explicitly back them up or share a CSV.
        </Text>
      </View>
    </ScreenFrame>
  );
}
