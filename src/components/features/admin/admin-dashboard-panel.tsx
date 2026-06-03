"use client";

import {
  Activity,
  BookOpen,
  CreditCard,
  Heart,
  MessageCircle,
  Percent,
  Refrigerator,
  Shield,
  ShoppingCart,
  Sparkles,
  Store,
  Users,
  Zap,
} from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { FadeIn, StaggerItem, StaggerList } from "@/components/shared/motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "@/shared/hooks/api/admin";

export function AdminOverviewPanel() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (error) {
    return (
      <div className="surface-card p-8 text-center text-muted-foreground">
        Você não tem permissão para acessar esta área ou a API admin falhou.
      </div>
    );
  }

  return (
    <>
      {stats?.demo && (
        <FadeIn>
          <div className="surface-card flex items-center gap-3 border-amber-500/30 bg-amber-500/5 p-4">
            <Shield className="size-5 shrink-0 text-amber-600" />
            <p className="text-sm text-muted-foreground">
              Estatísticas parciais. Configure{" "}
              <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> e{" "}
              <code className="text-xs">ADMIN_EMAILS</code> em produção.
            </p>
          </div>
        </FadeIn>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : stats ? (
        <>
          <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatCard
                title="Usuários"
                description="Perfis cadastrados"
                value={stats.users}
                icon={Users}
                accent="primary"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="MRR estimado"
                description="Pro + Família ativos"
                value={`R$ ${stats.mrrEstimateBrl.toFixed(0)}`}
                icon={CreditCard}
                accent="accent"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Assinaturas"
                description="Planos Stripe ativos"
                value={stats.activeSubscriptions}
                icon={Zap}
                accent="amber"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Tokens IA"
                description="Consumo este mês"
                value={stats.aiTokensThisMonth.toLocaleString("pt-BR")}
                icon={Sparkles}
                accent="rose"
              />
            </StaggerItem>
          </StaggerList>

          <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatCard
                title="Receitas"
                description="Total na plataforma"
                value={stats.recipes}
                icon={BookOpen}
                accent="primary"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Despensa"
                description="Itens cadastrados"
                value={stats.pantryItems}
                icon={Refrigerator}
                accent="accent"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Gerações IA"
                description="Completadas"
                value={stats.aiGenerations}
                icon={Sparkles}
                accent="amber"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Chat IA"
                description="Mensagens este mês"
                value={stats.chatMessagesThisMonth}
                icon={MessageCircle}
                accent="rose"
              />
            </StaggerItem>
          </StaggerList>

          <StaggerList className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StaggerItem>
              <StatCard
                title="Ofertas ativas"
                description="Promoções regionais"
                value={stats.regionalOffersActive}
                icon={Percent}
                accent="primary"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Lojas"
                description="Mercados no catálogo"
                value={stats.regionalStoresActive}
                icon={Store}
                accent="accent"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Favoritos"
                description="Ofertas salvas"
                value={stats.offerFavorites}
                icon={Heart}
                accent="amber"
              />
            </StaggerItem>
            <StaggerItem>
              <StatCard
                title="Listas de compras"
                description="Criadas na plataforma"
                value={stats.shoppingLists}
                icon={ShoppingCart}
                accent="rose"
              />
            </StaggerItem>
          </StaggerList>

          <FadeIn delay={0.1}>
            <div className="surface-card p-6">
              <div className="mb-4 flex items-center gap-2">
                <Activity className="size-5 text-primary" />
                <h3 className="font-heading font-medium">
                  Distribuição de planos
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                  FREE: {stats.planBreakdown.FREE}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                  PRO: {stats.planBreakdown.PRO}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1.5 text-sm">
                  FAMÍLIA: {stats.planBreakdown.FAMILY}
                </Badge>
              </div>
            </div>
          </FadeIn>
        </>
      ) : null}
    </>
  );
}

/** @deprecated Use AdminOverviewPanel */
export const AdminDashboardPanel = AdminOverviewPanel;
