import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { Button, RadioGroup } from "heroui-native";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const CITY_IMAGES: Record<string, string> = {
  Riyadh: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=200&h=200&fit=crop",
  Jeddah: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=200&h=200&fit=crop",
  Dammam: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=200&h=200&fit=crop",
  Makkah: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=200&h=200&fit=crop",
  Madinah: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=200&h=200&fit=crop",
};

type CityStepProps = {
  title: string;
  description: string;
  selectLabel: string;
  searchPlaceholder: string;
  selectedCity: string | null;
  cityOptions: string[];
  enableLocationTitle: string;
  enableLocationDescription: string;
  allowLocationLabel: string;
  notNowLabel: string;
  privacyNote: string;
  locatingLabel: string;
  isLocating: boolean;
  onSelectCity: (city: string | null) => void;
  onAllowLocation: () => void;
  onNotNow: () => void;
};

export function CityStep({
  title,
  description,
  selectLabel,
  searchPlaceholder,
  selectedCity,
  cityOptions,
  enableLocationTitle,
  enableLocationDescription,
  allowLocationLabel,
  notNowLabel,
  privacyNote,
  locatingLabel,
  isLocating,
  onSelectCity,
  onAllowLocation,
  onNotNow,
}: CityStepProps) {
  const { theme } = useUnistyles();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCities = cityOptions.filter((city) =>
    city.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const displayedCities = searchQuery.length > 0 ? filteredCities : cityOptions;

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
                    source={{ uri: CITY_IMAGES[city] ?? CITY_IMAGES.Riyadh }}
                    style={styles.cityImage}
                    contentFit="cover"
                  />
                  <Text style={styles.cityName}>{city}</Text>
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
  locationCard: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    alignItems: "center",
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.md,
    width: "100%",
  },
  locationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  locationTextBlock: {
    flex: 1,
    gap: 2,
  },
  locationTitle: {
    color: theme.colors.text,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.semiBold,
  },
  locationDescription: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.regular,
    lineHeight: 18,
  },
  allowButton: {
    width: "100%",
    minHeight: 52,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.overlayDark,
  },
  allowButtonLabel: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.headerForeground,
  },
  notNowText: {
    color: theme.colors.text,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
    paddingVertical: theme.spacing.sm,
  },
  privacyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.xs,
  },
  privacyText: {
    color: theme.colors.textSecondary,
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.regular,
  },
}));
