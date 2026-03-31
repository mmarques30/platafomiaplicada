import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAulaSemanal } from "@/hooks/useAulaSemanal";
import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";
import { Calendar } from "lucide-react";

const TIMEZONE = 'America/Sao_Paulo';

export function WelcomeHeader() {
  const { user } = useAuth();
  const [dataAtual, setDataAtual] = useState(new Date());
  const { aulaAtiva } = useAulaSemanal();

  // Atualizar horário a cada 60 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setDataAtual(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Buscar nome do usuário
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('nome_completo')
        .eq('id', user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const primeiroNome = profile?.nome_completo?.split(' ')[0] || 'Usuário';

  // Obter saudação baseada na hora
  const hora = parseInt(formatInTimeZone(dataAtual, TIMEZONE, 'HH'));
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  // Formatações de data/hora
  const dia = formatInTimeZone(dataAtual, TIMEZONE, 'dd');
  const mes = formatInTimeZone(dataAtual, TIMEZONE, 'MMM', { locale: ptBR }).toUpperCase();
  const diaSemana = formatInTimeZone(dataAtual, TIMEZONE, 'EEE', { locale: ptBR });

  return (
    <div className="w-full mt-2 md:mt-4">
      {/* Container escuro transparente envolvendo TUDO */}
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-3 md:gap-4 bg-gradient-to-r from-[#0C0F0A] via-[#151814] to-[#0C0F0A] backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl px-2.5 sm:px-3 md:px-6 py-2.5 sm:py-3 md:py-5 border border-white/10">
        {/* Coluna Esquerda - Saudação e Tema */}
        <div className="flex-1 min-w-0 text-left">
          <h1 className="text-sm sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-0.5 md:mb-1">
            {saudacao}, <span className="text-primary font-bold">{primeiroNome}</span>!
          </h1>
          
          {aulaAtiva ? (
            <p className="text-[11px] sm:text-xs md:text-base lg:text-lg text-white/70 truncate">
              <span className="font-semibold text-white">Aula:</span> {aulaAtiva.tema}
            </p>
          ) : (
            <p className="text-[11px] sm:text-xs md:text-base lg:text-lg text-white/70 font-medium">
              Aplique, replique e domine IA
            </p>
          )}
        </div>

        {/* Coluna Direita - Card Compacto de Data */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0">
          {/* Ícone em círculo primary */}
          <div className="bg-primary rounded-md sm:rounded-lg md:rounded-xl p-1 sm:p-1.5 md:p-3 flex items-center justify-center shadow-sm">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-6 md:h-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          
          {/* Texto - Dia e Mês */}
          <div className="flex flex-col items-start leading-tight">
            <span className="text-base sm:text-lg md:text-2xl font-bold text-white">{dia}</span>
            <span className="text-[9px] sm:text-[10px] md:text-sm text-white/70 font-medium uppercase tracking-wide">{diaSemana}, {mes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
