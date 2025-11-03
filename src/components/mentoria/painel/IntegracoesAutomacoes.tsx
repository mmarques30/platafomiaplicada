import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Props {
  diagnostico: any;
}

export const IntegracoesAutomacoes = ({ diagnostico }: Props) => {
  if (!diagnostico) return null;

  const categorias = [
    {
      id: "ferramentas",
      titulo: "Ferramentas de IA",
      items: Array.isArray(diagnostico.ferramentas_ia) 
        ? diagnostico.ferramentas_ia 
        : diagnostico.ferramentas_ia ? [diagnostico.ferramentas_ia] : [],
    },
    {
      id: "processos",
      titulo: "Processos a Otimizar",
      items: diagnostico.processo_otimizar ? [diagnostico.processo_otimizar] : [],
    },
    {
      id: "areas",
      titulo: "Áreas de Aplicação",
      items: diagnostico.area_aplicacao_ia ? [diagnostico.area_aplicacao_ia] : [],
    },
  ];

  const categoriasComConteudo = categorias.filter(cat => cat.items.length > 0);

  if (categoriasComConteudo.length === 0) return null;

  return (
    <Card className="bg-card text-card-foreground border border-border">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">
          Integrações e Automações Planejadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {categoriasComConteudo.map((categoria) => (
            <AccordionItem key={categoria.id} value={categoria.id} className="border-0">
              <AccordionTrigger className="text-left font-semibold bg-card border border-border text-card-foreground px-4 hover:bg-muted rounded-lg data-[state=open]:rounded-b-none transition-colors">
                {categoria.titulo}
              </AccordionTrigger>
              <AccordionContent className="bg-card border-x border-b border-border px-4 py-4 rounded-b-lg">
                <div className="space-y-3">
                  {categoria.items.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-aplicada-green-900 mt-1 flex-shrink-0 font-bold">•</span>
                      <p className="flex-1 text-card-foreground leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
