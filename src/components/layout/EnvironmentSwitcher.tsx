import { Lock, ChevronDown, Repeat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEnvironmentSafe, Environment, ENVIRONMENT_CONFIG } from "@/contexts/EnvironmentContext";
import { cn } from "@/lib/utils";

const ALL_ENVIRONMENTS: Environment[] = ["gratuito", "academy", "skills", "business_parceria"];

export function EnvironmentSwitcher() {
  const navigate = useNavigate();
  const env = useEnvironmentSafe();

  if (!env) return null;

  const { 
    currentEnvironment, 
    availableEnvironments, 
    setEnvironment,
    environmentConfig 
  } = env;

  if (!currentEnvironment || !environmentConfig) {
    return null;
  }

  const handleSelectEnvironment = (env: Environment) => {
    if (!availableEnvironments.includes(env)) {
      // Poderia abrir modal de upgrade
      return;
    }
    setEnvironment(env);
  };

  const handleGoToSelector = () => {
    // Limpar ambiente para forçar ir para seleção
    sessionStorage.removeItem("selected_environment");
    navigate("/selecionar-ambiente");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-8 px-3 gap-2 rounded-full",
            "bg-foreground/5 hover:bg-foreground/10 border border-brand-hairline",
            "text-foreground font-medium text-sm"
          )}
        >
          <span className="hidden sm:inline">{environmentConfig.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Ambiente atual
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {ALL_ENVIRONMENTS.map((env) => {
          const config = ENVIRONMENT_CONFIG[env];
          const isAvailable = availableEnvironments.includes(env);
          const isActive = currentEnvironment === env;

          return (
            <DropdownMenuItem
              key={env}
              onClick={() => handleSelectEnvironment(env)}
              disabled={!isAvailable}
              className={cn(
                "flex items-center gap-2 cursor-pointer",
                isActive && "bg-accent",
                !isAvailable && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="flex-1 font-medium text-sm">{config.label}</span>
              {!isAvailable && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
              {isActive && <div className="w-2 h-2 rounded-full bg-primary" />}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleGoToSelector} className="cursor-pointer">
          <Repeat className="h-4 w-4 mr-2" />
          Voltar para seleção
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
