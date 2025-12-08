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
    <div className="w-full mt-4">
      {/* Container escuro transparente envolvendo TUDO */}
      <div className="flex flex-row items-center justify-between gap-4 bg-sidebar/90 backdrop-blur-sm rounded-2xl px-6 py-5 border border-sidebar-border">
        {/* Coluna Esquerda - Saudação e Tema */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {saudacao}, <span className="text-primary">{primeiroNome}</span>!
          </h1>
          
          {aulaAtiva ? (
            <p className="text-base md:text-lg text-white/70">
              <span className="font-semibold text-white">Próxima aula:</span> {aulaAtiva.tema} • {aulaAtiva.horario} - {aulaAtiva.dia_semana}
            </p>
          ) : (
            <p className="text-base md:text-lg text-white/70 font-medium">
              Aplique, replique e domine IA
            </p>
          )}
        </div>

        {/* Coluna Direita - Card Compacto de Data */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Ícone em círculo primary */}
            <div className="bg-primary rounded-xl p-3 flex items-center justify-center shadow-sm">
              <Calendar className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
            
            {/* Texto - Dia e Mês */}
            <div className="flex flex-col items-start leading-tight">
              <span className="text-2xl font-bold text-white">{dia}</span>
              <span className="text-sm text-white/70 font-medium uppercase tracking-wide">{diaSemana}, {mes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
