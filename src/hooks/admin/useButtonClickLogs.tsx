import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ButtonClickLog {
  id: string;
  user_id: string | null;
  user_email: string;
  button_type: string;
  page_origin: string;
  clicked_at: string;
}

export function useButtonClickLogs() {
  return useQuery({
    queryKey: ["button-click-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("button_click_logs")
        .select("*")
        .order("clicked_at", { ascending: false });

      if (error) throw error;
      return data as ButtonClickLog[];
    },
  });
}

export function useAcademyPurchaseClicks() {
  return useQuery({
    queryKey: ["academy-purchase-clicks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("button_click_logs")
        .select("*")
        .eq("button_type", "academy_purchase")
        .order("clicked_at", { ascending: false });

      if (error) throw error;
      return data as ButtonClickLog[];
    },
  });
}
