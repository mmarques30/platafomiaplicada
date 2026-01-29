import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  academyStep1Schema, 
  academyStep2Schema, 
  academyStep3Schema, 
  academyStep4Schema, 
  academyStep5Schema,
  businessStep1Schema,
  businessStep2Schema,
  businessStep3Schema,
  businessStep4Schema,
  businessStep5Schema,
  businessStep6Schema,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
} from "@/components/mentoria/schema";

type DiagnosticoTipo = 'academy' | 'business' | 'legacy';

interface DiagnosticoPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: DiagnosticoTipo;
}

// Mapeamento de campos para labels legíveis
const FIELD_LABELS: Record<string, string> = {
  nome_completo: "Nome completo",
  idade: "Idade",
  linkedin: "LinkedIn",
  profissao: "Profissão",
  area_atuacao: "Área de atuação",
  area_atuacao_outro: "Outra área (especifique)",
  tempo_experiencia: "Tempo de experiência",
  tamanho_empresa: "Tamanho da empresa",
  lidera_equipe: "Lidera equipe?",
  tamanho_equipe: "Tamanho da equipe",
  nivel_ia: "Nível de conhecimento em IA",
  ferramentas_ia: "Ferramentas de IA que usa",
  outras_ferramentas: "Outras ferramentas",
  frequencia_uso_ia: "Frequência de uso de IA",
  experiencia_ia: "Experiência com IA",
  maior_dificuldade_ia: "Maior dificuldade com IA",
  objetivo_principal: "Objetivo principal",
  objetivo_especifico: "Objetivo específico",
  area_aplicacao_ia: "Área de aplicação da IA",
  meta_3_meses: "Meta para 3 meses",
  meta_12_meses: "Meta para 12 meses",
  metricas_sucesso: "Métricas de sucesso",
  projetos_pessoais: "Projetos pessoais",
  desafio_1: "Primeiro desafio",
  desafio_2: "Segundo desafio",
  desafio_3: "Terceiro desafio",
  tempo_disponivel: "Tempo disponível",
  maior_ladrao_tempo: "Maior ladrão de tempo",
  nivel_autonomia: "Nível de autonomia",
  processo_otimizar: "Processo a otimizar",
  estilo_aprendizagem: "Estilo de aprendizagem",
  preferencia_aprendizado: "Preferência de aprendizado",
  melhor_horario: "Melhor horário",
  tipo_feedback: "Tipo de feedback preferido",
  limitacoes_tecnicas: "Limitações técnicas",
  motivacao_mentoria: "Motivação para mentoria",
  maior_medo_ia: "Maior medo com IA",
  nivel_comprometimento: "Nível de comprometimento (1-10)",
  zona_conforto: "Zona de conforto",
  nao_negociaveis: "Não negociáveis",
  tipo_suporte: "Tipo de suporte",
  frequencia_feedback: "Frequência de feedback",
  preferencia_sessoes: "Preferência de sessões",
  duvidas_preocupacoes: "Dúvidas e preocupações",
  vitoria_30_dias: "Vitória em 30 dias",
  quick_wins: "Quick wins esperados",
  // Business specific - Legacy
  cargo_atual: "Cargo atual",
  empresa_nome: "Nome da empresa",
  tem_equipe: "Tem equipe?",
  problema_principal: "Problema principal",
  processo_automatizar: "Processo a automatizar",
  resultado_esperado: "Resultado esperado",
  ja_tentou_antes: "Já tentou antes?",
  urgencia_solucao: "Urgência da solução",
  sistemas_integrar: "Sistemas para integrar",
  outros_sistemas: "Outros sistemas",
  quem_vai_usar: "Quem vai usar",
  volume_uso: "Volume de uso",
  preferencia_acompanhamento: "Preferência de acompanhamento",
  nivel_envolvimento: "Nível de envolvimento",
  outros_decisores: "Outros decisores",
  preferencia_comunicacao: "Preferência de comunicação",
  quer_aprender: "Quer aprender?",
  o_que_aprender: "O que quer aprender",
  equipe_precisa_aprender: "Equipe precisa aprender?",
  quantos_capacitar: "Quantos capacitar",
  disponibilidade_treinamento: "Disponibilidade para treinamento",
  como_medir_sucesso: "Como medir sucesso",
  maior_preocupacao: "Maior preocupação",
  nao_pode_acontecer: "O que não pode acontecer",
  // Business specific - Novos campos
  como_conheceu_iaplicada: "Como conheceu a IAplicada",
  desafio_principal_negocio: "Desafio principal do negócio",
  impacto_financeiro_estimado: "Impacto financeiro estimado",
  outras_areas_potencial: "Outras áreas com potencial",
  kpi_principal: "KPI principal",
  orcamento_expansao: "Orçamento para expansão",
  decisores_tecnologia: "Decisores de tecnologia",
  decisor_especifico: "Decisor específico",
  motivo_escolha_iaplicada: "Motivo da escolha IAplicada",
  experiencia_consultorias: "Experiência com consultorias",
  interesse_alem_entrega: "Interesse além da entrega",
  areas_futuro_ia: "Áreas para IA no futuro",
  proximo_projeto_ia: "Próximo projeto de IA",
  pessoas_para_capacitar_skills: "Pessoas para capacitar (Skills)",
  definicao_sucesso: "Definição de sucesso",
  gatilho_renovacao: "Gatilho para renovação",
  importancia_projeto: "Importância do projeto (1-10)",
  agendar_call_alinhamento: "Agendar call de alinhamento",
};

// Configuração das etapas por tipo
const ETAPAS_CONFIG = {
  academy: [
    { titulo: "Perfil Profissional", schema: academyStep1Schema },
    { titulo: "Experiência com IA", schema: academyStep2Schema },
    { titulo: "Objetivos de Aprendizado", schema: academyStep3Schema },
    { titulo: "Desafios e Tempo", schema: academyStep4Schema },
    { titulo: "Comprometimento", schema: academyStep5Schema },
  ],
  business: [
    { titulo: "Perfil e Contexto", schema: businessStep1Schema },
    { titulo: "O Que Precisa Ser Construído", schema: businessStep2Schema },
    { titulo: "Visão de Impacto", schema: businessStep3Schema },
    { titulo: "Tomada de Decisão", schema: businessStep4Schema },
    { titulo: "Interesse em Expansão", schema: businessStep5Schema },
    { titulo: "Sucesso e Parceria", schema: businessStep6Schema },
  ],
  legacy: [
    { titulo: "Informações Pessoais", schema: step1Schema },
    { titulo: "Experiência com IA", schema: step2Schema },
    { titulo: "Objetivos", schema: step3Schema },
    { titulo: "Cenário Atual", schema: step4Schema },
    { titulo: "Estilo de Aprendizagem", schema: step5Schema },
    { titulo: "Comprometimento e Limites", schema: step6Schema },
    { titulo: "Prioridades", schema: step7Schema },
  ],
};

const TITULOS = {
  academy: "Diagnóstico Academy",
  business: "Diagnóstico Business",
  legacy: "Diagnóstico Mentoria (Legado)",
};

export function DiagnosticoPreviewModal({ 
  open, 
  onOpenChange, 
  tipo 
}: DiagnosticoPreviewModalProps) {
  const etapas = ETAPAS_CONFIG[tipo];
  const titulo = TITULOS[tipo];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {titulo}
            <Badge variant="outline">{etapas.length} etapas</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {etapas.map((etapa, index) => {
              // Extrair campos do schema
              const campos = Object.keys(etapa.schema.shape);
              
              return (
                <div key={index}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-aplicada-green-700 text-white flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <h3 className="font-semibold text-foreground">{etapa.titulo}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {campos.length} campos
                    </Badge>
                  </div>
                  
                  <div className="pl-8 space-y-2">
                    {campos.map((campo) => (
                      <div key={campo} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground">•</span>
                        <span className="text-foreground">
                          {FIELD_LABELS[campo] || campo}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {index < etapas.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
