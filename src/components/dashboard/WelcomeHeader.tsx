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

  return (
    <div className="w-full bg-gradient-to-r from-accent/5 to-primary/5 rounded-xl px-4 py-3 md:px-6 md:py-4 mb-6 border border-accent/20">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        {/* Coluna Esquerda - Saudação e Tema */}
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            {saudacao}, {primeiroNome}!
          </h1>
          
          {aulaAtiva ? (
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="font-semibold text-foreground">Tema:</span> {aulaAtiva.tema} • às {aulaAtiva.horario} - {aulaAtiva.dia_semana}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-0.5">
              Simplifique sua gestão com inteligência artificial
            </p>
          )}
        </div>

        {/* Coluna Direita - Card Compacto */}
        <div className="flex items-center gap-3">
          {/* Data compacta */}
          <div className="flex items-center gap-2 bg-gradient-to-br from-accent to-primary rounded-xl px-3 py-2 shadow-md">
            <Calendar className="w-5 h-5 text-white" />
            <div className="flex flex-col items-start leading-none">
              <span className="text-lg font-bold text-white">{dia}</span>
              <span className="text-xs text-white/80 font-medium">{mes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
