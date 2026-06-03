import { PanelSkeleton } from "@/components/shared/panel-skeleton";

export default function ProfileLoading() {
  return <PanelSkeleton rows={4} label="Carregando perfil" />;
}
