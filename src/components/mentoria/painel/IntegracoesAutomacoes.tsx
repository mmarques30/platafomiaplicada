import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { PainelCard, PainelCardHeader } from "./PainelCard";
import { getPainelTheme } from "./painelTheme";

interface Props {
  diagnostico: any;
  isBusiness?: boolean;
}

export const IntegracoesAutomacoes = ({ diagnostico, isBusiness = false }: Props) => {
  if (!diagnostico) return null;

  const theme = getPainelTheme(isBusiness);

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
    <PainelCard isBusiness={isBusiness}>
      <PainelCardHeader 
        title="Integrações e Automações Planejadas" 
        isBusiness={isBusiness}
      />
      
      <Accordion type="single" collapsible className="w-full space-y-2">
        {categoriasComConteudo.map((categoria) => (
          <AccordionItem 
            key={categoria.id} 
            value={categoria.id} 
            className={cn(
              "border rounded-xl overflow-hidden",
              isBusiness ? "border-white/10" : "border-border"
            )}
          >
            <AccordionTrigger 
              className={cn(
                "text-left font-semibold px-4 py-3 rounded-xl transition-colors",
                isBusiness 
                  ? "bg-white/5 hover:bg-white/8 text-slate-100 data-[state=open]:rounded-b-none" 
                  : "bg-card hover:bg-muted text-card-foreground data-[state=open]:rounded-b-none"
              )}
            >
              {categoria.titulo}
            </AccordionTrigger>
            <AccordionContent 
              className={cn(
                "px-4 py-4",
                isBusiness ? "bg-white/3" : "bg-card"
              )}
            >
              <div className="space-y-3">
                {categoria.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className={cn(
                      "mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0",
                      isBusiness ? "bg-violet-400" : "bg-aplicada-green-900"
                    )} />
                    <p className={cn("flex-1 leading-relaxed", theme.textSecondary)}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </PainelCard>
  );
};
