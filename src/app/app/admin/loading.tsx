import { PanelSkeleton } from "@/components/shared/panel-skeleton";

export default function AdminLoading() {
  return <PanelSkeleton rows={6} label="Carregando admin" />;
}
