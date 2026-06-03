import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/theme/colors";

type PlanBadgeProps = {
  isPremium: boolean;
  isTrial?: boolean;
};

export function PlanBadge({ isPremium, isTrial }: PlanBadgeProps) {
  const label = isTrial ? "Trial Premium" : isPremium ? "Premium" : "Gratuito";

  return (
    <View style={[styles.badge, isPremium ? styles.premium : styles.free]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  free: {
    backgroundColor: colors.surfaceElevated,
  },
  premium: {
    backgroundColor: "rgba(240, 180, 41, 0.2)",
  },
  text: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
});
