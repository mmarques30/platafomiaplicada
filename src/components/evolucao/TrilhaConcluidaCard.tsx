import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, RotateCcw } from "lucide-react";

interface TrilhaConcluidaCardProps {
  id: string;
  titulo: string;
  dataConclusao?: string;
  tempoTotal: number;
  progressoPercent: number;
  certificadoId?: string;
}

export function TrilhaConcluidaCard({
  id,
  titulo,
  dataConclusao,
  tempoTotal,
  progressoPercent,
  certificadoId,
}: TrilhaConcluidaCardProps) {
  const navigate = useNavigate();

  const formatTempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    return `${horas}h ${minutos}min`;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>✱</span>
            <span>{titulo}</span>
          </h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Concluída em</p>
              <p className="font-semibold">
                {dataConclusao
                  ? new Date(dataConclusao).toLocaleDateString("pt-BR")
                  : "Data não disponível"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Tempo total</p>
              <p className="font-semibold">{formatTempo(tempoTotal)}</p>
            </div>
          </div>

          <div>
            <p className="text-muted-foreground text-sm">Aproveitamento final</p>
            <p className="font-semibold">{progressoPercent}%</p>
          </div>

          <div className="flex gap-2">
            {certificadoId && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => navigate("/evolucao/certificados")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Ver certificado
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => navigate(`/trilhas/${id}`)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Revisar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
