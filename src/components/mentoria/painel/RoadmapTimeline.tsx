import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  sessoes: Array<{
    id: string;
    titulo: string;
    data_sessao: string;
    status: string;
    notas?: string;
  }>;
}

export const RoadmapTimeline = ({ sessoes }: Props) => {
  if (!sessoes || sessoes.length === 0) return null;

  // Agrupar sessões por mês
  const sessoesPorMes = sessoes.reduce((acc, sessao) => {
    const mes = format(new Date(sessao.data_sessao), "MMMM yyyy", { locale: ptBR });
    if (!acc[mes]) {
      acc[mes] = [];
    }
    acc[mes].push(sessao);
    return acc;
  }, {} as Record<string, typeof sessoes>);

  return (
    <Card className="border-aplicada-green-100">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-aplicada-dark">
          Roadmap e Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Desktop: Timeline vertical */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Linha vertical */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-aplicada-green-100" />

            {Object.entries(sessoesPorMes).map(([mes, sessoesMes], mesIndex) => (
              <div key={mes} className="relative mb-8">
                {/* Círculo do mês */}
                <div className="flex items-center mb-4">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-aplicada-green-900 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{mesIndex + 1}</span>
                  </div>
                  <h3 className="ml-4 text-lg font-bold text-aplicada-dark capitalize">{mes}</h3>
                </div>

                {/* Sessões do mês */}
                <div className="ml-12 space-y-3">
                  {sessoesMes.map((sessao) => (
                    <Card key={sessao.id} className="bg-aplicada-green-100 border-aplicada-green-100">
                      <CardContent className="pt-4">
                        <h4 className="font-semibold text-aplicada-dark mb-1">{sessao.titulo}</h4>
                        <p className="text-sm text-aplicada-dark/70">
                          {format(new Date(sessao.data_sessao), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                        {sessao.notas && (
                          <p className="text-sm mt-2 text-aplicada-dark">{sessao.notas}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Accordion */}
        <div className="md:hidden">
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(sessoesPorMes).map(([mes, sessoesMes], mesIndex) => (
              <AccordionItem key={mes} value={mes}>
                <AccordionTrigger className="text-left font-semibold bg-aplicada-green-100 text-aplicada-dark px-4 hover:bg-aplicada-green-100/80 rounded-t-lg data-[state=closed]:rounded-b-lg">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-aplicada-green-900 text-white flex items-center justify-center text-sm">
                      {mesIndex + 1}
                    </span>
                    <span className="capitalize">{mes}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="bg-white px-4 py-4 rounded-b-lg">
                  <div className="space-y-3">
                    {sessoesMes.map((sessao) => (
                      <div key={sessao.id} className="border-l-2 border-aplicada-green-900 pl-3">
                        <h4 className="font-semibold text-aplicada-dark">{sessao.titulo}</h4>
                        <p className="text-sm text-aplicada-dark/70">
                          {format(new Date(sessao.data_sessao), "dd 'de' MMMM", { locale: ptBR })}
                        </p>
                        {sessao.notas && (
                          <p className="text-sm mt-1 text-aplicada-dark">{sessao.notas}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};
