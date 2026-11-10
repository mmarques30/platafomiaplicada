import { useEffect, useState } from "react";
import { Bell, ChevronDown, Eye, LogOut, RefreshCw, Search, Settings, Smartphone, User, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import logoMarcaCompleta from "@/assets/logo-auth-fundo-escuro.png";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { CommandSearch } from "@/components/shared/CommandSearch";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAvisosAtivosCount } from "@/hooks/useAvisosPublicos";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useAdminViewContext } from "@/contexts/AdminViewContext";
import { cn } from "@/lib/utils";
import { forceFullAppReload } from "@/lib/pwaUpdate";
import { AdminViewSelector } from "@/components/admin/AdminViewSelector";
import { EnvironmentSwitcher } from "@/components/layout/EnvironmentSwitcher";

const ROTULO_SIMULACAO: Record<string, string> = {
  academy: "Academy",
  insider_business: "Insider Business",
  insider_convidado: "Insider Convidado",
};

/**
 * A barra de topo.
 *
 * Duas coisas mudaram, e as duas eram queixa direta.
 *
 * Primeira: existia uma segunda barra. Quando o admin simulava outro
 * plano, um aviso amarelo de largura cheia aparecia acima do cabeçalho e
 * a página inteira descia 24 unidades para caber os dois. Eram dois
 * menus superiores empilhados. Agora o aviso é um chip dentro da própria
 * barra, e a altura do topo é sempre a mesma.
 *
 * Segunda: o topo não navega. Nenhum item daqui repete o que está na
 * barra lateral, porque dois caminhos para o mesmo lugar é o que fazia a
 * navegação parecer redundante. O topo cuida do que é transversal:
 * procurar, avisos, conta, instalar o app. A lateral cuida de onde ir.
 *
 * A busca é a novidade: o `CommandSearch` já existia pronto no projeto e
 * não estava ligado em lugar nenhum. Agora tem um campo visível e
 * atende ao Ctrl+K.
 */
export function TopHeader() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const { profile } = useUserProfile();
  const { viewAs, impersonatedUserName, resetView, isViewingAs } = useAdminViewContext();
  const { data: avisosCount } = useAvisosAtivosCount();
  const temAvisos = !!avisosCount && avisosCount > 0;

  const [buscaAberta, setBuscaAberta] = useState(false);
  const [escondido, setEscondido] = useState(false);
  const [sobreposto, setSobreposto] = useState(false);

  // O topo some ao rolar para baixo e volta ao encostar o mouse nele.
  useEffect(() => {
    const aoRolar = () => setEscondido(window.scrollY > 72);
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);

  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setBuscaAberta(true);
      }
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, []);

  const { canInstall, isInstalled, deviceType, triggerInstall } = usePWAInstall();
  const podeInstalar = !isInstalled && (canInstall || deviceType === "ios");
  const instalarApp = () => {
    if (canInstall) void triggerInstall();
    else navigate("/instalar");
  };

  const sair = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso");
  };

  const iniciais = (() => {
    const nome = profile?.nome_completo;
    if (nome) {
      const partes = nome.trim().split(/\s+/);
      if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
      return nome.slice(0, 2).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() ?? "U";
  })();

  const primeiroNome = profile?.nome_completo?.split(" ")[0] || "Você";

  return (
    <>
      <header
        onMouseEnter={() => setSobreposto(true)}
        onMouseLeave={() => setSobreposto(false)}
        className={cn(
          "fixed left-0 right-0 top-0 z-50 h-14 border-b border-chrome-border bg-chrome/80 text-chrome-foreground backdrop-blur-xl transition-transform duration-300 ease-out",
          escondido && !sobreposto ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <div className="flex h-full items-center gap-3 pl-1.5 pr-3 md:pl-2.5 md:pr-4">
          <SidebarTrigger className="h-9 w-9 shrink-0 rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white" />

          <Link to="/" className="hidden shrink-0 items-center sm:flex" aria-label="Início">
            <img src={logoMarcaCompleta} alt="IAplicada" className="h-6 w-auto md:h-[26px]" />
          </Link>

          {/* Busca: o único campo do topo. Transversal, não é navegação. */}
          <button
            type="button"
            onClick={() => setBuscaAberta(true)}
            className="group ml-1 flex h-9 min-w-0 flex-1 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 text-left text-sm text-white/45 transition-colors hover:border-white/20 hover:bg-white/[0.07] hover:text-white/70 md:max-w-sm"
          >
            <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span className="truncate">Buscar trilhas, prompts, ferramentas</span>
            <kbd className="ml-auto hidden shrink-0 rounded border border-white/15 px-1.5 py-0.5 font-mono text-[10px] text-white/40 md:block">
              Ctrl K
            </kbd>
          </button>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {/* O aviso de simulação, que era uma segunda barra de largura
                cheia, agora cabe aqui dentro. */}
            {isAdmin && isViewingAs && (
              <div className="hidden items-center gap-2 rounded-full border border-status-warning/40 bg-status-warning/15 py-1 pl-3 pr-1 text-xs text-status-warning lg:flex">
                <Eye className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                <span className="max-w-[210px] truncate">
                  {impersonatedUserName} · {ROTULO_SIMULACAO[viewAs ?? ""] ?? "Simulação"}
                </span>
                <button
                  type="button"
                  onClick={resetView}
                  aria-label="Sair da simulação"
                  className="grid h-6 w-6 place-items-center rounded-full transition-colors hover:bg-status-warning/25"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            )}

            {!isAdmin && <EnvironmentSwitcher />}
            {isAdmin && <AdminViewSelector isAdmin={isAdmin} />}

            <TooltipProvider delayDuration={250}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 text-white/65 hover:bg-white/10 hover:text-white"
                  >
                    <Link to="/notificacoes" aria-label="Avisos">
                      <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
                      {temAvisos && (
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-chrome" />
                      )}
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Avisos</TooltipContent>
              </Tooltip>

              {podeInstalar && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-white/65 hover:bg-white/10 hover:text-white"
                      onClick={instalarApp}
                      aria-label="Instalar o app"
                    >
                      <Smartphone className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Instalar o app</TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] pl-1 pr-2.5 text-white transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={profile?.avatar_url || ""} />
                    <AvatarFallback className="bg-primary text-[11px] font-semibold text-primary-foreground">
                      {iniciais}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-[13px] font-medium md:block">{primeiroNome}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-white/45" strokeWidth={2} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-medium">Minha conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/perfil" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/configuracoes" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={forceFullAppReload} className="cursor-pointer">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Atualizar app
                </DropdownMenuItem>
                <DropdownMenuItem onClick={sair} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <CommandSearch open={buscaAberta} onOpenChange={setBuscaAberta} />
    </>
  );
}
