import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flag } from "lucide-react";

interface MarcosEtapaProps {
  marcos: string[] | null;
}

export function MarcosEtapa({ marcos }: MarcosEtapaProps) {
  if (!marcos || marcos.length === 0) {
    return null;
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Flag className="h-4 w-4 text-primary" />
          Marcos para o Próximo Encontro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {marcos.map((marco, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span className="text-foreground">{marco}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
