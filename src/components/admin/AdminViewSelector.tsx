import { Eye, EyeOff, User, GraduationCap, Briefcase, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminView } from "@/hooks/useAdminView";
import { AdminViewMode } from "@/contexts/AdminViewContext";

interface AdminViewSelectorProps {
  isAdmin: boolean;
}

const viewOptions: { mode: AdminViewMode; label: string; icon: React.ReactNode }[] = [
  { mode: "visitante", label: "Visitante (gratuito)", icon: <User className="h-4 w-4" /> },
  { mode: "academy", label: "Academy", icon: <GraduationCap className="h-4 w-4" /> },
  { mode: "skills", label: "Skills", icon: <Briefcase className="h-4 w-4" /> },
  { mode: "business", label: "Business", icon: <Building2 className="h-4 w-4" /> },
];

export function AdminViewSelector({ isAdmin }: AdminViewSelectorProps) {
  const { viewAs, setViewAs, resetView, canUseViewAs } = useAdminView(isAdmin);

  if (!canUseViewAs) return null;

  const currentView = viewOptions.find((opt) => opt.mode === viewAs);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={viewAs ? "default" : "outline"} 
          size="sm" 
          className={`h-8 gap-2 ${viewAs ? "bg-yellow-500 hover:bg-yellow-600 text-black" : ""}`}
        >
          <Eye className="h-4 w-4" />
          {currentView ? `${currentView.label}` : "Ver como..."}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background border shadow-lg z-50">
        {viewOptions.map((option) => (
          <DropdownMenuItem
            key={option.mode}
            onClick={() => setViewAs(option.mode)}
            className={`gap-2 cursor-pointer ${viewAs === option.mode ? "bg-accent" : ""}`}
          >
            {option.icon}
            {option.label}
          </DropdownMenuItem>
        ))}
        {viewAs && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={resetView} className="gap-2 cursor-pointer text-muted-foreground">
              <EyeOff className="h-4 w-4" />
              Voltar para Admin
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
