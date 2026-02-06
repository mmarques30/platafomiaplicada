import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function DiagnosticoProcessing() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-12 w-12 animate-spin text-[hsl(72,50%,35%)]" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">
          Analisando seu perfil...
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Processando dados individuais
        </p>
      </CardContent>
    </Card>
  );
}
