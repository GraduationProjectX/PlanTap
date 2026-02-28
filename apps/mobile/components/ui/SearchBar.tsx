import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";
import { Button, SearchField } from "heroui-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
};

export function SearchBar({ value, onChange, placeholder, onFilterPress }: SearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <SearchField value={value} onChange={onChange} className="flex-1">
        <SearchField.Group style={{borderColor:"purple"}}>
          <SearchField.SearchIcon />
          <SearchField.Input
            className="focus:ring-red-500 focus:border-blue-200"
            placeholder={placeholder}
            placeholderColorClassName="text-white/60"
          />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>
      {onFilterPress && (
        <Button feedbackVariant="scale" isIconOnly onPress={onFilterPress} style={styles.filterButton} hitSlop={8}>
          <FontAwesome name="sliders" size={20} color="#FFFFFF" />
        </Button >
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
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
}));
