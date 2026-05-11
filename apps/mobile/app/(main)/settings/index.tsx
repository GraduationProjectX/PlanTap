import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useClerk } from "@clerk/clerk-expo";
import { useMutation, useQuery } from "convex/react";
import type { Doc } from "backend/convex/_generated/dataModel";
import { api } from "backend/convex/_generated/api";
import Constants from "expo-constants";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { Surface } from "heroui-native";
import { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getCategoryIconName } from "@/features/categories/meta";
import { useCategories } from "@/hooks/use-categories";
import { useMountEffect } from "@/hooks/use-mount-effect";
import { configureRTL, useDirection } from "@/rtl";
import { useUIStore, type AppThemeMode } from "@/stores/ui-store";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

type UserDoc = Doc<"users">;
type LanguageOption = "en" | "ar";

function resolveSupportedLocale(locale: string | null | undefined): LanguageOption | null {
  if (locale === "en" || locale === "ar") {
    return locale;
  }

  return null;
}

type SettingRowProps = {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  title: string;
  description: string;
  rightContent: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
};

function SettingRow({
  icon,
  title,
  description,
  rightContent,
  onPress,
  showChevron,
}: SettingRowProps) {
  const { theme } = useUnistyles();
  const { flexDirection, textAlign } = useDirection();

  const content = (
    <Surface style={styles.settingRow}>
      <View style={[styles.settingRowInner, { flexDirection }]}>
        <View style={styles.settingIconWrapper}>
          <FontAwesome name={icon} size={18} color={theme.colors.text} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { textAlign }]}>{title}</Text>
          <Text style={[styles.settingDescription, { textAlign }]}>{description}</Text>
        </View>
        <View style={[styles.settingRightContent, { flexDirection }]}>
          {rightContent}
          {showChevron && (
            <FontAwesome name="chevron-right" size={12} color={theme.colors.textMuted} />
          )}
        </View>
      </View>
    </Surface>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
}

type SegmentedControlProps<Value extends string> = {
  options: { value: Value; label: string }[];
  selectedValue: Value;
  onValueChange: (value: Value) => void;
};

function SegmentedControl<Value extends string>({
  options,
  selectedValue,
  onValueChange,
}: SegmentedControlProps<Value>) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.segmentedControl}>
      {options.map((option) => {
        const isSelected = option.value === selectedValue;
        return (
          <Pressable
            key={option.value}
            onPress={() => onValueChange(option.value)}
            style={[styles.segmentedOption, isSelected && styles.segmentedOptionSelected]}
          >
            <Text
              style={[
                styles.segmentedOptionText,
                { color: isSelected ? theme.colors.primaryForeground : theme.colors.textSecondary },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type SectionHeaderProps = {
  number: number;
  title: string;
};

function SectionHeader({ number, title }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>
        {number}. {title}
      </Text>
    </View>
  );
}

type ToggleSwitchProps = {
  isEnabled: boolean;
  onToggle: (value: boolean) => void;
};

function ToggleSwitch({ isEnabled, onToggle }: ToggleSwitchProps) {
  const { theme } = useUnistyles();

  return (
    <Pressable
      onPress={() => onToggle(!isEnabled)}
      style={[
        styles.toggleSwitch,
        { backgroundColor: isEnabled ? theme.colors.text : theme.colors.border },
      ]}
    >
      <View
        style={[
          styles.toggleKnob,
          {
            backgroundColor: isEnabled ? theme.colors.background : theme.colors.surface,
            transform: [{ translateX: isEnabled ? 16 : 0 }],
          },
        ]}
      />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const currentUser = useQuery(api.users.current, {});

  if (currentUser === undefined) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("common.error")}</Text>
      </View>
    );
  }

  return <SettingsContent key={currentUser._id} currentUser={currentUser} />;
}

function SettingsContent({ currentUser }: { currentUser: UserDoc }) {
  const { t, i18n } = useTranslation();
  const { theme } = useUnistyles();
  const { flexDirection, textAlign } = useDirection();
  const { signOut } = useClerk();
  const insets = useSafeAreaInsets();
  const updateSettings = useMutation(api.users.updateSettings);
  const { categories } = useCategories();

  const languageOverride = useUIStore((state) => state.languageOverride);
  const setLanguageOverride = useUIStore((state) => state.setLanguageOverride);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const activeLanguage: LanguageOption = i18n.language === "en" ? "en" : "ar";

  const userLikedTags = currentUser.preferences?.likedTags ?? [];
  const userDislikedTags = currentUser.preferences?.dislikedTags ?? [];
  const userNotificationsEnabled = currentUser.notificationsEnabled ?? false;
  const userLocale = resolveSupportedLocale(currentUser.locale);
  const [likedTags, setLikedTags] = useState(userLikedTags);
  const [dislikedTags, setDislikedTags] = useState(userDislikedTags);
  const [notificationsEnabled, setNotificationsEnabled] = useState(userNotificationsEnabled);
  const [locationEnabled, setLocationEnabled] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>(
    languageOverride ?? userLocale ?? activeLanguage,
  );

  const themeMode = useUIStore((state) => state.themeMode);
  const setThemeMode = useUIStore((state) => state.setThemeMode);

  useMountEffect(() => {
    let isMounted = true;

    const syncPermissions = async () => {
      const notificationPermission = await Notifications.getPermissionsAsync();
      const locationPermission = await Location.getForegroundPermissionsAsync();

      if (!isMounted) {
        return;
      }

      if (!notificationPermission.granted) {
        setNotificationsEnabled(false);
      }

      setLocationEnabled(locationPermission.status === "granted");
    };

    void syncPermissions();

    return () => {
      isMounted = false;
    };
  });

  const categoryOptions = categories.map((category) => ({
    key: category.key,
    label: i18n.language === "ar" ? category.labelAr : category.label,
    iconName: getCategoryIconName(category.key, category.icon),
  }));
  const availableTagKeys = new Set(categoryOptions.map((category) => category.key));

  const showSaveError = () => {
    Alert.alert(t("settings.alerts.saveErrorTitle"), t("settings.alerts.saveErrorDescription"));
  };

  const saveLocale = async (locale: LanguageOption) => {
    try {
      await updateSettings({ locale });
    } catch (error) {
      console.error("Failed to save locale", error);
      showSaveError();
    }
  };

  const saveNotifications = async (nextEnabled: boolean) => {
    try {
      await updateSettings({ notificationsEnabled: nextEnabled });
    } catch (error) {
      console.error("Failed to save notifications", error);
      showSaveError();
    }
  };

  const saveTagPreferences = async (nextLikedTags: string[], nextDislikedTags: string[]) => {
    try {
      await updateSettings({
        preferences: {
          likedTags: nextLikedTags.filter((tag) => availableTagKeys.has(tag)),
          dislikedTags: nextDislikedTags.filter((tag) => availableTagKeys.has(tag)),
        },
      });
    } catch (error) {
      console.error("Failed to save content filters", error);
      showSaveError();
    }
  };

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error("Sign out failed", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const openSystemSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      console.error("Failed to open system settings", error);
    }
  };

  const handleLanguageChange = async (nextLanguage: LanguageOption) => {
    if (nextLanguage === selectedLanguage) {
      return;
    }

    setSelectedLanguage(nextLanguage);
    setLanguageOverride(nextLanguage);

    try {
      await i18n.changeLanguage(nextLanguage);
    } catch (error) {
      console.error("Failed to apply language", error);
    }

    if (configureRTL(nextLanguage)) {
      Alert.alert(t("settings.alerts.restartTitle"), t("settings.alerts.restartDescription"));
    }

    void saveLocale(nextLanguage);
  };

  const handleThemeModeChange = (nextThemeMode: AppThemeMode) => {
    setThemeMode(nextThemeMode);
  };

  const handleNotificationsToggle = async (nextEnabled: boolean) => {
    if (!nextEnabled) {
      setNotificationsEnabled(false);
      void saveNotifications(false);
      return;
    }

    try {
      const currentPermission = await Notifications.getPermissionsAsync();
      if (currentPermission.granted) {
        setNotificationsEnabled(true);
        void saveNotifications(true);
        return;
      }

      const requestedPermission = await Notifications.requestPermissionsAsync();
      if (requestedPermission.granted) {
        setNotificationsEnabled(true);
        void saveNotifications(true);
        return;
      }

      setNotificationsEnabled(false);
      Alert.alert(
        t("settings.notifications.permissionDeniedTitle"),
        t("settings.notifications.permissionDeniedDescription"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("settings.actions.openSettings"),
            onPress: () => {
              void openSystemSettings();
            },
          },
        ],
      );
    } catch (error) {
      console.error("Failed to update notifications permission", error);
    }
  };

  const handleLocationToggle = async (nextEnabled: boolean) => {
    if (!nextEnabled) {
      if (!locationEnabled) {
        return;
      }

      Alert.alert(
        t("settings.location.disableHintTitle"),
        t("settings.location.disableHintDescription"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("settings.actions.openSettings"),
            onPress: () => {
              void openSystemSettings();
            },
          },
        ],
      );
      return;
    }

    try {
      const currentPermission = await Location.getForegroundPermissionsAsync();
      if (currentPermission.status === "granted") {
        setLocationEnabled(true);
        return;
      }

      const requestedPermission = await Location.requestForegroundPermissionsAsync();
      if (requestedPermission.status === "granted") {
        setLocationEnabled(true);
        return;
      }

      setLocationEnabled(false);
      Alert.alert(
        t("settings.location.permissionDeniedTitle"),
        t("settings.location.permissionDeniedDescription"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("settings.actions.openSettings"),
            onPress: () => {
              void openSystemSettings();
            },
          },
        ],
      );
    } catch (error) {
      console.error("Failed to update location permission", error);
    }
  };

  const handleCycleTagPreference = (tagKey: string) => {
    const isLiked = likedTags.includes(tagKey);
    const isDisliked = dislikedTags.includes(tagKey);

    let nextLikedTags = likedTags.filter((tag) => tag !== tagKey);
    let nextDislikedTags = dislikedTags.filter((tag) => tag !== tagKey);

    if (!isLiked && !isDisliked) {
      nextLikedTags = [...nextLikedTags, tagKey];
    } else if (isLiked) {
      nextDislikedTags = [...nextDislikedTags, tagKey];
    }

    setLikedTags(nextLikedTags);
    setDislikedTags(nextDislikedTags);
    void saveTagPreferences(nextLikedTags, nextDislikedTags);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {router.canGoBack() ? (
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          >
            <FontAwesome name="chevron-left" size={20} color={theme.colors.headerForeground} />
          </Pressable>
        ) : (
          <View style={styles.headerSpacer} />
        )}
        <Text style={styles.headerTitle}>{t("settings.title")}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <SectionHeader number={1} title={t("settings.sections.preferences").toUpperCase()} />

        <SettingRow
          icon="adjust"
          title={t("settings.theme.label")}
          description={t("settings.theme.description")}
          rightContent={
            <SegmentedControl
              options={[
                { value: "system", label: t("settings.theme.options.system") },
                { value: "light", label: t("settings.theme.options.light") },
                { value: "dark", label: t("settings.theme.options.dark") },
              ]}
              selectedValue={themeMode}
              onValueChange={handleThemeModeChange}
            />
          }
        />

        <SettingRow
          icon="globe"
          title={t("settings.language.label")}
          description={t("settings.language.description")}
          rightContent={
            <SegmentedControl
              options={[
                { value: "en", label: t("settings.language.options.en") },
                { value: "ar", label: t("settings.language.options.ar") },
              ]}
              selectedValue={selectedLanguage}
              onValueChange={(value) => void handleLanguageChange(value)}
            />
          }
        />

        <SectionHeader number={2} title={t("settings.sections.privacy").toUpperCase()} />

        <SettingRow
          icon="bell"
          title={t("settings.notifications.label")}
          description={t("settings.notifications.description")}
          rightContent={
            <ToggleSwitch
              isEnabled={notificationsEnabled}
              onToggle={(value) => void handleNotificationsToggle(value)}
            />
          }
        />

        <SettingRow
          icon="map-marker"
          title={t("settings.location.label")}
          description={t("settings.location.description")}
          rightContent={
            <ToggleSwitch
              isEnabled={locationEnabled}
              onToggle={(value) => void handleLocationToggle(value)}
            />
          }
        />

        <Surface style={styles.filtersCard}>
          <View style={styles.filtersTrigger}>
            <View style={[styles.filtersHeader, { flexDirection }]}>
              <View style={styles.settingIconWrapper}>
                <FontAwesome name="sliders" size={18} color={theme.colors.text} />
              </View>
              <View style={styles.settingContent}>
                <Text style={[styles.settingTitle, { textAlign }]}>
                  {t("settings.contentFilters.label")}
                </Text>
                <Text style={[styles.settingDescription, { textAlign }]}>
                  {t("settings.contentFilters.description")}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.filtersContent}>
            <View style={styles.filterSection}>
              <View style={[styles.filterSectionHeader, { flexDirection }]}>
                <Text style={[styles.filterSectionTitle, { textAlign }]}>
                  {t("settings.contentFilters.preferences")}
                </Text>
                <View style={[styles.filterCountBadge, { flexDirection }]}>
                  <Text style={styles.filterCountText}>
                    {likedTags.length + dislikedTags.length} {t("settings.contentFilters.selected")}
                  </Text>
                </View>
              </View>
              <View style={styles.chipsContainer}>
                {categoryOptions.map((category) => {
                  const isLiked = likedTags.includes(category.key);
                  const isDisliked = dislikedTags.includes(category.key);
                  const stateIconName = isLiked ? "thumbs-up" : isDisliked ? "thumbs-down" : null;

                  return (
                    <Pressable
                      key={category.key}
                      onPress={() => handleCycleTagPreference(category.key)}
                      style={[
                        styles.tagChip,
                        { flexDirection },
                        isLiked && styles.tagChipLiked,
                        isDisliked && styles.tagChipDisliked,
                      ]}
                    >
                      <FontAwesome
                        name={category.iconName}
                        size={16}
                        color={
                          isLiked
                            ? theme.colors.primaryForeground
                            : isDisliked
                              ? theme.colors.errorForeground
                              : theme.colors.text
                        }
                      />
                      <Text
                        style={[
                          styles.tagLabel,
                          isLiked && styles.tagLabelLiked,
                          isDisliked && styles.tagLabelDisliked,
                        ]}
                      >
                        {category.label}
                      </Text>
                      {stateIconName ? (
                        <FontAwesome
                          name={stateIconName}
                          size={12}
                          color={
                            isLiked ? theme.colors.primaryForeground : theme.colors.errorForeground
                          }
                        />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
              <View style={[styles.filterNote, { flexDirection }]}>
                <FontAwesome name="info-circle" size={14} color={theme.colors.textMuted} />
                <Text style={[styles.filterNoteText, { textAlign }]}>
                  {t("settings.contentFilters.cycleHint")}
                </Text>
              </View>
            </View>
          </View>
        </Surface>

        <SectionHeader number={3} title={t("settings.sections.account").toUpperCase()} />

        <SettingRow
          icon="sign-out"
          title={t("settings.signOut.label")}
          description={t("settings.signOut.description")}
          rightContent={
            <Text style={styles.signOutText}>
              {isSigningOut ? t("settings.actions.signingOut") : t("settings.actions.signOut")}
            </Text>
          }
          showChevron
          onPress={() => void handleSignOut()}
        />

        <View style={styles.footer}>
          <Text style={styles.versionText}>App version {APP_VERSION}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
    color: theme.colors.textSecondary,
  },
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.headerBackground,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
    borderCurve: "continuous",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.headerOverlay,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonPressed: {
    opacity: 0.75,
  },
  headerTitle: {
    fontSize: theme.font.size.xl,
    fontFamily: theme.font.family.bold,
    color: theme.colors.headerForeground,
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  sectionHeader: {
    paddingHorizontal: theme.spacing.xs,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  sectionHeaderText: {
    fontSize: theme.font.size.sm,
    fontFamily: theme.font.family.medium,
    color: theme.colors.textMuted,
    letterSpacing: theme.font.letterSpacing.wider,
  },
  settingRow: {
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingRowInner: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  settingIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  settingContent: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.text,
  },
  settingDescription: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
  },
  settingRightContent: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 2,
  },
  segmentedOption: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
  },
  segmentedOptionSelected: {
    backgroundColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  segmentedOptionText: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.medium,
  },
  toggleSwitch: {
    width: 44,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  filtersCard: {
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
  },
  filtersTrigger: {
    padding: theme.spacing.md,
  },
  filtersHeader: {
    flex: 1,
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  filtersContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  filterSection: {
    gap: theme.spacing.sm,
  },
  filterSectionHeader: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterSectionTitle: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.semiBold,
    color: theme.colors.text,
  },
  filterCountBadge: {
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  filterCountText: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textSecondary,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  tagChip: {
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  tagChipLiked: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  tagChipDisliked: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.error,
  },
  tagLabel: {
    color: theme.colors.text,
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
  },
  tagLabelLiked: {
    color: theme.colors.primaryForeground,
  },
  tagLabelDisliked: {
    color: theme.colors.errorForeground,
  },
  filterNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
  },
  filterNoteText: {
    flex: 1,
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
  signOutText: {
    fontSize: theme.font.size.base,
    fontFamily: theme.font.family.medium,
    color: theme.colors.error,
  },
  footer: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
  },
  versionText: {
    fontSize: theme.font.size.md,
    fontFamily: theme.font.family.regular,
    color: theme.colors.textMuted,
  },
}));
