import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  FileCheck, 
  ClipboardList, 
  MessageCircleQuestion, 
  FileBarChart,
  FolderOpen
} from "lucide-react";

interface QuickNavItem {
  title: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: QuickNavItem[] = [
  { title: "Sessões", path: "/mentoria/sessoes", icon: Calendar },
  { title: "Entregas", path: "/mentoria/entregas", icon: FileCheck },
  { title: "Tasks", path: "/mentoria/tarefas", icon: ClipboardList },
  { title: "Dúvidas", path: "/mentoria/duvidas", icon: MessageCircleQuestion },
  { title: "Reports", path: "/mentoria/reports", icon: FileBarChart },
  { title: "Documentos", path: "/mentoria/documentos", icon: FolderOpen },
];

export function BusinessAcessoRapido() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#0D0D0D] rounded-xl p-4 mt-4 border border-white/10">
      {/* Desktop: 6 colunas lado a lado */}
      <div className="hidden sm:flex justify-between items-center">
        {navItems.map((item) => (
          <button
            key={item.title}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-2 p-3 rounded-lg 
                       hover:bg-white/5 transition-all group flex-1"
          >
            <item.icon className="h-5 w-5 text-white/70 group-hover:text-primary transition-colors" />
            <span className="text-xs text-white/60 group-hover:text-white transition-colors">
              {item.title}
            </span>
          </button>
        ))}
      </div>

      {/* Mobile: 3 colunas x 2 linhas */}
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        {navItems.map((item) => (
          <button
            key={item.title}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-2 p-3 rounded-lg 
                       hover:bg-white/5 transition-all group"
          >
            <item.icon className="h-5 w-5 text-white/70 group-hover:text-primary transition-colors" />
            <span className="text-xs text-white/60 group-hover:text-white transition-colors">
              {item.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
