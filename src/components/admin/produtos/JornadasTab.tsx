import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Building2 } from "lucide-react";

export function JornadasTab() {
  const jornadas = [
    {
      id: "b2c",
      titulo: "Jornada B2C",
      descricao: "Para profissionais individuais",
      icon: Users,
      etapas: [
        { produto: "Academy", valor: "R$ 1.497/ano", tipo: "inicial" },
        { produto: "Skills", valor: "R$ 4.497/ano", economia: "Upgrade para equipe", tipo: "upsell" },
      ],
    },
    {
      id: "b2b-skills",
      titulo: "Jornada B2B Skills",
      descricao: "Para empresas que querem treinar equipes",
      icon: Building2,
      etapas: [
        { produto: "Skills", valor: "R$ 4.497/ano", tipo: "inicial" },
        { produto: "Builder", valor: "R$ 9.997 - R$ 70k", economia: "Transformação completa", tipo: "premium" },
      ],
    },
    {
      id: "b2b-business",
      titulo: "Jornada B2B Builder",
      descricao: "Para empresas que precisam de transformação digital",
      icon: Building2,
      etapas: [
        { produto: "Builder", valor: "R$ 9.997 - R$ 70k", tipo: "inicial" },
        { produto: "Skills (Recorrência)", valor: "+R$ 1.397/pessoa/ano", economia: "Novos liderados", tipo: "upsell" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Jornadas do Cliente</h2>
        <p className="text-muted-foreground">
          Visualize os caminhos de evolução dos clientes através dos produtos
        </p>
      </div>

      <div className="grid gap-6">
        {jornadas.map((jornada) => {
          const Icon = jornada.icon;
          return (
            <Card key={jornada.id} className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{jornada.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{jornada.descricao}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 overflow-x-auto pb-2">
                {jornada.etapas.map((etapa, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex flex-col items-center min-w-[200px]">
                      <Badge
                        variant={
                          etapa.tipo === "inicial"
                            ? "default"
                            : etapa.tipo === "premium"
                            ? "secondary"
                            : "outline"
                        }
                        className="mb-2"
                      >
                        {etapa.tipo === "inicial" && "Entrada"}
                        {etapa.tipo === "upsell" && "Upsell"}
                        {etapa.tipo === "premium" && "Premium"}
                      </Badge>
                      <div className="text-center p-4 border rounded-lg bg-card w-full">
                        <p className="font-semibold mb-1">{etapa.produto}</p>
                        <p className="text-sm text-primary font-medium">{etapa.valor}</p>
                        {etapa.economia && (
                          <p className="text-xs text-green-600 mt-1">
                            {etapa.economia}
                          </p>
                        )}
                      </div>
                    </div>
                    {index < jornada.etapas.length - 1 && (
                      <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-2">💡 Produtos Ativos</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Academy</strong> - B2C Individual (R$ 1.497/ano)</p>
          <p><strong>Skills</strong> - B2B Equipes (R$ 4.497/ano, mínimo 3 licenças)</p>
          <p><strong>Builder</strong> - B2B Consultoria (R$ 9.997 - R$ 70.000/projeto)</p>
        </div>
      </Card>
    </div>
  );
}
