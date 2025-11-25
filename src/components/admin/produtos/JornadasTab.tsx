import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Building2, RefreshCw } from "lucide-react";

export function JornadasTab() {
  const jornadas = [
    {
      id: "b2c",
      titulo: "Jornada B2C",
      descricao: "Para profissionais individuais",
      icon: Users,
      etapas: [
        { produto: "Academy", valor: "R$1.397/ano", tipo: "inicial" },
        { produto: "Lab", valor: "R$2.497 total", economia: "R$2.397", tipo: "upsell" },
        { produto: "Club", valor: "R$6.497", economia: "R$1.500", tipo: "premium" },
      ],
    },
    {
      id: "b2b",
      titulo: "Jornada B2B",
      descricao: "Para empresas e equipes",
      icon: Building2,
      etapas: [
        { produto: "Skills", valor: "R$297/mês", tipo: "inicial" },
        { produto: "Lab", valor: "+R$1.100", economia: "R$2.397", tipo: "upsell" },
        { produto: "Club", valor: "R$7.997", tipo: "premium" },
      ],
    },
    {
      id: "consult",
      titulo: "Jornada Consult",
      descricao: "Transformação digital completa",
      icon: Building2,
      etapas: [
        { produto: "Consult (Projeto)", valor: "R$15-50k", tipo: "inicial" },
        { produto: "Skills (Recorrência)", valor: "R$297/mês", tipo: "upsell" },
        { produto: "Lab (Equipe)", valor: "+R$1.100", economia: "R$2.397", tipo: "upsell" },
        { produto: "Club (Líder)", valor: "R$7.997", tipo: "premium" },
      ],
    },
    {
      id: "renovacao",
      titulo: "Jornada Renovação",
      descricao: "Para clientes recorrentes",
      icon: RefreshCw,
      etapas: [
        { produto: "Lab (1ª vez)", valor: "R$3.497", tipo: "inicial" },
        { produto: "Lab (renovação)", valor: "R$2.497", economia: "R$1.000", tipo: "upsell" },
        { produto: "Club", valor: "R$6.497", economia: "R$1.500", tipo: "premium" },
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
                            Economia: {etapa.economia}
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
        <h3 className="font-semibold mb-2">💡 Dica</h3>
        <p className="text-sm text-muted-foreground">
          As jornadas são calculadas automaticamente com base nas regras de upsell configuradas.
          Para modificar uma jornada, edite as regras de upsell na aba correspondente.
        </p>
      </Card>
    </div>
  );
}
