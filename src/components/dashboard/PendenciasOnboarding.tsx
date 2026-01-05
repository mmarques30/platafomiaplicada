import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Check, ChevronRight, Zap, Plus, Minus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const PESQUISA_APLICA_ID = "9a357821-4e62-4176-9f6c-46b0668cb450";

interface PendenciaItem {
  key: string;
  label: string;
  completed: boolean;
  link: string;
}

export function PendenciasOnboarding() {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  // Verificar se diagnóstico está completo
  const { data: diagnostico, isLoading: loadingDiagnostico } = useQuery({
    queryKey: ["pendencia-diagnostico", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("formulario_diagnostico")
        .select("completado")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Verificar se pesquisa está completa
  const { data: pesquisa, isLoading: loadingPesquisa } = useQuery({
    queryKey: ["pendencia-pesquisa", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("respostas_pesquisas")
        .select("completado")
        .eq("pesquisa_id", PESQUISA_APLICA_ID)
        .eq("user_id", user!.id)
        .eq("completado", true)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const isLoading = loadingDiagnostico || loadingPesquisa;

  // Montar lista de pendências
  const pendencias: PendenciaItem[] = [
    {
      key: "diagnostico",
      label: "Diagnóstico Estratégico",
      completed: diagnostico?.completado === true,
      link: "/meu-diagnostico",
    },
    {
      key: "pesquisa",
      label: "Pesquisa de Perfil",
      completed: !!pesquisa,
      link: "/formulario-aplica",
    },
  ];

  const completedCount = pendencias.filter((p) => p.completed).length;
  const totalCount = pendencias.length;
  const allCompleted = completedCount === totalCount;

  // Não mostrar se carregando ou se tudo completo
  if (isLoading || allCompleted) {
    return null;
  }

  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <div className="bg-black border border-white/10 rounded-xl overflow-hidden">
      {/* Header compacto - sempre visível */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Icone + Titulo */}
        <div className="flex items-center gap-3">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-white">Complete seu perfil</span>
        </div>
        
        {/* Progress bar inline */}
        <div className="hidden sm:flex items-center gap-3 flex-1 max-w-32 mx-4">
          <Progress value={progressPercent} className="h-1.5 flex-1" indicatorClassName="bg-yellow-500" />
        </div>
        
        {/* Contador */}
        <span className="text-xs text-white/60 mr-3">{completedCount}/{totalCount}</span>
        
        {/* Botao expandir */}
        <button 
          className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label={isExpanded ? "Recolher" : "Expandir"}
        >
          {isExpanded ? (
            <Minus className="w-3.5 h-3.5 text-white/70" />
          ) : (
            <Plus className="w-3.5 h-3.5 text-white/70" />
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
            <div className="border-t border-white/10 px-4 py-3 space-y-2">
              {pendencias.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-2 py-1"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {item.completed ? (
                      <Check className="h-4 w-4 text-aplicada-green-600 flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm truncate ${
                        item.completed
                          ? "text-white/50 line-through"
                          : "text-white"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>

                  {item.completed ? (
                    <span className="text-xs text-aplicada-green-600 font-medium whitespace-nowrap">
                      Concluído
                    </span>
                  ) : (
                    <Link
                      to={item.link}
                      className="flex items-center gap-1 text-xs font-medium text-yellow-500 hover:text-yellow-400 transition-colors whitespace-nowrap"
                    >
                      Preencher
                      <ChevronRight className="h-3 w-3" />
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
