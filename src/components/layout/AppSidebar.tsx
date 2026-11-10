import { Fragment, useState } from "react";
import { Home, Library, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import * as LucideIcons from "lucide-react";
import { toast } from "sonner";

import { SidebarAdminSection } from "./SidebarAdminSection";
import { BlocoFilhos, ItemFilho, ItemNeto, ItemPai } from "./ItensSidebar";
import { porTamanhoDoNome } from "@/lib/ordenarMenus";
import { useAdminViewContext } from "@/contexts/AdminViewContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { useUserRole } from "@/hooks/useUserRole";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useEffectivePlan } from "@/hooks/useUserPlan";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useMenuConfig } from "@/hooks/useMenuConfig";
import { useEnvironment } from "@/hooks/useEnvironment";
import { useSkillsMembro } from "@/hooks/useSkillsMembro";
import { useProgramaPapel } from "@/hooks/usePrograma";

// Menus que deixaram de existir no sidebar: "Comunicações" (hoje no menu
// superior), "Minhas dúvidas" (removido do produto) e "Comunidade" (a
// conversa acontece no grupo do WhatsApp; o ranking ficou em Meu progresso).
const HIDDEN_MENU_KEYS = ["interacoes", "minhas_duvidas", "calendario", "comunidade"];

// "Materiais" tem bloco próprio, renderizado logo depois de "Aprender". Se a
// chave vier também do menu_config como menu principal, o item sai duplicado.
const MENU_COM_BLOCO_PROPRIO = ["bibliotecas"];

const ROTAS_MATERIAIS = [
  "/biblioteca-prompts",
  "/biblioteca-ferramentas",
  "/ia-copie-use",
  "/metodos-aplicar",
];

const PLANO_ROTULO: Record<string, string> = {
  academy: "Academy",
  business_parceria: "Academy",
  insider_business: "Insider Business",
  insider_convidado: "Insider Convidado",
};

/**
 * A sidebar da plataforma.
 *
 * O que mudou em relação à versão anterior, e por quê:
 *
 * Os menus pais eram linhas de texto cinza empilhadas, sem fundo e sem
 * peso. A tela inteira tinha o mesmo tom, então a navegação parecia o
 * índice de um documento, não o leme do sistema. Agora cada pai é um
 * botão com altura, ícone e setinha, e o grupo da rota atual acende em
 * lime com uma barra na borda esquerda.
 *
 * Os submenus eram indentados, mas nada dizia a quem pertenciam depois
 * do segundo nível. Agora o bloco de filhos tem uma guia vertical, e o
 * terceiro nível vive dentro dela.
 *
 * Os itens vinham na ordem de cadastro, com nome longo no meio de nomes
 * curtos. Agora cada grupo é ordenado do nome mais curto para o mais
 * longo, o que deixa a borda direita em escada.
 *
 * O rodapé era um "Sair" vermelho solto, a coisa mais datada da tela.
 * Agora é um bloco de conta: avatar, nome, plano, e o sair como ícone
 * discreto ao lado — a ação existe, mas parou de ser o elemento de
 * maior contraste da navegação.
 */
export function AppSidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isParceiro, isLoading: roleLoading } = useUserRole();
  const { profile } = useUserProfile();
  const {
    effectivePlan,
    isVisitante,
    isLoading: effectivePlanLoading,
  } = useEffectivePlan(isAdmin, roleLoading, isParceiro);
  const { isViewingAs, resetView, viewAs } = useAdminViewContext();
  const { signOut } = useAuth();
  const { getSidebarMenus, isMenuVisible } = useMenuConfig();
  const { isLider: isSkillsLider, isLoading: skillsMembroLoading } = useSkillsMembro();
  const { currentEnvironment } = useEnvironment();
  const { temPapel: temPapelPrograma } = useProgramaPapel();

  const recolhido = !open;
  const [abertos, setAbertos] = useState<string[]>([]);

  const sair = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso");
    navigate("/auth");
  };

  const icone = (nome: string | null) => {
    if (!nome) return Home;
    const Componente = (LucideIcons as unknown as Record<string, typeof Home>)[nome];
    return Componente || Home;
  };

  // Em modo simulação, o EnvironmentSwitcher fica oculto; então garantimos que
  // o filtro de menus acompanhe o plano simulado.
  const ambienteEfetivo = (() => {
    if (!isViewingAs) {
      if (!currentEnvironment) {
        if (effectivePlan === "insider_business") return "insider_business";
        if (effectivePlan === "insider_convidado") return "insider_convidado";
        if (effectivePlan === "business_parceria" || effectivePlan === "academy") return "academy";
        return null;
      }
      return currentEnvironment;
    }
    switch (viewAs) {
      case "academy":
        return "academy";
      case "insider_business":
        return "insider_business";
      case "insider_convidado":
        return "insider_convidado";
      default:
        return currentEnvironment;
    }
  })();

  const menus = getSidebarMenus(effectivePlan, ambienteEfetivo);
  const ehInsiderBusiness =
    ambienteEfetivo === "insider_business" || effectivePlan === "insider_business";

  const temGrupoMeuProgresso = menus.some((m) => m.menu_key === "meu_progresso" && !m.parent_key);
  const todosOsPais = menus.filter(
    (menu) =>
      !menu.parent_key &&
      !HIDDEN_MENU_KEYS.includes(menu.menu_key) &&
      !MENU_COM_BLOCO_PROPRIO.includes(menu.menu_key) &&
      !menu.menu_key.startsWith("comunidade") &&
      !(menu.menu_key === "evolucao" && temGrupoMeuProgresso),
  );

  const carregando = roleLoading || effectivePlanLoading;
  const pais = !carregando && isVisitante
    ? todosOsPais.filter((menu) => menu.menu_key === "inicio")
    : todosOsPais;

  type MenuLike = { menu_key: string; label: string; url: string | null; icon?: string | null };

  const filhosDe = (chavePai: string): MenuLike[] => {
    if (!carregando && isVisitante) {
      if (chavePai === "inicio") {
        return [{ menu_key: "inicio_central", label: "Explorar", url: "/central", icon: null }];
      }
      return [];
    }
    const CHAVES_BIBLIOTECA = [
      "bibliotecas",
      "biblioteca_ferramentas",
      "biblioteca_prompts",
      "ia_copie_use",
      "metodos_aplicar",
    ];
    const encontrados = menus
      .filter((menu) => menu.parent_key === chavePai)
      .filter((menu) => !HIDDEN_MENU_KEYS.includes(menu.menu_key))
      .filter((menu) => !CHAVES_BIBLIOTECA.includes(menu.menu_key))
      .filter(
        (menu) =>
          !["skills_lider", "skills_painel_lider"].includes(menu.menu_key) ||
          isSkillsLider ||
          (isAdmin && !isViewingAs) ||
          skillsMembroLoading,
      )
      .filter(
        (menu) =>
          !["projeto_skills_performance"].includes(menu.menu_key) ||
          isSkillsLider ||
          (isAdmin && !isViewingAs) ||
          skillsMembroLoading,
      );
    return porTamanhoDoNome(encontrados, (m) => m.label);
  };

  const abrir = (chave: string) =>
    setAbertos((atual) => (atual.includes(chave) ? atual : [...atual, chave]));
  const alternar = (chave: string) =>
    setAbertos((atual) =>
      atual.includes(chave) ? atual.filter((k) => k !== chave) : [...atual, chave],
    );

  const urlDoMenu = (menu: MenuLike) => {
    if (menu.menu_key === "meu_progresso") return "/evolucao";
    if (!menu.url) {
      const filhos = menus.filter((m) => m.parent_key === menu.menu_key);
      if (filhos.length > 0 && filhos[0].url) return filhos[0].url;
    }
    return menu.url || "/";
  };

  // A rota casa com o menu? "/" exige igualdade: com startsWith ele casaria
  // com toda rota do app e o Início ficaria aceso em qualquer tela.
  const rotaCasa = (url: string | null | undefined) => {
    if (!url) return false;
    if (url === "/") return location.pathname === "/";
    return location.pathname === url || location.pathname.startsWith(url + "/");
  };

  // Derivar o grupo aberto da rota, em vez de acumular num efeito, é o que
  // mantém o caminho visível ao voltar para um menu já visitado.
  const grupoDaRota = pais.find((menu) => {
    if (rotaCasa(urlDoMenu(menu))) return true;
    return filhosDe(menu.menu_key).some((filho) => {
      if (rotaCasa(filho.url)) return true;
      return filhosDe(filho.menu_key).some((neto) => rotaCasa(neto.url));
    });
  })?.menu_key;

  const rotaDeMateriais = ROTAS_MATERIAIS.some(rotaCasa);

  const materiais = porTamanhoDoNome(
    [
      { chave: "biblioteca_prompts", rotulo: "Prompts", url: "/biblioteca-prompts" },
      { chave: "biblioteca_ferramentas", rotulo: "Ferramentas", url: "/biblioteca-ferramentas" },
      { chave: "ia_copie_use", rotulo: "Modelos prontos", url: "/ia-copie-use" },
      { chave: "metodos_aplicar", rotulo: "Métodos práticos", url: "/metodos-aplicar" },
    ].filter((item) => isMenuVisible(item.chave)),
    (item) => item.rotulo,
  );

  const nome = profile?.nome_completo?.split(" ")[0] ?? "Você";
  const plano = PLANO_ROTULO[effectivePlan ?? ""] ?? "Plataforma";

  return (
    <Sidebar
      className="border-r border-sidebar-border bg-sidebar pt-14"
    >
      <SidebarContent className="gap-0 pb-2 pt-3">
        <SidebarGroup className="py-0">
          <SidebarGroupContent>
            <nav className="space-y-1 px-2.5">
              {pais.map((menu) => {
                const Icone = icone(menu.icon);
                const filhos = filhosDe(menu.menu_key);
                const url = urlDoMenu(menu);
                const ativo = menu.menu_key === grupoDaRota || rotaCasa(url);
                const aberto = menu.menu_key === grupoDaRota || abertos.includes(menu.menu_key);

                const pai = (
                  <ItemPai
                    rotulo={menu.label}
                    icone={<Icone className="h-[18px] w-[18px]" strokeWidth={1.75} />}
                    para={url}
                    ativo={ativo}
                    expansivel={filhos.length > 0}
                    aberto={aberto}
                    aoAlternar={() => alternar(menu.menu_key)}
                    aoNavegar={() => abrir(menu.menu_key)}
                    recolhido={recolhido}
                    dataTour={
                      menu.menu_key === "aprender"
                        ? "aprender"
                        : menu.menu_key === "meu_progresso"
                          ? "meu-progresso"
                          : undefined
                    }
                  />
                );

                const bloco =
                  filhos.length > 0 && !recolhido ? (
                    <Collapsible open={aberto}>
                      <CollapsibleContent>
                        <BlocoFilhos>
                          {filhos.map((filho) => {
                            const netos = filhosDe(filho.menu_key);
                            const netoAtivo = netos.some((n) => rotaCasa(n.url));
                            const filhoAberto =
                              netoAtivo || abertos.includes(`sub:${filho.menu_key}`);

                            if (netos.length > 0) {
                              return (
                                <Collapsible key={filho.menu_key} open={filhoAberto}>
                                  <ItemFilho
                                    rotulo={filho.label}
                                    para={filho.url || "/"}
                                    ativo={rotaCasa(filho.url)}
                                    expansivel
                                    aberto={filhoAberto}
                                    aoAlternar={() => alternar(`sub:${filho.menu_key}`)}
                                  />
                                  <CollapsibleContent>
                                    <BlocoFilhos>
                                      {netos.map((neto) => (
                                        <ItemNeto
                                          key={neto.menu_key}
                                          rotulo={neto.label}
                                          para={neto.url || "/"}
                                          ativo={rotaCasa(neto.url)}
                                        />
                                      ))}
                                    </BlocoFilhos>
                                  </CollapsibleContent>
                                </Collapsible>
                              );
                            }

                            return (
                              <ItemFilho
                                key={filho.menu_key}
                                rotulo={filho.label}
                                para={filho.url || "/"}
                                ativo={rotaCasa(filho.url)}
                              />
                            );
                          })}
                        </BlocoFilhos>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : null;

                // Materiais vem logo depois de Aprender: é a continuação
                // natural da leitura, do que se estuda para o que se aplica.
                const blocoMateriais =
                  menu.menu_key === "aprender" &&
                  !isVisitante &&
                  isMenuVisible("bibliotecas") &&
                  materiais.length > 0 ? (
                    <Collapsible
                      key="materiais"
                      open={rotaDeMateriais || abertos.includes("materiais")}
                    >
                      <ItemPai
                        rotulo="Materiais"
                        icone={<Library className="h-[18px] w-[18px]" strokeWidth={1.75} />}
                        para={materiais[0].url}
                        ativo={rotaDeMateriais}
                        expansivel
                        aberto={rotaDeMateriais || abertos.includes("materiais")}
                        aoAlternar={() => alternar("materiais")}
                        aoNavegar={() => abrir("materiais")}
                        recolhido={recolhido}
                        dataTour="bibliotecas"
                      />
                      {!recolhido && (
                        <CollapsibleContent>
                          <BlocoFilhos>
                            {materiais.map((item) => (
                              <ItemFilho
                                key={item.chave}
                                rotulo={item.rotulo}
                                para={item.url}
                                ativo={rotaCasa(item.url)}
                              />
                            ))}
                          </BlocoFilhos>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  ) : null;

                return (
                  <Fragment key={menu.menu_key}>
                    <div>{pai}{bloco}</div>
                    {blocoMateriais}
                  </Fragment>
                );
              })}

              {/* IAplicada Indica: quem já tem papel no programa, e o Insider
                  Business, que é a quem o programa é oferecido. */}
              {!isVisitante && (temPapelPrograma || ehInsiderBusiness) && (
                <ItemPai
                  rotulo="Indica"
                  icone={<LucideIcons.Handshake className="h-[18px] w-[18px]" strokeWidth={1.75} />}
                  para="/indica"
                  ativo={rotaCasa("/indica")}
                  recolhido={recolhido}
                />
              )}
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarAdminSection
          isAdmin={isAdmin}
          isViewingAs={isViewingAs}
          resetView={resetView}
          collapsed={recolhido}
        />
      </SidebarContent>

      {/* Bloco de conta. O sair deixou de ser uma linha vermelha gritando no
          pé da navegação e virou um ícone ao lado de quem está logado. */}
      <SidebarFooter className="border-t border-sidebar-border p-2.5">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition-colors",
            !recolhido && "bg-sidebar-accent/60",
          )}
        >
          <UserAvatar name={profile?.nome_completo ?? nome} size="sm" />
          {!recolhido && (
            <>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="truncate text-[13px] font-medium text-sidebar-foreground">{nome}</p>
                <p className="truncate text-[11px] text-muted-foreground">{plano}</p>
              </div>
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={sair}
                      aria-label="Sair da conta"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Sair</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
