import { BottomSheet, Button, TextArea } from "heroui-native";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { StarRating } from "@/components/events/star-rating";
import { useDirection } from "@/rtl";

type ReviewComposerSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rating: number;
  onRatingChange: (rating: number) => void;
  body: string;
  onBodyChange: (text: string) => void;
  onSubmit: () => void;
  isPending: boolean;
};

export function ReviewComposerSheet({
  isOpen,
  onOpenChange,
  rating,
  onRatingChange,
  body,
  onBodyChange,
  onSubmit,
  isPending,
}: ReviewComposerSheetProps) {
  const { t } = useTranslation();
  const { textAlign } = useDirection();

  return (
    <BottomSheet isOpen={isOpen} onOpenChange={onOpenChange}>
      <BottomSheet.Portal>
        <BottomSheet.Overlay />
        <BottomSheet.Content snapPoints={["50%"]}>
          <BottomSheet.Close />
          <View style={composerStyles.root}>
            <BottomSheet.Title style={composerStyles.title}>
              {t("eventDetail.writeReview")}
            </BottomSheet.Title>

            <View style={composerStyles.ratingRow}>
              <Text style={[composerStyles.ratingLabel, { textAlign }]}>
                {t("eventDetail.yourRating")}
              </Text>
              <StarRating rating={rating} size={28} interactive onRatingChange={onRatingChange} />
            </View>

            <TextArea
              placeholder={t("eventDetail.reviewPlaceholder")}
              value={body}
              onChangeText={onBodyChange}
              style={composerStyles.textArea}
              isBottomSheetAware
            />

            <Button
              feedbackVariant="scale"
              onPress={onSubmit}
              isDisabled={rating === 0 || isPending}
              style={composerStyles.submitButton}
            >
              <Button.Label style={composerStyles.submitLabel}>
                {t("eventDetail.submitReview")}
              </Button.Label>
            </Button>
          </View>
        </BottomSheet.Content>
      </BottomSheet.Portal>
    </BottomSheet>
  );
}

const composerStyles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.font.size.xxl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.text,
  },
  ratingRow: {
    gap: theme.spacing.sm,
  },
  ratingLabel: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
    color: theme.colors.textSecondary,
  },
  textArea: {
    minHeight: 100,
  },
  submitButton: {
    minHeight: 52,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    backgroundColor: theme.colors.primary,
  },
  submitLabel: {
    color: theme.colors.primaryForeground,
    fontSize: theme.font.size.lg,
    fontFamily: theme.font.family.bold,
  },
}));
