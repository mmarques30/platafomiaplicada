import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEnvironmentSafe, ENVIRONMENT_CONFIG } from "@/contexts/EnvironmentContext";
import { cn } from "@/lib/utils";

/**
 * Alternador de ambiente no topo. Só aparece para quem tem mais de um
 * ambiente (ex.: Insider pago, que também tem Academy). Lista apenas os
 * ambientes disponíveis — não existe mais "ambiente bloqueado" nem tela
 * de seleção.
 */
export function EnvironmentSwitcher() {
  const env = useEnvironmentSafe();

  if (!env) return null;

  const { currentEnvironment, availableEnvironments, setEnvironment, environmentConfig } = env;

  if (!currentEnvironment || !environmentConfig || availableEnvironments.length < 2) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-8 px-3 gap-2 rounded-full",
            "bg-white/10 hover:bg-white/15 border border-white/20",
            "text-white hover:text-white font-medium text-sm"
          )}
        >
          <span className="hidden sm:inline">{environmentConfig.label}</span>
          <ChevronDown className="h-3.5 w-3.5 text-white/60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Ambiente atual
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {availableEnvironments.map((option) => {
          const config = ENVIRONMENT_CONFIG[option];
          const isActive = currentEnvironment === option;

          return (
            <DropdownMenuItem
              key={option}
              onClick={() => setEnvironment(option)}
              className={cn("flex items-center gap-2 cursor-pointer", isActive && "bg-accent")}
            >
              <span className="flex-1 font-medium text-sm">{config.label}</span>
              {isActive && <div className="w-2 h-2 rounded-full bg-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
