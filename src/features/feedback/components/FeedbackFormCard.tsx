import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";

import { feedbackStyles as styles } from "@/features/feedback/styles";
import { SpendWiseTheme } from "@/theme/spendwise";

type FeedbackFormCardProps = {
  email: string;
  message: string;
  onChangeEmail: (value: string) => void;
  onChangeMessage: (value: string) => void;
  onOpenSupportEmail: () => void;
  onSelectRating: (value: 1 | 2 | 3 | 4 | 5) => void;
  onSubmitFeedback: () => void;
  rating: 0 | 1 | 2 | 3 | 4 | 5;
  ratingLabel: string;
  ratingSummary: string;
  remainingCharacters: number;
};

export function FeedbackFormCard({
  email,
  message,
  onChangeEmail,
  onChangeMessage,
  onOpenSupportEmail,
  onSelectRating,
  onSubmitFeedback,
  rating,
  ratingLabel,
  ratingSummary,
  remainingCharacters,
}: FeedbackFormCardProps) {
  return (
    <View style={styles.formCard}>
      <Text style={styles.cardTitle}>Feedback Survey</Text>
      <Text style={styles.cardCaption}>
        Feedback stays under your control. SpendWise only prepares an email draft through your own
        device mail app.
      </Text>

      <View style={styles.infoPanel}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Delivery</Text>
          <Text style={styles.infoValue}>Direct email draft</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Privacy</Text>
          <Text style={styles.infoValue}>No in-app submission server</Text>
        </View>
      </View>

      <Text style={styles.fieldLabel}>Your email</Text>
      <TextInput
        value={email}
        onChangeText={onChangeEmail}
        style={styles.input}
        placeholder="you@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={SpendWiseTheme.colors.textMuted}
      />

      <Text style={styles.fieldLabel}>How would you rate SpendWise overall?</Text>
      <View style={styles.starRow}>
        {[1, 2, 3, 4, 5].map((value) => {
          const active = value <= rating;
          return (
            <Pressable
              key={value}
              onPress={() => onSelectRating(value as 1 | 2 | 3 | 4 | 5)}
              style={[styles.starButton, active && styles.starButtonActive]}
            >
              <Ionicons
                name={active ? "star" : "star-outline"}
                size={28}
                color={SpendWiseTheme.colors.text}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={styles.ratingSummaryCard}>
        <Text style={styles.ratingTitle}>{ratingLabel}</Text>
        <Text style={styles.ratingText}>{ratingSummary}</Text>
      </View>

      <Text style={styles.fieldLabel}>Tell us what worked and what should change</Text>
      <TextInput
        value={message}
        onChangeText={onChangeMessage}
        style={[styles.input, styles.messageInput]}
        placeholder="Examples: cleaner filters, better spacing, faster entry flow, clearer analytics..."
        multiline
        maxLength={400}
        placeholderTextColor={SpendWiseTheme.colors.textMuted}
      />
      <Text style={styles.metaText}>{remainingCharacters} characters remaining</Text>

      <View style={styles.actionRow}>
        <Pressable style={styles.ghostButton} onPress={onOpenSupportEmail}>
          <Text style={styles.ghostButtonText}>Contact Support</Text>
        </Pressable>
        <Pressable style={styles.submitButton} onPress={onSubmitFeedback}>
          <Text style={styles.submitText}>Submit Feedback</Text>
        </Pressable>
      </View>
    </View>
  );
}
