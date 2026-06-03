import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MOBILE_PLAN_FEATURES } from "@/modules/billing/constants";
import { useSubscription } from "@/modules/billing/hooks/use-subscription";
import { PlanBadge } from "@/modules/billing/components/PlanBadge";
import { colors } from "@/theme/colors";

type PaywallScreenProps = {
  userId: string | undefined;
  onClose?: () => void;
};

export function PaywallScreen({ userId, onClose }: PaywallScreenProps) {
  const insets = useSafeAreaInsets();
  const subscription = useSubscription(userId);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    subscription.sync.mutate(undefined, {
      onError: () => undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync once on mount per user
  }, [userId]);

  const handlePurchase = () => {
    setActionError(null);
    subscription.purchase.mutate(undefined, {
      onError: (error) => setActionError(subscription.errorMessage(error)),
    });
  };

  const handleRestore = () => {
    setActionError(null);
    subscription.restore.mutate(undefined, {
      onError: (error) => setActionError(subscription.errorMessage(error)),
      onSuccess: (data) => {
        if (!data.isPremium) {
          setActionError("Nenhuma assinatura ativa encontrada para restaurar.");
        }
      },
    });
  };

  if (subscription.isPremium) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
        <PlanBadge isPremium isTrial={subscription.isTrial} />
        <Text style={styles.headline}>Você já é Premium</Text>
        <Text style={styles.subtitle}>
          Aproveite todos os recursos do Chefe da Casa.
        </Text>
        {onClose && (
          <Pressable style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Voltar</Text>
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.scroll,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <LinearGradient
        colors={["#1f2a38", colors.background]}
        style={styles.hero}
      >
        {onClose && (
          <Pressable onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>Fechar</Text>
          </Pressable>
        )}
        <Text style={styles.eyebrow}>Chefe da Casa Premium</Text>
        <Text style={styles.headline}>Cozinhe com IA sem limites</Text>
        <Text style={styles.subtitle}>
          Teste grátis por 7 dias. Cancele quando quiser na Google Play.
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Incluído no Premium</Text>
        {MOBILE_PLAN_FEATURES.premium.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Text style={styles.check}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.compare}>
        <Text style={styles.compareTitle}>Gratuito vs Premium</Text>
        <Text style={styles.compareLine}>
          Gratuito: {MOBILE_PLAN_FEATURES.free.join(" · ")}
        </Text>
      </View>

      {actionError && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{actionError}</Text>
        </View>
      )}

      <Pressable
        style={[
          styles.primaryButton,
          subscription.isLoading && styles.disabled,
        ]}
        onPress={handlePurchase}
        disabled={subscription.isLoading}
      >
        {subscription.purchase.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Começar teste grátis</Text>
        )}
      </Pressable>

      <Pressable
        style={styles.linkButton}
        onPress={handleRestore}
        disabled={subscription.isLoading}
      >
        <Text style={styles.linkText}>
          {subscription.restore.isPending
            ? "Restaurando..."
            : "Restaurar compras"}
        </Text>
      </Pressable>

      <Text style={styles.legal}>
        A assinatura renova automaticamente. Gerencie ou cancele em Assinaturas
        na Google Play. Ao continuar, você aceita os termos e política de
        privacidade.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 24,
    gap: 12,
  },
  scroll: {
    paddingHorizontal: 20,
    gap: 16,
  },
  hero: {
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  close: {
    alignSelf: "flex-end",
  },
  closeText: {
    color: colors.textMuted,
    fontSize: 14,
  },
  eyebrow: {
    color: colors.premium,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headline: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  featureRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  check: {
    color: colors.success,
    fontWeight: "700",
  },
  featureText: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  compare: {
    gap: 6,
  },
  compareTitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  compareLine: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.textMuted,
    fontSize: 15,
  },
  linkButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  linkText: {
    color: colors.textMuted,
    fontSize: 14,
    textDecorationLine: "underline",
  },
  disabled: {
    opacity: 0.7,
  },
  errorBox: {
    backgroundColor: "rgba(255, 107, 107, 0.12)",
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: colors.error,
    fontSize: 13,
  },
  legal: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    marginTop: 8,
  },
});
