import { Building2, Calendar, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="border-border">
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar/Logo */}
            <div className="w-16 h-16 rounded-2xl bg-aplicada-green-700/10 border border-aplicada-green-700/20 flex items-center justify-center">
              <Building2 className="h-8 w-8 text-aplicada-green-700" />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Olá, {nomeCompleto || "Mentorado"}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                {empresa && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-aplicada-green-700" />
                    {empresa}
                  </span>
                )}
                {cargo && (
                  <span>• {cargo}</span>
                )}
              </div>
              
              {dataFormatada && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-2">
                  <Calendar className="h-3.5 w-3.5" />
                  Diagnóstico realizado em {dataFormatada}
                </p>
              )}
            </div>
          </div>
          
          <Badge className="self-start md:self-center bg-aplicada-green-700 text-white border-0 px-4 py-1.5 text-sm font-medium">
            <Crown className="h-3.5 w-3.5 mr-1.5" />
            {plano}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
