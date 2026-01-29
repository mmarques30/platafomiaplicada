import { z } from "zod";

// ============================================
// ACADEMY SCHEMA - Foco em Objetivos, Upsell e Relacionamento
// ============================================

// Step 1: Perfil e Motivação de Compra
export const academyStep1Schema = z.object({
  // nome_completo vem do perfil autenticado
  profissao: z.string().min(2, "Profissão é obrigatória"),
  area_atuacao: z.string().min(1, "Selecione uma área"),
  area_atuacao_outro: z.string().optional(),
  como_conheceu_iaplicada: z.string().min(1, "Selecione como nos conheceu"),
  motivo_compra: z.string().min(10, "Descreva o que te motivou"),
  expectativa_produto: z.string().min(10, "Descreva o que espera conquistar"),
});

// Step 2: Experiência com IA
export const academyStep2Schema = z.object({
  nivel_ia: z.string().min(1, "Selecione seu nível"),
  ferramentas_ia: z.array(z.string()).default([]),
  outras_ferramentas: z.string().optional(),
  frequencia_uso_ia: z.string().min(1, "Selecione a frequência"),
  maior_dificuldade_ia: z.string().optional(),
  ja_fez_curso_ia: z.string().optional(),
  resultado_curso_anterior: z.string().optional(),
});

// Step 3: Objetivos e Resultados
export const academyStep3Schema = z.object({
  objetivo_principal: z.string().min(1, "Selecione o objetivo principal"),
  area_aplicacao_ia: z.string().min(3, "Descreva a área de aplicação"),
  resultado_esperado_30_dias: z.string().min(10, "Descreva sua vitória em 30 dias"),
  como_medir_sucesso: z.string().min(10, "Como você vai medir o sucesso?"),
});

// Step 4: Contexto e Potencial de Expansão (Upsell)
export const academyStep4Schema = z.object({
  maior_desafio_profissional: z.string().min(5, "Descreva seu maior desafio"),
  tempo_disponivel: z.string().min(1, "Selecione o tempo disponível"),
  tarefa_repetitiva_automatizar: z.string().optional(),
  trabalha_em_empresa: z.string().min(1, "Selecione uma opção"),
  equipe_poderia_usar_ia: z.string().optional(), // Trigger Skills
  interesse_projeto_customizado: z.string().optional(), // Trigger Business
});

// Step 5: Comprometimento e Relacionamento
export const academyStep5Schema = z.object({
  estilo_aprendizagem: z.string().min(1, "Selecione o estilo de aprendizagem"),
  nivel_comprometimento: z.number().min(1).max(10),
  quick_wins: z.array(z.string()).default([]),
  importancia_ia_carreira: z.number().min(1).max(10).optional(),
  recomendaria_amigo: z.string().optional(), // NPS
  preferencia_contato: z.string().optional(),
});

export const academyFormSchema = z.object({
  ...academyStep1Schema.shape,
  ...academyStep2Schema.shape,
  ...academyStep3Schema.shape,
  ...academyStep4Schema.shape,
  ...academyStep5Schema.shape,
});

export type AcademyFormData = z.infer<typeof academyFormSchema>;

// ============================================
// BUSINESS SCHEMA - Foco em Entrega e Upsell
// ============================================

// Step 1: Perfil e Contexto (nome_completo preenchido automaticamente do perfil)
export const businessStep1Schema = z.object({
  nome_completo: z.string().optional(), // Preenchido automaticamente do perfil autenticado
  cargo_atual: z.string().min(2, "Cargo é obrigatório"),
  empresa_nome: z.string().min(2, "Nome da empresa é obrigatório"),
  tamanho_empresa: z.string().min(1, "Selecione o tamanho da empresa"),
  tem_equipe: z.boolean().optional(),
  tamanho_equipe: z.number().optional(),
  como_conheceu_iaplicada: z.string().optional(), // NOVO
  desafio_principal_negocio: z.string().optional(), // NOVO
});

// Step 2: O Que Precisa Ser Construído (mantém igual)
export const businessStep2Schema = z.object({
  problema_principal: z.string().min(10, "Descreva o problema que quer resolver"),
  processo_automatizar: z.string().min(10, "Descreva o processo/tarefa"),
  resultado_esperado: z.string().min(10, "Descreva o resultado esperado"),
  ja_tentou_antes: z.string().optional(),
});

// Step 3: Visão de Impacto (novo - campos estratégicos)
export const businessStep3Schema = z.object({
  // Novos campos estratégicos
  impacto_financeiro_estimado: z.string().optional(),
  outras_areas_potencial: z.string().optional(),
  kpi_principal: z.string().optional(),
  orcamento_expansao: z.string().optional(),
  // Campos legados (mantidos para compatibilidade)
  urgencia_solucao: z.string().optional(),
  sistemas_integrar: z.array(z.string()).default([]),
  outros_sistemas: z.string().optional(),
  quem_vai_usar: z.string().optional(),
  volume_uso: z.string().optional(),
});

// Step 4: Tomada de Decisão (novo - stakeholders)
export const businessStep4Schema = z.object({
  // Novos campos de decisão
  decisores_tecnologia: z.string().optional(),
  decisor_especifico: z.string().optional(),
  motivo_escolha_iaplicada: z.string().optional(),
  experiencia_consultorias: z.string().optional(),
  // Campos legados (mantidos para compatibilidade)
  preferencia_acompanhamento: z.string().optional(),
  nivel_envolvimento: z.string().optional(),
  outros_decisores: z.string().optional(),
  preferencia_comunicacao: z.string().optional(),
});

// Step 5: Interesse em Expansão (novo - foco em Skills upsell)
export const businessStep5Schema = z.object({
  // Novos campos de expansão
  interesse_alem_entrega: z.array(z.string()).default([]),
  areas_futuro_ia: z.array(z.string()).default([]),
  proximo_projeto_ia: z.string().optional(),
  pessoas_para_capacitar_skills: z.string().optional(),
  // Campos legados (mantidos para compatibilidade)
  quer_aprender: z.string().optional(),
  o_que_aprender: z.string().optional(),
  equipe_precisa_aprender: z.string().optional(),
  quantos_capacitar: z.number().optional(),
  disponibilidade_treinamento: z.string().optional(),
});

// Step 6: Sucesso e Parceria (novo - retenção)
export const businessStep6Schema = z.object({
  // Novos campos de sucesso
  definicao_sucesso: z.string().optional(),
  gatilho_renovacao: z.string().optional(),
  importancia_projeto: z.number().min(1).max(10).optional(),
  agendar_call_alinhamento: z.string().optional(),
  // Campos legados (mantidos para compatibilidade)
  como_medir_sucesso: z.string().optional(),
  maior_preocupacao: z.string().optional(),
  vitoria_30_dias: z.string().optional(),
  nao_pode_acontecer: z.string().optional(),
});

export const businessFormSchema = z.object({
  ...businessStep1Schema.shape,
  ...businessStep2Schema.shape,
  ...businessStep3Schema.shape,
  ...businessStep4Schema.shape,
  ...businessStep5Schema.shape,
  ...businessStep6Schema.shape,
});

export type BusinessFormData = z.infer<typeof businessFormSchema>;

// ============================================
// LEGACY SCHEMA - Manter compatibilidade
// ============================================

// Step 1: Informações Pessoais
export const step1Schema = z.object({
  nome_completo: z.string().min(3, "Nome completo é obrigatório"),
  idade: z.number().min(18, "Idade mínima: 18").max(100, "Idade máxima: 100"),
  linkedin: z.string().url("URL inválida").optional().or(z.literal("")),
  profissao: z.string().min(2, "Profissão é obrigatória"),
  area_atuacao: z.string().min(1, "Selecione uma área"),
  area_atuacao_outro: z.string().optional(),
  tempo_experiencia: z.string().min(1, "Selecione o tempo de experiência"),
  tamanho_empresa: z.string().min(1, "Selecione o tamanho da empresa"),
  lidera_equipe: z.boolean().optional(),
  tamanho_equipe: z.number().optional(),
});

// Step 2: Experiência com IA
export const step2Schema = z.object({
  nivel_ia: z.string().min(1, "Selecione seu nível"),
  ferramentas_ia: z.array(z.string()).default([]),
  outras_ferramentas: z.string().optional(),
  frequencia_uso_ia: z.string().min(1, "Selecione a frequência"),
  experiencia_ia: z.string().optional(),
  maior_dificuldade_ia: z.string().optional(),
});

// Step 3: Objetivos
export const step3Schema = z.object({
  objetivo_principal: z.string().min(1, "Selecione o objetivo principal"),
  objetivo_especifico: z.string().optional(),
  area_aplicacao_ia: z.string().min(3, "Descreva a área de aplicação"),
  meta_3_meses: z.string().min(10, "Descreva sua meta de 3 meses"),
  meta_12_meses: z.string().min(10, "Descreva sua meta de 12 meses"),
  metricas_sucesso: z.string().optional(),
});

// Step 4: Cenário Atual
export const step4Schema = z.object({
  desafio_1: z.string().min(5, "Descreva o primeiro desafio"),
  desafio_2: z.string().min(5, "Descreva o segundo desafio"),
  desafio_3: z.string().min(5, "Descreva o terceiro desafio"),
  tempo_disponivel: z.string().min(1, "Selecione o tempo disponível"),
  maior_ladrao_tempo: z.string().min(10, "Descreva o maior ladrão de tempo"),
  nivel_autonomia: z.string().min(1, "Selecione o nível de autonomia"),
  processo_otimizar: z.string().optional(),
});

// Step 5: Estilo de Aprendizagem
export const step5Schema = z.object({
  estilo_aprendizagem: z.string().min(1, "Selecione o estilo de aprendizagem"),
  preferencia_aprendizado: z.string().min(1, "Selecione a preferência"),
  melhor_horario: z.string().min(1, "Selecione o melhor horário"),
  tipo_feedback: z.string().min(1, "Selecione o tipo de feedback"),
  limitacoes_tecnicas: z.string().optional(),
});

// Step 6: Comprometimento e Limites
export const step6Schema = z.object({
  motivacao_mentoria: z.string().optional(),
  maior_medo_ia: z.string().optional(),
  nivel_comprometimento: z.number().min(1).max(10),
  zona_conforto: z.string().min(1, "Selecione uma opção"),
  nao_negociaveis: z.string().optional(),
});

// Step 7: Prioridades
export const step7Schema = z.object({
  tipo_suporte: z.string().optional(),
  frequencia_feedback: z.string().optional(),
  preferencia_sessoes: z.string().optional(),
  duvidas_preocupacoes: z.string().optional(),
  vitoria_30_dias: z.string().optional(),
  quick_wins: z.array(z.string()).default([]),
});

// Schema completo (legacy - mantém compatibilidade)
export const formSchema = z.object({
  ...step1Schema.shape,
  ...step2Schema.shape,
  ...step3Schema.shape,
  ...step4Schema.shape,
  ...step5Schema.shape,
  ...step6Schema.shape,
  ...step7Schema.shape,
});

export type FormData = z.infer<typeof formSchema>;
