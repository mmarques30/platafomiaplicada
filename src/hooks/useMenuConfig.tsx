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
      // Skills: oculta trilhas gerais, calendário e TODO o grupo "Meu Progresso" (não usado no Skills)
      skills: [
        'trilhas', 'calendario',
        'meu_progresso', 'evolucao', 'meu_diagnostico', 'minhas_duvidas',
        'skills_minha_equipe', 'skills_backlog', 'skills_roadmap', 'skills_entregas',
        'squad', 'squad_lider'
      ],
      
      // Business Colaborativo: oculta menus Academy-only e Skills-only + Squad
      business: [
        'trilhas', 'calendario', 'evolucao', 'meu_diagnostico', 'minhas_duvidas',
        'trilhas_skills', 'skills_minha_equipe', 'skills_backlog', 'skills_roadmap', 
        'skills_entregas', 'skills_painel_lider',
        'squad', 'squad_lider'
      ],
      
      // Business IAplicada: versão mais restrita (cliente apenas acompanha) + Squad
      business_iaplicada: [
        'trilhas', 'trilhas_skills', 'calendario',
        'evolucao', 'meu_diagnostico', 'minhas_duvidas', 'meu_progresso_conteudo',
        'meu_progresso', 'skills_minha_equipe', 'skills_backlog', 'skills_roadmap', 'skills_entregas', 'skills_painel_lider',
        'comunidade', 'comunidade_feed', 'comunidade_sala',
        'squad', 'squad_lider'
      ],
      
      // Academy: ocultar Squad (apenas Skills)
      academy: [
        'squad', 'squad_lider'
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
      return m.planos_permitidos.includes(userPlan);
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
