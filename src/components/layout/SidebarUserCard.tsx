import { UserAvatar } from "@/components/shared/UserAvatar";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface SidebarUserCardProps {
  nome: string;
  plano: string;
  progresso: number;
  collapsed?: boolean;
}

const planoLabel: Record<string, string> = {
  academy: "Academy",
  business_parceria: "Business",
  business_sistemas: "Sistemas",
  skills: "Skills",
};

export function SidebarUserCard({ nome, plano, progresso, collapsed }: SidebarUserCardProps) {
  if (collapsed) {
    return (
      <div className="flex justify-center py-2">
        <UserAvatar name={nome} size="sm" />
      </div>
    );
  }

  return (
    <div className="px-3 py-3 space-y-2">
      <div className="flex items-center gap-3">
        <UserAvatar name={nome} size="sm" />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-sidebar-foreground truncate">
            {nome.split(" ")[0]}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-brand-strong">
            {planoLabel[plano] ?? plano}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">Progresso da jornada</span>
          <span className="text-[11px] font-medium text-sidebar-foreground">{progresso}%</span>
        </div>
        <ProgressBar value={progresso} height={4} />
      </div>
    </div>
  );
}
