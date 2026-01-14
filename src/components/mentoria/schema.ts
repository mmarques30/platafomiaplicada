import { z } from "zod";

// ============================================
// ACADEMY SCHEMA - Foco em Aprendizado Pessoal
// ============================================

// Step 1: Perfil Profissional
export const academyStep1Schema = z.object({
  nome_completo: z.string().min(3, "Nome completo é obrigatório"),
  idade: z.number().min(18, "Idade mínima: 18").max(100, "Idade máxima: 100"),
  linkedin: z.string().url("URL inválida").optional().or(z.literal("")),
  profissao: z.string().min(2, "Profissão é obrigatória"),
  area_atuacao: z.string().min(1, "Selecione uma área"),
  area_atuacao_outro: z.string().optional(),
  tempo_experiencia: z.string().min(1, "Selecione o tempo de experiência"),
});

// Step 2: Experiência com IA
export const academyStep2Schema = z.object({
  nivel_ia: z.string().min(1, "Selecione seu nível"),
  ferramentas_ia: z.array(z.string()).default([]),
  outras_ferramentas: z.string().optional(),
  frequencia_uso_ia: z.string().min(1, "Selecione a frequência"),
  maior_dificuldade_ia: z.string().optional(),
});

// Step 3: Objetivos de Aprendizado
export const academyStep3Schema = z.object({
  objetivo_principal: z.string().min(1, "Selecione o objetivo principal"),
  objetivo_especifico: z.string().optional(),
  area_aplicacao_ia: z.string().min(3, "Descreva a área de aplicação"),
  meta_3_meses: z.string().min(10, "Descreva sua meta de 3 meses"),
  projetos_pessoais: z.string().optional(),
});

// Step 4: Desafios e Tempo
export const academyStep4Schema = z.object({
  desafio_1: z.string().min(5, "Descreva o primeiro desafio"),
  desafio_2: z.string().min(5, "Descreva o segundo desafio"),
  desafio_3: z.string().min(5, "Descreva o terceiro desafio"),
  tempo_disponivel: z.string().min(1, "Selecione o tempo disponível"),
  maior_ladrao_tempo: z.string().min(10, "Descreva o maior ladrão de tempo"),
});

// Step 5: Comprometimento
export const academyStep5Schema = z.object({
  estilo_aprendizagem: z.string().min(1, "Selecione o estilo de aprendizagem"),
  preferencia_aprendizado: z.string().min(1, "Selecione a preferência"),
  nivel_comprometimento: z.number().min(1).max(10),
  quick_wins: z.array(z.string()).default([]),
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
// BUSINESS SCHEMA - Foco em Entrega e Acompanhamento
// ============================================

// Step 1: Perfil do Cliente
export const businessStep1Schema = z.object({
  nome_completo: z.string().min(3, "Nome completo é obrigatório"),
  cargo_atual: z.string().min(2, "Cargo é obrigatório"),
  empresa_nome: z.string().min(2, "Nome da empresa é obrigatório"),
  tamanho_empresa: z.string().min(1, "Selecione o tamanho da empresa"),
  tem_equipe: z.boolean().optional(),
  tamanho_equipe: z.number().optional(),
});

// Step 2: O Que Precisa Ser Construído
export const businessStep2Schema = z.object({
  problema_principal: z.string().min(10, "Descreva o problema que quer resolver"),
  processo_automatizar: z.string().min(10, "Descreva o processo/tarefa"),
  resultado_esperado: z.string().min(10, "Descreva o resultado esperado"),
  ja_tentou_antes: z.string().optional(),
});

// Step 3: Contexto da Entrega
export const businessStep3Schema = z.object({
  urgencia_solucao: z.string().min(1, "Selecione a urgência"),
  sistemas_integrar: z.array(z.string()).default([]),
  outros_sistemas: z.string().optional(),
  quem_vai_usar: z.string().min(5, "Descreva quem vai usar"),
  volume_uso: z.string().min(1, "Selecione o volume"),
});

// Step 4: Acompanhamento do Projeto
export const businessStep4Schema = z.object({
  preferencia_acompanhamento: z.string().min(1, "Selecione como prefere acompanhar"),
  nivel_envolvimento: z.string().min(1, "Selecione seu nível de envolvimento"),
  outros_decisores: z.string().optional(),
  preferencia_comunicacao: z.string().min(1, "Selecione a preferência"),
});

// Step 5: Interesse em Aprendizado
export const businessStep5Schema = z.object({
  quer_aprender: z.string().min(1, "Selecione uma opção"),
  o_que_aprender: z.string().optional(),
  equipe_precisa_aprender: z.string().min(1, "Selecione uma opção"),
  quantos_capacitar: z.number().optional(),
  disponibilidade_treinamento: z.string().optional(),
});

// Step 6: Expectativas e Sucesso
export const businessStep6Schema = z.object({
  como_medir_sucesso: z.string().min(10, "Descreva como vai medir o sucesso"),
  maior_preocupacao: z.string().optional(),
  vitoria_30_dias: z.string().min(10, "Descreva uma vitória em 30 dias"),
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
