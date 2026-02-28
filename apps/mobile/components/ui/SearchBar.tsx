import { View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { SearchField } from "heroui-native";

import { FilterButton } from "@/components/ui/FilterButton";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  isFilterActive?: boolean;
  withHorizontalPadding?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function SearchBar({
  value,
  onChange,
  placeholder,
  onFilterPress,
  isFilterActive = false,
  withHorizontalPadding = true,
  style,
}: SearchBarProps) {
  return (
    <View
      style={[
        styles.wrapper,
        !withHorizontalPadding && styles.wrapperNoHorizontalPadding,
        style,
      ]}
    >
      <SearchField value={value} onChange={onChange} className="flex-1">
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder={placeholder} placeholderColorClassName="text-white/60" />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>
      {onFilterPress && (
        <FilterButton
          onPress={onFilterPress}
          variant="search"
          iconSize={20}
          isActive={isFilterActive}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  wrapperNoHorizontalPadding: {
    paddingHorizontal: 0,
  },
}));
