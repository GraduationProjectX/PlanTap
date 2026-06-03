import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { RadioGroup } from "heroui-native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, TextInput, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { getCityDisplayLabel } from "@/features/filters/utils";
import { getCityImage } from "@/features/location/cities";

type CityStepProps = {
  title: string;
  description: string;
  selectLabel: string;
  searchPlaceholder: string;
  selectedCity: string | null;
  cityOptions: string[];
  onSelectCity: (city: string | null) => void;
};

export default function CityStep({
  title,
  description,
  selectLabel,
  searchPlaceholder,
  selectedCity,
  cityOptions,
  onSelectCity,
}: CityStepProps) {
  const { theme } = useUnistyles();
  const { i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const isArabic = i18n.language === "ar";
  const query = searchQuery.trim().toLowerCase();

  const displayedCities = cityOptions.filter((city) => {
    if (query.length === 0) {
      return true;
    }

    const localizedCity = getCityDisplayLabel(city, isArabic).toLowerCase();
    return city.toLowerCase().includes(query) || localizedCity.includes(query);
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      <View style={styles.selectSection}>
        <Text style={styles.sectionLabel}>{selectLabel}</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      <View style={styles.citiesSection}>
        <RadioGroup
          value={selectedCity ?? ""}
          onValueChange={(value) => onSelectCity(value || null)}
        >
          {displayedCities.map((city) => (
            <RadioGroup.Item key={city} value={city}>
              {({ isSelected }) => (
                <View style={styles.cityRow}>
                  <Image
                    source={{ uri: getCityImage(city) }}
                    style={styles.cityImage}
                    contentFit="cover"
                  />
                  <Text style={styles.cityName}>{getCityDisplayLabel(city, isArabic)}</Text>
                  <View
                    style={[styles.radioIndicator, isSelected && styles.radioIndicatorSelected]}
                  >
                    {isSelected && (
                      <Animated.View entering={FadeIn.duration(150)}>
                        <Ionicons name="checkmark" size={16} color={theme.colors.text} />
                      </Animated.View>
                    )}
                  </View>
                </View>
              )}
            </RadioGroup.Item>
          ))}
        </RadioGroup>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    gap: theme.spacing.lg,
  },
  header: {
    gap: theme.spacing.xs,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontFamily: theme.font.family.bold,
    letterSpacing: -0.5,
  },
  description: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
  },
  selectSection: {
    gap: theme.spacing.sm,
  },
  sectionLabel: {
    color: theme.colors.text,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.semiBold,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    minHeight: 52,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
  },
  citiesSection: {
    gap: theme.spacing.sm,
  },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  cityImage: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    backgroundColor: theme.colors.surface,
  },
  cityName: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.regular,
    marginStart: theme.spacing.md,
  },
  radioIndicator: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioIndicatorSelected: {
    borderColor: "transparent",
  },
}));
