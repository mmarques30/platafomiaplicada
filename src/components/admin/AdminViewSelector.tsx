import { useState } from "react";
import { Eye, EyeOff, GraduationCap, Building2, Sparkles } from "lucide-react";
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
import { UserSelectorByPlanModal } from "./UserSelectorByPlanModal";

interface AdminViewSelectorProps {
  isAdmin: boolean;
}

type PlanType = 'academy' | 'business_sistemas' | 'insider_free';

const viewOptions: { mode: AdminViewMode; label: string; icon: React.ReactNode }[] = [
  { mode: "academy", label: "Academy", icon: <GraduationCap className="h-4 w-4" /> },
  { mode: "business_sistemas", label: "Insider Pago", icon: <Building2 className="h-4 w-4" /> },
  { mode: "insider_free", label: "Insider Free", icon: <Sparkles className="h-4 w-4" /> },
];

export function AdminViewSelector({ isAdmin }: AdminViewSelectorProps) {
  const { viewAs, setViewAs, resetView, canUseViewAs, impersonatedUserName } = useAdminView(isAdmin);
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<PlanType | null>(null);

  if (!canUseViewAs) return null;

  const currentView = viewOptions.find((opt) => opt.mode === viewAs);

  const handleOptionClick = (mode: AdminViewMode) => {
    // Toda visão simula um usuário real do plano: abre o seletor
    if (mode) setSelectedPlanForModal(mode as PlanType);
  };

  const handleUserSelect = (userId: string, userName: string) => {
    if (selectedPlanForModal) {
      setViewAs(selectedPlanForModal, userId, userName);
    }
  };

  // Determinar o label do botão
  const getButtonLabel = () => {
    if (!currentView) return "Ver como...";
    if (impersonatedUserName) {
      // Truncar nome se muito longo
      const shortName = impersonatedUserName.split(" ")[0];
      return `${currentView.label}: ${shortName}`;
    }
    return currentView.label;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant={viewAs ? "default" : "outline"} 
            size="sm" 
            className={`h-8 gap-2 ${viewAs ? "bg-status-warning hover:bg-status-warning text-black" : "border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white"}`}
          >
            <Eye className="h-4 w-4" />
            {getButtonLabel()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-background border shadow-lg z-50">
          {viewOptions.map((option) => (
            <DropdownMenuItem
              key={option.mode}
              onClick={() => handleOptionClick(option.mode)}
              className={`gap-2 cursor-pointer ${viewAs === option.mode ? "bg-accent" : ""}`}
            >
              {option.icon}
              {option.label}
              {viewAs === option.mode && impersonatedUserName && (
                <span className="ml-auto text-xs text-muted-foreground">
                  ({impersonatedUserName.split(" ")[0]})
                </span>
              )}
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

      {selectedPlanForModal && (
        <UserSelectorByPlanModal
          open={!!selectedPlanForModal}
          onClose={() => setSelectedPlanForModal(null)}
          onSelect={handleUserSelect}
          planType={selectedPlanForModal}
        />
      )}

    </>
  );
}
