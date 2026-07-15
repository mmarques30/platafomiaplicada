import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Check, ChevronRight, Zap, Plus, Minus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { usePendenciasAtivas, PendenciaDashboard } from "@/hooks/admin/usePendenciasDashboard";
import { useUserPlan } from "@/hooks/useUserPlan";

const PESQUISA_APLICA_ID = "9a357821-4e62-4176-9f6c-46b0668cb450";

interface PendenciaItem {
  key: string;
  label: string;
  completed: boolean;
  link: string;
  tipo: string;
}

export function PendenciasOnboarding() {
  const { user } = useAuth();
  const { plan } = useUserPlan();
  const [isExpanded, setIsExpanded] = useState(false);

  // Buscar pendências ativas do banco
  const { data: pendenciasConfig, isLoading: loadingConfig } = usePendenciasAtivas(plan);

  // Verificar status de cada pendência
  const { data: statusMap, isLoading: loadingStatus } = useQuery({
    queryKey: ["pendencias-status", user?.id, pendenciasConfig?.map(p => p.id)],
    queryFn: async () => {
      if (!pendenciasConfig || pendenciasConfig.length === 0) return {};

      const statusResults: Record<string, boolean> = {};

      for (const pendencia of pendenciasConfig) {
        if (pendencia.tipo === "diagnostico") {
          const { data } = await supabase
            .from("formulario_diagnostico")
            .select("completado")
            .eq("user_id", user!.id)
            .maybeSingle();
          statusResults[pendencia.id] = data?.completado === true;
        } else if (pendencia.tipo === "pesquisa") {
          // Para pesquisas, verifica se existe resposta completada
          // Se tiver referencia_id, usa esse ID, senão usa o ID padrão
          const pesquisaId = pendencia.referencia_id || PESQUISA_APLICA_ID;
          const { data } = await supabase
            .from("respostas_pesquisas")
            .select("completado")
            .eq("pesquisa_id", pesquisaId)
            .eq("user_id", user!.id)
            .eq("completado", true)
            .maybeSingle();
          statusResults[pendencia.id] = !!data;
        } else if (pendencia.tipo === "formulario") {
          // Para formulários customizados com referencia_id
          // Verificamos na tabela respostas_pesquisas já que não existe respostas_formularios
          if (pendencia.referencia_id) {
            const { data } = await supabase
              .from("respostas_pesquisas")
              .select("completado")
              .eq("pesquisa_id", pendencia.referencia_id)
              .eq("user_id", user!.id)
              .eq("completado", true)
              .maybeSingle();
            statusResults[pendencia.id] = !!data;
          } else {
            statusResults[pendencia.id] = false;
          }
        } else {
          statusResults[pendencia.id] = false;
        }
      }

      return statusResults;
    },
    enabled: !!user && !!pendenciasConfig && pendenciasConfig.length > 0,
  });

  const isLoading = loadingConfig || loadingStatus;

  // Montar lista de pendências com status
  const pendencias: PendenciaItem[] = (pendenciasConfig || []).map(p => ({
    key: p.id,
    label: p.titulo,
    completed: statusMap?.[p.id] ?? false,
    link: p.link,
    tipo: p.tipo,
  }));

  const completedCount = pendencias.filter((p) => p.completed).length;
  const totalCount = pendencias.length;
  const allCompleted = completedCount === totalCount;

  // Não mostrar se carregando, se tudo completo, ou se não há pendências
  if (isLoading || allCompleted || totalCount === 0) {
    return null;
  }

  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <div className="bg-foreground border border-white/10 rounded-lg sm:rounded-xl overflow-hidden">
      {/* Header compacto - sempre visível */}
      <div 
        className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Icone + Titulo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
          <span className="text-xs sm:text-sm font-medium text-white">Complete seu perfil</span>
        </div>
        
        {/* Progress bar inline */}
        <div className="hidden sm:flex items-center gap-3 flex-1 max-w-32 mx-4">
          <Progress value={progressPercent} className="h-1.5 flex-1" indicatorClassName="bg-yellow-500" />
        </div>
        
        {/* Contador */}
        <span className="text-[10px] sm:text-xs text-white/60 mr-2 sm:mr-3">{completedCount}/{totalCount}</span>
        
        {/* Botao expandir */}
        <button 
          className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label={isExpanded ? "Recolher" : "Expandir"}
        >
          {isExpanded ? (
            <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/70" />
          ) : (
            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/70" />
          )}
        </button>
      </div>

      {/* Lista de pendências - expansível */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 px-3 sm:px-4 py-2.5 sm:py-3 space-y-1.5 sm:space-y-2">
              {pendencias.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-2 py-0.5 sm:py-1"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    {item.completed ? (
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-aplicada-green-600 flex-shrink-0" />
                    ) : (
                      <div className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full border-2 border-white/30 flex-shrink-0" />
                    )}
                    <span
                      className={`text-xs sm:text-sm truncate ${
                        item.completed
                          ? "text-white/50 line-through"
                          : "text-white"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {item.completed ? (
                    <span className="text-[10px] sm:text-xs text-aplicada-green-600 font-medium whitespace-nowrap">
                      Concluído
                    </span>
                  ) : (
                    <Link
                      to={item.link}
                      className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-medium text-yellow-500 hover:text-yellow-400 transition-colors whitespace-nowrap"
                    >
                      Preencher
                      <ChevronRight className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
