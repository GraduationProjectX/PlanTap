import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BottomSheet, Button } from "heroui-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, Text, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { StyleSheet } from "react-native-unistyles";

import {
  CALENDAR_THEME,
  buildMarkedDates,
  formatRange,
  toLocalDateString,
} from "@/lib/filters-screen-utils";
import type { FilterDate } from "@/lib/event-filters";
import { useDirection } from "@/rtl";

import { FilterPill } from "./FilterPill";
import { FilterSection } from "./FilterSection";

type FiltersDateSectionProps = {
  activeDate: FilterDate;
  startDate?: string;
  endDate?: string;
  onToggleDate: (date: FilterDate) => void;
  onConfirmSpecificDates: (startDate: string, endDate: string) => void;
};

export function FiltersDateSection({
  activeDate,
  startDate,
  endDate,
  onToggleDate,
  onConfirmSpecificDates,
}: FiltersDateSectionProps) {
  const { t, i18n } = useTranslation();
  const { isRTL, flexDirection } = useDirection();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [rangeStart, setRangeStart] = useState<string | undefined>();
  const [rangeEnd, setRangeEnd] = useState<string | undefined>();

  const todayStr = toLocalDateString(new Date());
  const markedDates = buildMarkedDates(rangeStart, rangeEnd);
  const dateRangeLabel =
    activeDate === "specificDates" && startDate
      ? formatRange(startDate, endDate, i18n.language === "ar" ? "ar-SA" : "en-US")
      : null;

  function handleOpenChange(open: boolean) {
    if (open) {
      setRangeStart(activeDate === "specificDates" ? startDate : undefined);
      setRangeEnd(activeDate === "specificDates" ? endDate : undefined);
    }

    setCalendarOpen(open);
  }

  function handleDayPress(day: DateData) {
    if (!rangeStart || rangeEnd) {
      setRangeStart(day.dateString);
      setRangeEnd(undefined);
      return;
    }

    if (day.dateString <= rangeStart) {
      setRangeStart(day.dateString);
      setRangeEnd(undefined);
      return;
    }

    setRangeEnd(day.dateString);
  }

  function handleConfirmDates() {
    if (!rangeStart) {
      return;
    }

    onConfirmSpecificDates(rangeStart, rangeEnd ?? rangeStart);
    setCalendarOpen(false);
  }

  return (
    <FilterSection step={4} title={t("filters.date")} caption={t("filters.whenFree")}>
      <View style={styles.dateGroup}>
        <View style={styles.chipsRow}>
          {(["today", "thisWeekend"] as const).map((key) => {
            const label = key === "today" ? t("filters.dateToday") : t("filters.dateThisWeekend");

            return (
              <FilterPill
                key={key}
                label={label}
                active={activeDate === key}
                onPress={() => onToggleDate(key)}
                iconName="calendar"
              />
            );
          })}
        </View>

        <BottomSheet isOpen={calendarOpen} onOpenChange={handleOpenChange}>
          <BottomSheet.Trigger asChild>
            <Pressable style={[styles.specificDatesRow, { flexDirection }]}>
              <View style={[styles.specificDatesInner, { flexDirection }]}>
                <FontAwesome name="calendar-o" size={16} color="#000" />
                <Text
                  style={[
                    styles.specificDatesLabel,
                    dateRangeLabel != null && styles.specificDatesLabelActive,
                  ]}
                >
                  {dateRangeLabel ?? t("filters.chooseSpecificDates")}
                </Text>
              </View>

              <FontAwesome
                name={isRTL ? "chevron-left" : "chevron-right"}
                size={14}
                color="#BABABA"
              />
            </Pressable>
          </BottomSheet.Trigger>

          <BottomSheet.Portal>
            <BottomSheet.Overlay />
            <BottomSheet.Content snapPoints={["65%"]}>
              <BottomSheet.Close />
              <BottomSheet.Title style={styles.sheetTitle}>{t("filters.chooseDatesTitle")}</BottomSheet.Title>
              <BottomSheet.Description style={styles.sheetDesc}>
                {t("filters.chooseDatesDesc")}
              </BottomSheet.Description>

              <Calendar
                markingType="period"
                markedDates={markedDates}
                onDayPress={handleDayPress}
                minDate={todayStr}
                enableSwipeMonths
                theme={CALENDAR_THEME}
                style={styles.calendar}
              />

              <View style={styles.sheetActions}>
                <Button
                  variant="primary"
                  size="lg"
                  feedbackVariant="scale"
                  onPress={handleConfirmDates}
                  isDisabled={!rangeStart}
                  style={styles.confirmBtn}
                >
                  {t("filters.confirmDates")}
                </Button>
              </View>
            </BottomSheet.Content>
          </BottomSheet.Portal>
        </BottomSheet>
      </View>
    </FilterSection>
  );
}

const styles = StyleSheet.create((theme) => ({
  dateGroup: {
    gap: 12,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  specificDatesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    borderCurve: "continuous",
    borderWidth: 1.2,
    borderColor: "#E2E2E2",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  specificDatesInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  specificDatesLabel: {
    fontSize: 15,
    fontFamily: theme.font.family.medium,
    color: "#000",
  },
  specificDatesLabelActive: {
    fontFamily: theme.font.family.bold,
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: theme.font.family.bold,
  },
  sheetDesc: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  calendar: {
    borderRadius: 16,
    overflow: "hidden",
  },
  sheetActions: {
    paddingTop: 16,
  },
  confirmBtn: {
    height: 52,
    borderRadius: 999,
    backgroundColor: "#000",
  },
}));
