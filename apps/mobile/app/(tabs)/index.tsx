import { router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PremiumGate, PlanBadge, useSubscription } from "@/modules/billing";
import { useAuth } from "@/providers/AuthProvider";
import { colors } from "@/theme/colors";

export default function HomeTab() {
  const { user, signOut } = useAuth();
  const subscription = useSubscription(user?.id);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Olá, chef!</Text>
        {subscription.statusQuery.isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <PlanBadge
            isPremium={subscription.isPremium}
            isTrial={subscription.isTrial}
          />
        )}
      </View>

      <Text style={styles.meta}>
        Plano Supabase: {subscription.plan}
        {subscription.limits
          ? ` · IA ${subscription.limits.aiGenerationsPerMonth}/mês`
          : ""}
      </Text>

      <Pressable style={styles.card} onPress={() => router.push("/paywall")}>
        <Text style={styles.cardTitle}>
          {subscription.isPremium ? "Gerenciar Premium" : "Upgrade Premium"}
        </Text>
        <Text style={styles.cardBody}>
          Assinatura segura via Google Play e RevenueCat.
        </Text>
      </Pressable>

      <PremiumGate userId={user?.id} title="Gerador de receitas IA">
        <View style={styles.unlocked}>
          <Text style={styles.unlockedTitle}>IA Premium desbloqueada</Text>
          <Text style={styles.unlockedBody}>
            Gere receitas personalizadas sem limite do plano gratuito.
          </Text>
        </View>
      </PremiumGate>

      <Pressable style={styles.logout} onPress={() => signOut()}>
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  meta: {
    color: colors.textMuted,
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  cardBody: {
    color: colors.textMuted,
    fontSize: 14,
  },
  unlocked: {
    backgroundColor: "rgba(62, 207, 142, 0.12)",
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  unlockedTitle: {
    color: colors.success,
    fontWeight: "700",
  },
  unlockedBody: {
    color: colors.text,
    fontSize: 14,
  },
  logout: {
    marginTop: "auto",
    alignItems: "center",
    padding: 12,
  },
  logoutText: {
    color: colors.textMuted,
  },
});
