import type { ReactNode } from "react";
import { Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

import { useDirection } from "@/rtl";

import { StepNumber } from "./StepNumber";

type FilterSectionProps = {
  step: number;
  title: string;
  caption: string;
  children: ReactNode;
};

export function FilterSection({ step, title, caption, children }: FilterSectionProps) {
  const { flexDirection, textAlign } = useDirection();

  return (
    <View style={styles.section}>
      <View style={[styles.sectionHead, { flexDirection }]}> 
        <StepNumber value={step} />
        <View style={styles.sectionHeadBody}>
          <Text style={[styles.sectionTitle, { textAlign }]}>{title}</Text>
          <Text style={[styles.sectionCaption, { textAlign }]}>{caption}</Text>
        </View>
      </View>

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  section: {
    gap: 16,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  sectionHeadBody: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: theme.font.family.bold,
    color: "#000",
  },
  sectionCaption: {
    fontSize: 13,
    fontFamily: theme.font.family.regular,
    color: "#AAAAAA",
  },
  content: {
    marginStart: 44,
  },
}));
