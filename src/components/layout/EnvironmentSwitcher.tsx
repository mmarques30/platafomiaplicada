import { Gift, GraduationCap, Users, Crown, Lock, ChevronDown, Repeat, LucideProps } from "lucide-react";
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
import { useEnvironment, Environment, ENVIRONMENT_CONFIG } from "@/contexts/EnvironmentContext";
import { cn } from "@/lib/utils";

const ICONS: Record<Environment, React.ComponentType<LucideProps>> = {
  gratuito: Gift,
  academy: GraduationCap,
  skills: Users,
  business: Crown,
};

const ALL_ENVIRONMENTS: Environment[] = ["gratuito", "academy", "skills", "business"];

export function EnvironmentSwitcher() {
  const navigate = useNavigate();
  const { 
    currentEnvironment, 
    availableEnvironments, 
    setEnvironment,
    environmentConfig 
  } = useEnvironment();

  if (!currentEnvironment || !environmentConfig) {
    return null;
  }

  const CurrentIcon = ICONS[currentEnvironment];

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
            "bg-white/10 hover:bg-white/15 border border-white/10",
            "text-white font-medium text-sm"
          )}
        >
          <CurrentIcon className="h-4 w-4" style={{ color: environmentConfig.color }} />
          <span className="hidden sm:inline">{environmentConfig.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-white/60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Ambiente atual
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {ALL_ENVIRONMENTS.map((env) => {
          const config = ENVIRONMENT_CONFIG[env];
          const Icon = ICONS[env];
          const isAvailable = availableEnvironments.includes(env);
          const isActive = currentEnvironment === env;

          return (
            <DropdownMenuItem
              key={env}
              onClick={() => handleSelectEnvironment(env)}
              disabled={!isAvailable}
              className={cn(
                "flex items-center gap-3 cursor-pointer",
                isActive && "bg-accent",
                !isAvailable && "opacity-50 cursor-not-allowed"
              )}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${config.color}20` }}
              >
                <Icon
                  className="h-4 w-4"
                  style={{ color: isAvailable ? config.color : undefined }}
                />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm">{config.label}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {config.description}
                </div>
              </div>
              {!isAvailable && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
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
