import { ClipboardList } from "lucide-react";

interface DiagnosticoData {
  problema_principal?: string;
  processo_automatizar?: string;
  resultado_esperado?: string;
  impacto_financeiro_estimado?: string;
  kpi_principal?: string;
  definicao_sucesso?: string;
  area_atuacao?: string;
  tamanho_empresa?: string;
  tamanho_equipe?: number;
  profissao?: string;
  ferramentas_ia?: any;
  desafio_macro?: string;
  fonte_descoberta?: string;
  interesse_skills?: string;
  pipeline_projetos?: string;
  importancia_projeto?: number;
}

interface BusinessDiagnosticoResumoProps {
  diagnostico: DiagnosticoData;
}

export function BusinessDiagnosticoResumo({ diagnostico }: BusinessDiagnosticoResumoProps) {
  const sections = [
    {
      title: "O Projeto",
      items: [
        { label: "Problema Principal", value: diagnostico.problema_principal },
        { label: "Processo a Automatizar", value: diagnostico.processo_automatizar },
        { label: "Resultado Esperado", value: diagnostico.resultado_esperado },
      ]
    },
    {
      title: "Impacto Esperado",
      items: [
        { label: "Impacto Financeiro", value: diagnostico.impacto_financeiro_estimado },
        { label: "KPI Principal", value: diagnostico.kpi_principal },
        { label: "Definição de Sucesso", value: diagnostico.definicao_sucesso },
        { label: "Importância do Projeto", value: diagnostico.importancia_projeto ? `${diagnostico.importancia_projeto}/10` : undefined },
      ]
    },
    {
      title: "Contexto",
      items: [
        { label: "Área de Atuação", value: diagnostico.area_atuacao },
        { label: "Cargo/Profissão", value: diagnostico.profissao },
        { label: "Porte da Empresa", value: diagnostico.tamanho_empresa },
        { label: "Tamanho da Equipe", value: diagnostico.tamanho_equipe ? `${diagnostico.tamanho_equipe} pessoas` : undefined },
        { label: "Desafio Macro", value: diagnostico.desafio_macro },
      ]
    },
    {
      title: "Interesse em Crescimento",
      items: [
        { label: "Interesse em Skills (Treinamento)", value: diagnostico.interesse_skills },
        { label: "Pipeline de Projetos Futuros", value: diagnostico.pipeline_projetos },
        { label: "Como nos descobriu", value: diagnostico.fonte_descoberta },
      ]
    },
  ];

  // Verificar se há pelo menos um item preenchido
  const hasData = sections.some(section => 
    section.items.some(item => item.value)
  );

  if (!hasData) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center gap-2 mb-6">
        <ClipboardList className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Resumo do Diagnóstico</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {sections.map(section => {
          const filledItems = section.items.filter(i => i.value);
          if (filledItems.length === 0) return null;
          
          return (
            <div key={section.title} className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground/90 border-b border-border pb-2">
                {section.title}
              </h3>
              <div className="space-y-2">
                {filledItems.map(item => (
                  <div key={item.label}>
                    <span className="text-muted-foreground text-sm">{item.label}:</span>
                    <p className="text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
