import { useSubscription } from "@/modules/billing/hooks/use-subscription";

type PremiumAccessOptions = {
  userId: string | undefined;
  featureName?: string;
};

export function usePremiumAccess({ userId }: PremiumAccessOptions) {
  const { isPremium, isLoading, isTrial } = useSubscription(userId);

  return {
    isPremium,
    isTrial,
    isLoading,
    canAccess: isPremium,
    requiresPremium: !isPremium && !isLoading,
  };
}
