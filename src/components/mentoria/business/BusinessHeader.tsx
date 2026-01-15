import { Building2, Calendar, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BusinessHeaderProps {
  nomeCompleto?: string;
  empresa?: string;
  cargo?: string;
  dataDiagnostico?: string;
  plano?: string;
}

export function BusinessHeader({ 
  nomeCompleto, 
  empresa, 
  cargo,
  dataDiagnostico,
  plano = "Business Premium"
}: BusinessHeaderProps) {
  const dataFormatada = dataDiagnostico 
    ? format(new Date(dataDiagnostico), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-aplicada-dark/95 via-slate-900 to-aplicada-dark border border-white/10 p-6 md:p-8">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-aplicada-green-700/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-aplicada-green-800/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Avatar/Logo placeholder */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-aplicada-green-800 to-aplicada-green-700 flex items-center justify-center shadow-lg shadow-aplicada-green-700/25">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100">
              Olá, {nomeCompleto || "Mentorado"}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-slate-300">
              {empresa && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-aplicada-green-600" />
                  {empresa}
                </span>
              )}
              {cargo && (
                <span className="text-slate-400">• {cargo}</span>
              )}
            </div>
            
            {dataFormatada && (
              <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-2">
                <Calendar className="h-3.5 w-3.5" />
                Diagnóstico realizado em {dataFormatada}
              </p>
            )}
          </div>
        </div>
        
        <Badge className="self-start md:self-center bg-gradient-to-r from-aplicada-green-800 to-aplicada-green-700 text-white border-0 px-4 py-1.5 text-sm font-medium shadow-lg shadow-aplicada-green-700/25">
          <Crown className="h-3.5 w-3.5 mr-1.5" />
          {plano}
        </Badge>
      </div>
    </div>
  );
}
