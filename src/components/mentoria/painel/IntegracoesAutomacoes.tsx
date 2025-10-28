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
      items: diagnostico.ferramentas_ia || [],
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
    <Card className="border-aplicada-green-100">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-aplicada-dark">
          Integrações e Automações Planejadas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {categoriasComConteudo.map((categoria) => (
            <AccordionItem key={categoria.id} value={categoria.id}>
              <AccordionTrigger className="text-left font-semibold bg-[#F6F7E9] px-4 hover:bg-[#E9EBC6] rounded-t-lg data-[state=closed]:rounded-b-lg">
                {categoria.titulo}
              </AccordionTrigger>
              <AccordionContent className="bg-white px-4 py-4 rounded-b-lg">
                <div className="space-y-2">
                  {categoria.items.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-aplicada-green-900 mt-1">✱</span>
                      <p className="flex-1">{item}</p>
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
