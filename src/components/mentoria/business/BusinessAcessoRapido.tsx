import { useNavigate } from "react-router-dom";
import {
  Calendar,
  ClipboardCheck,
  Route,
  FileText,
  Package,
  CheckSquare,
  FolderOpen,
} from "lucide-react";
import { useUserPlan } from "@/hooks/useUserPlan";
import { useMentoriaForm } from "@/hooks/useMentoriaForm";
import { cn } from "@/lib/utils";

interface QuickNavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Marca o item como "pendente" — recebe destaque visual (anel + dot). */
  pendingKey?: "diagnostico";
}

const allNavItems: QuickNavItem[] = [
  { title: "Diagnóstico", path: "/mentoria/diagnostico", icon: ClipboardCheck, pendingKey: "diagnostico" },
  { title: "Sessões", path: "/mentoria/sessoes", icon: Calendar },
  { title: "Etapas", path: "/mentoria/etapas-business", icon: Route },
  { title: "Instruções", path: "/mentoria/instrucoes-business", icon: FileText },
  { title: "Entregas", path: "/mentoria/entregas", icon: Package },
  { title: "Tasks", path: "/mentoria/tasks-business", icon: CheckSquare },
  { title: "Documentos", path: "/mentoria/documentos", icon: FolderOpen },
];

const hiddenForSistemas = ["Instruções", "Tasks"];

export function BusinessAcessoRapido() {
  const navigate = useNavigate();
  const { isBusinessSistemas } = useUserPlan();
  const { formulario } = useMentoriaForm();

  const navItems = isBusinessSistemas
    ? allNavItems.filter((item) => !hiddenForSistemas.includes(item.title))
    : allNavItems;

  // Marca "Diagnóstico" como pendente quando o mentorado ainda não finalizou.
  // É o único ponto de entrada pra essa tela no Business, então merece o
  // destaque (caso contrário ela passa batido).
  const diagnosticoPendente = !formulario?.completado;
  const isPendente = (key?: QuickNavItem["pendingKey"]) =>
    key === "diagnostico" && diagnosticoPendente;

  const renderItem = (item: QuickNavItem) => {
    const pendente = isPendente(item.pendingKey);
    return (
      <button
        key={item.title}
        onClick={() => navigate(item.path)}
        className={cn(
          "relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all group flex-1",
          "hover:bg-brand-cream",
          pendente && "ring-1 ring-brand-strong/40 bg-brand-strong/5"
        )}
      >
        {pendente && (
          <span className="absolute top-2 right-2 inline-flex h-2 w-2">
            <span className="absolute inset-0 inline-flex h-full w-full rounded-full bg-brand-strong/60 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-strong" />
          </span>
        )}
        <div
          className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
            pendente
              ? "bg-brand-strong/15 text-brand-strong"
              : "bg-brand-strong/10 text-brand-strong group-hover:bg-brand-strong/15"
          )}
        >
          <item.icon className="h-4 w-4" />
        </div>
        <span
          className={cn(
            "text-xs font-medium transition-colors",
            pendente ? "text-brand-strong" : "text-foreground group-hover:text-brand-strong"
          )}
        >
          {item.title}
        </span>
      </button>
    );
  };

  return (
    <div className="bg-brand-cream-soft rounded-2xl p-4 mt-4 border border-brand-hairline">
      {/* Desktop: linha única */}
      <div className="hidden sm:flex justify-between items-stretch gap-1">
        {navItems.map(renderItem)}
      </div>

      {/* Mobile: 3 colunas x N linhas */}
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        {navItems.map(renderItem)}
      </div>
    </div>
  );
}
