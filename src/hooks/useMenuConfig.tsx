import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MenuConfig {
  id: string;
  menu_key: string;
  label: string;
  tipo: string;
  url: string | null;
  icon: string | null;
  visivel: boolean;
  editavel: boolean;
  ordem: number;
  parent_key: string | null;
  planos_permitidos: string[] | null;
  created_at: string;
  updated_at: string;
}

export function useMenuConfig() {
  const { data: menuConfig, isLoading, refetch } = useQuery({
    queryKey: ["menu-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_config")
        .select("*")
        .order("ordem");
      
      if (error) throw error;
      return data as MenuConfig[];
    },
    staleTime: 1000 * 60 * 10, // 10 min cache
  });

  const isMenuVisible = (menuKey: string) => {
    const menu = menuConfig?.find(m => m.menu_key === menuKey);
    return menu?.visivel ?? true;
  };

  const isMenuEditable = (menuKey: string) => {
    const menu = menuConfig?.find(m => m.menu_key === menuKey);
    return menu?.editavel ?? true;
  };

  const getMenuByKey = (menuKey: string) => {
    return menuConfig?.find(m => m.menu_key === menuKey);
  };

  const getSidebarMenus = (userPlan?: string | null, currentEnvironment?: string | null) => {
  // Menus a ocultar quando em ambiente específico
    const hiddenByEnvironment: Record<string, string[]> = {
      // Insider pago (business_sistemas): cliente acompanha o projeto.
      // Sem trilhas/calendário/progresso de mentoria, sem Skills e Squad.
      business_sistemas: [
        'trilhas', 'trilhas_skills', 'calendario',
        'evolucao', 'meu_diagnostico', 'minhas_duvidas',
        'meu_progresso', 'meu_progresso_visao_geral', 'meu_progresso_roadmap',
        'meu_progresso_conteudo', 'meu_progresso_entregas',
        'skills_minha_equipe', 'skills_backlog', 'skills_roadmap', 'skills_entregas', 'skills_painel_lider',
        'projeto_skills', 'projeto_skills_visao_geral', 'projeto_skills_performance', 'projeto_skills_diagnostico', 'projeto_skills_projetos', 'projeto_skills_entregas',
        'ia_copie_use', 'metodos_aplicar',
        'squad', 'squad_lider'
      ],

      // Insider não pago: a "outra visão" ainda vai ser definida. Por ora
      // esconde tudo que depende de projeto contratado ou de plano pago.
      insider_free: [
        'trilhas', 'trilhas_skills', 'calendario',
        'evolucao', 'meu_diagnostico', 'minhas_duvidas',
        'meu_progresso', 'meu_progresso_visao_geral', 'meu_progresso_roadmap',
        'meu_progresso_conteudo', 'meu_progresso_entregas',
        'skills_minha_equipe', 'skills_backlog', 'skills_roadmap', 'skills_entregas', 'skills_painel_lider',
        'projeto_skills', 'projeto_skills_visao_geral', 'projeto_skills_performance', 'projeto_skills_diagnostico', 'projeto_skills_projetos', 'projeto_skills_entregas',
        'ia_copie_use', 'metodos_aplicar',
        'squad', 'squad_lider',
        'meu_sistema'
      ],
      
      // Academy: usa evolução/diagnóstico/dúvidas soltos, NÃO o grupo "Meu Progresso"
      academy: [
        'meu_progresso_visao_geral', 'meu_progresso_roadmap',
        'meu_progresso_conteudo', 'meu_progresso_entregas',
        'projeto_skills', 'projeto_skills_visao_geral', 'projeto_skills_performance', 'projeto_skills_diagnostico', 'projeto_skills_projetos', 'projeto_skills_entregas',
        'squad', 'squad_lider',
        'meu_sistema'
      ],
    };
    
    const hiddenMenus = hiddenByEnvironment[currentEnvironment || ''] || [];
    
    return menuConfig?.filter(m => {
      if (m.tipo !== 'sidebar' || !m.visivel) return false;
      
      // Filtrar menus por ambiente selecionado
      if (hiddenMenus.includes(m.menu_key)) return false;
      
      // Se planos_permitidos = null, menu visível para todos
      if (!m.planos_permitidos || m.planos_permitidos.length === 0) return true;
      
      // Se não tem plano, não mostra menus restritos
      if (!userPlan) return false;
      
      // Verifica se o plano do usuário está na lista de permitidos
      // Aliases para compatibilidade entre chaves legadas e novas
      const PLAN_ALIASES: Record<string, string[]> = {
        'business_parceria': ['business_parceria', 'business'],
        'business_sistemas': ['business_sistemas', 'business_iaplicada'],
        'business': ['business', 'business_parceria'],
        'business_iaplicada': ['business_iaplicada', 'business_sistemas'],
      };
      
      const matchesPlan = (plan: string) => {
        const aliases = PLAN_ALIASES[plan] || [plan];
        return m.planos_permitidos!.some(p => aliases.includes(p));
      };
      
      // Se o ambiente selecionado corresponde a um dos planos permitidos, mostrar o menu
      if (currentEnvironment && matchesPlan(currentEnvironment)) return true;
      // Fallback: verificar plano do usuário
      return matchesPlan(userPlan);
    }).map(m => {
      if (m.menu_key === 'meu_sistema' && currentEnvironment === 'business_sistemas') {
        return { ...m, label: 'Meu Projeto' };
      }
      return m;
    }) || [];
  };

  const getHeaderMenus = () => {
    return menuConfig?.filter(m => m.tipo === 'header' && m.visivel) || [];
  };

  return { 
    menuConfig, 
    isLoading, 
    isMenuVisible, 
    isMenuEditable,
    getMenuByKey,
    getSidebarMenus,
    getHeaderMenus,
    refetch
  };
}
