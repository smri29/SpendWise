import { ScreenFrame } from "@/components/ui/ScreenFrame";
import { AboutSpendWiseCard } from "@/features/feedback/components/AboutSpendWiseCard";
import { FeedbackFormCard } from "@/features/feedback/components/FeedbackFormCard";
import { FeedbackHeroCard } from "@/features/feedback/components/FeedbackHeroCard";
import { useFeedbackForm } from "@/features/feedback/hooks/useFeedbackForm";
import { feedbackStyles as styles } from "@/features/feedback/styles";

export default function FeedbackScreen() {
  const feedbackForm = useFeedbackForm();

  return (
    <ScreenFrame contentContainerStyle={styles.content}>
      <FeedbackHeroCard />

      <FeedbackFormCard
        email={feedbackForm.email}
        message={feedbackForm.message}
        onChangeEmail={feedbackForm.setEmail}
        onChangeMessage={feedbackForm.setMessage}
        onOpenSupportEmail={() => void feedbackForm.openSupportEmail()}
        onSelectRating={feedbackForm.setRating}
        onSubmitFeedback={() => void feedbackForm.submitFeedback()}
        rating={feedbackForm.rating}
        ratingLabel={feedbackForm.ratingInfo.label}
        ratingSummary={feedbackForm.ratingInfo.summary}
        remainingCharacters={feedbackForm.remainingCharacters}
      />

      <AboutSpendWiseCard />
    </ScreenFrame>
  );
}
