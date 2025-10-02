import { z } from "zod";

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

// Step 6: Motivação
export const step6Schema = z.object({
  motivacao_mentoria: z.string().min(20, "Descreva sua motivação (mínimo 20 caracteres)"),
  maior_medo_ia: z.string().optional(),
  nivel_comprometimento: z.number().min(1).max(10),
  zona_conforto: z.string().min(1, "Selecione uma opção"),
  nao_negociaveis: z.string().optional(),
});

// Step 7: Expectativas
export const step7Schema = z.object({
  tipo_suporte: z.string().min(1, "Selecione o tipo de suporte"),
  frequencia_feedback: z.string().min(1, "Selecione a frequência"),
  preferencia_sessoes: z.string().min(1, "Selecione a preferência"),
  duvidas_preocupacoes: z.string().optional(),
  vitoria_30_dias: z.string().optional(),
  quick_wins: z.array(z.string()).default([]),
});

// Schema completo
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
