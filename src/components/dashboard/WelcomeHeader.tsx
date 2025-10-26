import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAulaSemanal } from "@/hooks/useAulaSemanal";
import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock } from "lucide-react";

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
  const horario = formatInTimeZone(dataAtual, TIMEZONE, 'HH:mm');

  return (
    <div className="w-full bg-gradient-to-r from-accent/5 to-primary/5 rounded-2xl p-6 md:p-8 mb-8 border border-accent/20">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-start">
        {/* Coluna Esquerda - Saudação e Tema */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {saudacao}, {primeiroNome}!
          </h1>
          
          {aulaAtiva ? (
            <div className="space-y-1">
              <p className="text-lg text-muted-foreground">
                <span className="font-semibold text-foreground">Tema da aula:</span> {aulaAtiva.tema}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                às {aulaAtiva.horario} - {aulaAtiva.dia_semana}
              </p>
            </div>
          ) : (
            <p className="text-lg text-muted-foreground">
              Simplifique sua gestão com inteligência artificial
            </p>
          )}
        </div>

        {/* Coluna Direita - Card do Calendário */}
        <div className="flex justify-end">
          <div className="bg-gradient-to-br from-accent to-primary rounded-2xl p-6 shadow-lg min-w-[140px] text-center">
            <div className="flex flex-col items-center gap-1">
              <Calendar className="w-6 h-6 text-white mb-2 opacity-90" />
              <div className="text-5xl font-bold text-white">
                {dia}
              </div>
              <div className="text-lg font-semibold text-white/90 tracking-wider">
                {mes}
              </div>
              <div className="h-px w-12 bg-white/30 my-2" />
              <div className="text-2xl font-bold text-white flex items-center gap-1">
                <Clock className="w-5 h-5" />
                {horario}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
