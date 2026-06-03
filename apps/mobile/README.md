# Chefe da Casa — App mobile (Expo)

App React Native com assinaturas **RevenueCat** + **Google Play Billing**, autenticação **Supabase** e sincronização com a API Next.js.

## Setup

```bash
cd apps/mobile
cp .env.example .env
npm install
npx expo prebuild
npx expo run:android
```

Configure no `.env`:

- `EXPO_PUBLIC_SUPABASE_*` — mesmo projeto do web
- `EXPO_PUBLIC_API_URL` — URL do Next.js (`npm run dev:mobile` no root)
- `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` — chave pública Android no RevenueCat

## Módulo billing

```
src/modules/billing/
  components/   PaywallScreen, PremiumGate, PlanBadge
  hooks/        useSubscription, usePremiumAccess
  services/     revenuecat.ts
```

## Fluxo de compra

1. Login Supabase (`app_user_id` = UUID do usuário)
2. `Purchases.configure({ appUserID })`
3. Compra → `POST /api/v1/billing/mobile/sync`
4. Webhook RevenueCat mantém `profiles.plan` atualizado

Documentação completa: [docs/BILLING-MOBILE.md](../../docs/BILLING-MOBILE.md)
