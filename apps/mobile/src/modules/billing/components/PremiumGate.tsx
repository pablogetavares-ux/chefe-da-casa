import { router } from "expo-router";
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { usePremiumAccess } from "@/modules/billing/hooks/use-premium-access";
import { colors } from "@/theme/colors";

type PremiumGateProps = {
  userId: string | undefined;
  children: ReactNode;
  title?: string;
  description?: string;
};

export function PremiumGate({
  userId,
  children,
  title = "Recurso Premium",
  description = "Desbloqueie receitas ilimitadas, IA avançada e comparador de preços.",
}: PremiumGateProps) {
  const { canAccess, isLoading, requiresPremium } = usePremiumAccess({
    userId,
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (canAccess) {
    return <>{children}</>;
  }

  if (requiresPremium) {
    return (
      <View style={styles.gate}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        <Pressable
          style={styles.button}
          onPress={() => router.push("/paywall")}
        >
          <Text style={styles.buttonText}>Ver planos Premium</Text>
        </Pressable>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  centered: {
    padding: 24,
    alignItems: "center",
  },
  gate: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginTop: 4,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
