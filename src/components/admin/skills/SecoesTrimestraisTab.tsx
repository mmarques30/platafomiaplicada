import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, CheckCircle, Clock } from "lucide-react";

interface Props { equipeId: string }

const trimestres = [
  { num: 1, label: "T1", titulo: "Fundação", semanas: "1-3" },
  { num: 2, label: "T2", titulo: "Expansão", semanas: "4-6" },
  { num: 3, label: "T3", titulo: "Consolidação", semanas: "7-9" },
  { num: 4, label: "T4", titulo: "Autonomia", semanas: "10-12" },
];

export default function SecoesTrimestraisTab({ equipeId }: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trimestres.map(t => (
          <Card key={t.num} className="border-border/50 hover:shadow-sm transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{t.label}</Badge>
                  {t.titulo}
                </CardTitle>
                <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 text-xs gap-1">
                  <Clock className="h-3 w-3" /> Planejado
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Semanas {t.semanas}
                </div>
                <p className="text-xs text-muted-foreground">
                  Encontros e entregas serão gerados automaticamente com base no contrato.
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
