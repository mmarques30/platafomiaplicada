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
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case 'agendada':
        return <Clock className="h-5 w-5 text-amber-400" />;
      default:
        return <Circle className="h-5 w-5 text-slate-500" />;
    }
  };

  const getNodeStyle = (status?: string, index?: number) => {
    if (status === 'realizada') {
      return 'bg-emerald-500 border-emerald-400';
    }
    if (status === 'agendada') {
      return 'bg-amber-500 border-amber-400 animate-pulse';
    }
    return 'bg-slate-700 border-slate-600';
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
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-100 flex items-center gap-2 text-base font-semibold">
          <MapPin className="h-5 w-5 text-violet-400" />
          Roadmap da Mentoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-violet-500/50 via-violet-500/30 to-slate-700/50 rounded-full" />
          
          {/* Timeline nodes */}
          <div className="relative flex justify-between">
            {fases.map((fase, index) => {
              const isCompleted = fase.status === 'realizada';
              const isCurrent = fase.status === 'agendada';
              
              return (
                <div 
                  key={fase.id} 
                  className="flex flex-col items-center"
                  style={{ flex: 1 }}
                >
                  {/* Node */}
                  <div 
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      border-2 transition-all duration-300
                      ${isCompleted 
                        ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/20' 
                        : isCurrent
                          ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20'
                          : 'bg-slate-800 border-slate-600'
                      }
                    `}
                  >
                    {getStatusIcon(fase.status)}
                  </div>
                  
                  {/* Label */}
                  <div className="mt-3 text-center">
                    <p className={`text-sm font-medium ${
                      isCompleted 
                        ? 'text-emerald-400' 
                        : isCurrent 
                          ? 'text-amber-400'
                          : 'text-slate-400'
                    }`}>
                      {fase.titulo}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">
                      {fase.mes}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Progresso geral
          </span>
          <span className="text-violet-400 font-medium">
            {fases.filter(f => f.status === 'realizada').length} de {fases.length} etapas
          </span>
        </div>
        <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full transition-all duration-500"
            style={{ 
              width: `${(fases.filter(f => f.status === 'realizada').length / fases.length) * 100}%` 
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
