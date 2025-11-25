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

  const getSidebarMenus = () => {
    return menuConfig?.filter(m => m.tipo === 'sidebar' && m.visivel) || [];
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
