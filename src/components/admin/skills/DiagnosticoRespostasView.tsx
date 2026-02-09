import { Badge } from "@/components/ui/badge";

interface Props {
  dados: Record<string, any>;
}

const SECOES = [
  {
    titulo: "Perfil",
    campos: [
      { key: "cargo", label: "Cargo" },
      { key: "area_atuacao", label: "Área de atuação" },
      { key: "tempo_na_empresa", label: "Tempo na função" },
      { key: "ferramentas_atuais", label: "Ferramentas", type: "array" },
    ],
  },
  {
    titulo: "Rotina",
    campos: [
      { key: "horas_repetitivas", label: "Horas repetitivas/semana" },
      { key: "atividade_principal", label: "Atividade principal" },
      { key: "frequencia_atividade", label: "Frequência" },
      { key: "tempo_gasto", label: "Tempo gasto por vez" },
    ],
  },
  {
    titulo: "Objetivos",
    campos: [
      { key: "objetivos_ia", label: "Objetivos com IA", type: "tags" },
      { key: "resultado_sucesso", label: "Resultado de sucesso" },
      { key: "autonomia", label: "Autonomia" },
    ],
  },
  {
    titulo: "Contexto Técnico",
    campos: [
      { key: "nivel_tecnico", label: "Nível técnico" },
      { key: "ferramentas_automacao", label: "Ferramentas automação", type: "tags" },
      { key: "uso_ia", label: "Uso de IA" },
    ],
  },
  {
    titulo: "Disponibilidade",
    campos: [
      { key: "horas_semana", label: "Horas/semana" },
      { key: "melhor_horario", label: "Melhor horário", type: "tags" },
      { key: "preferencia_conteudo", label: "Preferência" },
    ],
  },
  {
    titulo: "Empresa",
    campos: [
      { key: "tamanho_area", label: "Tamanho da área" },
      { key: "sistemas_erp", label: "Sistemas ERP", type: "tags" },
      { key: "iniciativas_ia", label: "Iniciativas IA" },
      { key: "maturidade_digital", label: "Maturidade digital" },
    ],
  },
  {
    titulo: "Desafios",
    campos: [
      { key: "desafios", label: "Desafios", type: "tags" },
      { key: "processo_colaborativo", label: "Processo colaborativo" },
      { key: "automatizar_empresa", label: "O que automatizaria" },
    ],
  },
  {
    titulo: "Organizacional",
    campos: [
      { key: "apoio_lideranca", label: "Apoio da liderança" },
      { key: "restricoes_ti", label: "Restrições de TI" },
      { key: "objetivo_programa", label: "Objetivos do programa", type: "tags" },
      { key: "areas_automacao", label: "Áreas automação", type: "tags" },
    ],
  },
  {
    titulo: "Expectativas",
    campos: [
      { key: "resultado_equipe", label: "Resultado equipe" },
      { key: "projeto_colaborativo", label: "Projeto colaborativo" },
      { key: "barreiras", label: "Barreiras" },
    ],
  },
];

function renderValue(value: any, type?: string): React.ReactNode {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return <span className="text-muted-foreground/50 text-xs italic">Não preenchido</span>;
  }

  if (type === "tags" && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((v: any, i: number) => (
          <Badge key={i} variant="secondary" className="text-xs">
            {typeof v === "string" ? v : v?.nome || JSON.stringify(v)}
          </Badge>
        ))}
      </div>
    );
  }

  if (type === "array" && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((v: any, i: number) => (
          <Badge key={i} variant="outline" className="text-xs">
            {typeof v === "string" ? v : v?.nome || JSON.stringify(v)}
          </Badge>
        ))}
      </div>
    );
  }

  if (typeof value === "string") return <span className="text-sm">{value}</span>;
  return <span className="text-sm">{JSON.stringify(value)}</span>;
}

export default function DiagnosticoRespostasView({ dados }: Props) {
  // Processos detalhados (seção especial)
  const processos = Array.isArray(dados.processos_detalhados) ? dados.processos_detalhados : [];

  return (
    <div className="space-y-4">
      {SECOES.map((secao) => {
        const temDados = secao.campos.some((c) => {
          const v = dados[c.key];
          return v && (!Array.isArray(v) || v.length > 0);
        });
        if (!temDados) return null;

        return (
          <div key={secao.titulo} className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{secao.titulo}</p>
            <div className="grid gap-2">
              {secao.campos.map((campo) => (
                <div key={campo.key} className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground min-w-[120px] pt-0.5">{campo.label}:</span>
                  <div className="flex-1">{renderValue(dados[campo.key], campo.type)}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {processos.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Processos Detalhados</p>
          {processos.map((p: any, i: number) => (
            <div key={i} className="p-2 bg-muted/30 rounded text-xs space-y-1">
              <p className="font-medium">{p.nome || `Processo ${i + 1}`}</p>
              {p.passos && <p className="text-muted-foreground">Passos: {p.passos}</p>}
              <div className="flex gap-3 text-muted-foreground">
                {p.frequencia && <span>Freq: {p.frequencia}</span>}
                {p.tempo && <span>Tempo: {p.tempo}</span>}
                {p.impacto && <span>Impacto: {p.impacto}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
