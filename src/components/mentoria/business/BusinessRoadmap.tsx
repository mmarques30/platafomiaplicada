import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, CheckCircle2, Circle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Sessao {
  id: string;
  titulo?: string;
  data_sessao?: string;
  tipo_sessao?: string;
  status?: string;
}

interface BusinessRoadmapProps {
  sessoes: Sessao[];
}

export function BusinessRoadmap({ sessoes }: BusinessRoadmapProps) {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'realizada':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'agendada':
        return <Clock className="h-5 w-5 text-amber-600" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Gerar fases padrão se não houver sessões
  const defaultFases = [
    { id: '1', titulo: 'Diagnóstico', status: 'realizada', mes: 'Jan' },
    { id: '2', titulo: 'Automação', status: 'pendente', mes: 'Fev' },
    { id: '3', titulo: 'Integração', status: 'pendente', mes: 'Mar' },
    { id: '4', titulo: 'Treinamento', status: 'pendente', mes: 'Abr' },
    { id: '5', titulo: 'Go-Live', status: 'pendente', mes: 'Mai' },
  ];

  const fases = sessoes.length > 0 
    ? sessoes.map((s, i) => ({
        id: s.id,
        titulo: s.titulo || `Fase ${i + 1}`,
        status: s.status,
        mes: s.data_sessao ? format(new Date(s.data_sessao), 'MMM', { locale: ptBR }) : '',
        data: s.data_sessao,
      }))
    : defaultFases;

  return (
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
          <MapPin className="h-5 w-5 text-brand-strong" />
          Roadmap da Mentoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Container */}
        <div className="relative pb-2">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-6 left-[5%] right-[5%] h-1 bg-gradient-to-r from-brand-strong/15 via-brand-strong/15 to-muted rounded-full" />
            
            {/* Timeline nodes */}
            <div className="relative flex justify-between px-4">
              {fases.map((fase, index) => {
                const isCompleted = fase.status === 'realizada';
                const isCurrent = fase.status === 'agendada';
                
                return (
                  <div 
                    key={fase.id} 
                    className="flex flex-col items-center flex-1 max-w-[160px]"
                  >
                    {/* Node */}
                    <div 
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        border-2 transition-all duration-300
                        ${isCompleted 
                          ? 'bg-emerald-500/10 border-emerald-500' 
                          : isCurrent
                            ? 'bg-amber-500/10 border-amber-500'
                            : 'bg-muted border-border'
                        }
                      `}
                    >
                      {getStatusIcon(fase.status)}
                    </div>
                    
                    {/* Label */}
                    <div className="mt-3 text-center w-full px-1">
                      <p className={`text-sm font-medium text-center leading-tight ${
                        isCompleted 
                          ? 'text-emerald-600' 
                          : isCurrent 
                            ? 'text-amber-600'
                            : 'text-muted-foreground'
                      }`}>
                        {fase.titulo}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {fase.mes}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Progresso geral
          </span>
          <span className="text-brand-strong font-medium">
            {fases.filter(f => f.status === 'realizada').length} de {fases.length} etapas
          </span>
        </div>
        <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-brand-strong to-brand-strong rounded-full transition-all duration-500"
            style={{ 
              width: `${(fases.filter(f => f.status === 'realizada').length / fases.length) * 100}%` 
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
