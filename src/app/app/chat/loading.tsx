import { PanelSkeleton } from "@/components/shared/panel-skeleton";

export default function ChatLoading() {
  return <PanelSkeleton rows={6} label="Carregando chat..." />;
}
