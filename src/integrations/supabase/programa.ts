// Tipos do programa IAplicada Indica.
//
// `types.ts` é gerado pelo Lovable e não pode ser editado na mão. Enquanto ele
// não é regerado com as tabelas do programa, o tipo mora aqui e as queries
// passam pelo helper `programa()` abaixo, que faz o cast num lugar só em vez
// de espalhar `as any` por cada hook.

import { supabase } from "./client";

export type PapelPrograma = "indicador" | "parceria_aberta" | "parceria_executora";

export type StatusConvite = "pendente" | "aceito" | "expirado" | "cancelado";

export type StatusIndicacao =
  | "nova"
  | "em_contato"
  | "qualificada"
  | "proposta"
  | "fechada"
  | "perdida";

export type TipoRecompensa = "cashback" | "bonus";

export type StatusRecompensa = "prevista" | "escolhida" | "aprovada" | "paga" | "cancelada";

export type StatusParceria = "rascunho" | "vigente" | "encerrada";

export type TipoOportunidade = "oferta" | "procura";

export interface ProgramaPapel {
  id: string;
  user_id: string;
  papel: PapelPrograma;
  vigente_de: string;
  vigente_ate: string | null;
  definido_por: string | null;
  origem_convite_id: string | null;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgramaRegra {
  papel: PapelPrograma;
  rotulo: string;
  percentual_base: number | null;
  percentual_incremento: number;
  percentual_teto: number | null;
  volume_minimo_mes: number | null;
  exige_contrato: boolean;
  renovacao_meses: number | null;
  observacao: string | null;
  updated_at: string;
}

export interface Indicacao {
  id: string;
  indicador_id: string;
  convite_id: string | null;
  empresa_nome: string;
  contato_nome: string | null;
  contato_email: string | null;
  contato_whatsapp: string | null;
  observacao: string | null;
  status: StatusIndicacao;
  responsavel_id: string | null;
  qualificada_em: string | null;
  fechada_em: string | null;
  valor_fechado: number | null;
  motivo_perda: string | null;
  created_at: string;
  updated_at: string;
}

export interface IndicacaoEvento {
  id: string;
  indicacao_id: string;
  de_status: StatusIndicacao | null;
  para_status: StatusIndicacao;
  por: string | null;
  nota: string | null;
  created_at: string;
}

export interface BonusCatalogo {
  id: string;
  nome: string;
  descricao: string | null;
  valor_referencia: number | null;
  prazo_entrega_dias: number | null;
  ativo: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface RecompensaParcela {
  id: string;
  recompensa_id: string;
  valor: number;
  previsto_para: string | null;
  pago_em: string | null;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface Recompensa {
  id: string;
  indicacao_id: string;
  beneficiario_id: string;
  tipo: TipoRecompensa | null;
  valor: number | null;
  valor_base: number | null;
  percentual: number | null;
  ordem_fechamento: number | null;
  bonus_id: string | null;
  status: StatusRecompensa;
  escolhida_em: string | null;
  aprovada_em: string | null;
  paga_em: string | null;
  observacao: string | null;
  created_at: string;
  updated_at: string;
}

export interface Parceria {
  id: string;
  user_id: string;
  papel: PapelPrograma;
  status: StatusParceria;
  contrato_url: string | null;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
  condicoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MuralOportunidade {
  id: string;
  autor_id: string;
  tipo: TipoOportunidade;
  titulo: string;
  descricao: string;
  area: string | null;
  ativo: boolean;
  expira_em: string | null;
  created_at: string;
  updated_at: string;
}

type TabelaPrograma =
  | "programa_papeis"
  | "programa_regras"
  | "convites"
  | "indicacoes"
  | "indicacao_eventos"
  | "bonus_catalogo"
  | "recompensas"
  | "recompensa_parcelas"
  | "parcerias"
  | "mural_oportunidades";

/**
 * Acesso às tabelas do programa até o `types.ts` ser regerado.
 *
 * O retorno é solto de propósito: o `Database` gerado não conhece estas
 * tabelas, e tipar o construtor de query aqui faria o TypeScript recursar sem
 * fim. A tipagem volta no fim da chamada, quando o resultado é convertido para
 * as interfaces declaradas acima. O nome da tabela continua conferido.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function programa(tabela: TabelaPrograma): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(tabela);
}

type FuncaoPrograma =
  | "tem_papel_programa"
  | "papel_vigente"
  | "percentual_da_proxima"
  | "programa_permanencia_ok";

/** Chama as funções SQL do programa com o mesmo cuidado do helper acima. */
export function chamarPrograma<T>(
  funcao: FuncaoPrograma,
  args?: Record<string, unknown>,
): PromiseLike<{ data: T | null; error: { message: string } | null }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).rpc(funcao, args);
}

const ROTULO_STATUS: Record<StatusIndicacao, string> = {
  nova: "Recebida",
  em_contato: "Em contato",
  qualificada: "Qualificada",
  proposta: "Proposta enviada",
  fechada: "Fechada",
  perdida: "Não seguiu",
};

/** O nome que a pessoa lê na tela para cada status. */
export function rotuloStatus(status: StatusIndicacao): string {
  return ROTULO_STATUS[status] ?? status;
}

/** A ordem em que o funil anda, para desenhar o progresso da indicação. */
export const ETAPAS_INDICACAO: StatusIndicacao[] = [
  "nova",
  "em_contato",
  "qualificada",
  "proposta",
  "fechada",
];

const ROTULO_PAPEL: Record<PapelPrograma, string> = {
  indicador: "Indicação Simples",
  parceria_aberta: "Parceria Aberta",
  parceria_executora: "Parceria Executora",
};

export function rotuloPapel(papel: PapelPrograma): string {
  return ROTULO_PAPEL[papel] ?? papel;
}

/** Real com centavos, do jeito que a pessoa espera ver. */
export function emReais(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "—";
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

/** Percentual com no máximo uma casa, sem zero à toa. */
export function emPercentual(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "—";
  const texto = Number(valor).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return `${texto}%`;
}
