// Template de cláusulas do contrato IAplicada Business

export const CONTRATADA = {
  nome: "MARIANA MARQUES CABRAL",
  cnpj: "61.687.484/0001-83",
  endereco: "Rua Fradique Coutinho, 1298, casa 2 – Pinheiros, São Paulo – SP, CEP 05416-012"
};

export const MODULOS_DISPONIVEIS = [
  "CRM",
  "Financeiro", 
  "Estoque",
  "RH",
  "Projetos",
  "Compras",
  "Produção",
  "BI Avançado",
  "Agente IA",
  "IA Conversacional",
  "Geração de Documentos"
];

export const TABELA_MANUTENCAO_PADRAO = [
  { nivel: "Básico", percentual: "3%", descricao: "Suporte via chat, atualizações de segurança" },
  { nivel: "Intermediário", percentual: "5%", descricao: "Suporte prioritário, 2 reuniões mensais" },
  { nivel: "Premium", percentual: "8%", descricao: "Suporte 24/7, reuniões ilimitadas, consultoria contínua" }
];

export const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return "R$ 0,00";
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
};

export const formatDate = (date: string | null | undefined): string => {
  if (!date) return "___/___/______";
  try {
    return new Date(date).toLocaleDateString('pt-BR');
  } catch {
    return "___/___/______";
  }
};

export interface ContratoData {
  // Contratante
  razao_social?: string | null;
  cnpj?: string | null;
  endereco?: string | null;
  representante_nome?: string | null;
  representante_cpf?: string | null;
  representante_rg?: string | null;
  representante_email?: string | null;
  
  // Contrato
  data_inicio?: string | null;
  data_fim?: string | null;
  data_assinatura?: string | null;
  tempo_consultoria_meses?: number | null;
  modulos_contratados?: number | null;
  reunioes_mensais?: number | null;
  reports_frequencia?: string | null;
  suporte_tipo?: string | null;
  modulos_selecionados?: string[];
  
  // Valores
  valor_contrato?: number | null;
  valor_entrada?: number | null;
  numero_parcelas?: number | null;
  valor_parcela?: number | null;
  creditos_iniciais?: number | null;
  valor_credito_adicional?: number | null;
  duracao_academy_meses?: number | null;
  roi_projetado?: number | null;
  multa_rescisao_percentual?: number | null;
  valor_hora_tecnica?: number | null;
  
  // Entregas
  entregas_esperadas?: Array<{
    titulo: string;
    tipo: string;
    prazo: string;
    status: string;
  }>;
}

export const gerarClausulas = (data: ContratoData): string[] => {
  const modulos = data.modulos_selecionados?.join(", ") || "Conforme proposta";
  
  return [
    // Cláusula 1
    `CLÁUSULA PRIMEIRA – DO OBJETO
A CONTRATADA prestará à CONTRATANTE os serviços de consultoria estratégica e técnica especializada na implementação de soluções de gestão empresarial potencializadas por Inteligência Artificial, conforme detalhamento abaixo:

1.1. Diagnóstico, personalização, implantação e treinamento para ${data.modulos_contratados || "___"} módulos do sistema, incluindo integrações com ferramentas de IA generativa.

1.2. Módulos contratados: ${modulos}.

1.3. Entrega de automações baseadas em IA, fluxos de trabalho inteligentes e relatórios personalizados com análise preditiva.`,

    // Cláusula 2
    `CLÁUSULA SEGUNDA – DA VIGÊNCIA
2.1. O presente contrato terá vigência de ${data.tempo_consultoria_meses || "___"} meses, com início em ${formatDate(data.data_inicio)} e término em ${formatDate(data.data_fim)}.

2.2. Ao término da vigência, a CONTRATANTE terá acesso por ${data.duracao_academy_meses || 12} meses à plataforma Academy da IAplicada, com conteúdos atualizados sobre IA, gestão e automação empresarial.`,

    // Cláusula 3
    `CLÁUSULA TERCEIRA – DAS OBRIGAÇÕES DA CONTRATADA
A CONTRATADA se compromete a:

3.1. Realizar diagnóstico completo das necessidades da empresa e propor soluções personalizadas com IA.

3.2. Realizar até ${data.reunioes_mensais || "___"} reuniões mensais de acompanhamento (online ou presencial, conforme alinhado).

3.3. Fornecer reports de progresso com frequência ${data.reports_frequencia || "quinzenal"}.

3.4. Disponibilizar suporte via ${data.suporte_tipo || "chat/email"} para dúvidas operacionais durante a vigência.

3.5. Entregar documentação técnica e manuais de uso para cada módulo implantado.`,

    // Cláusula 4
    `CLÁUSULA QUARTA – DAS OBRIGAÇÕES DA CONTRATANTE
A CONTRATANTE se compromete a:

4.1. Disponibilizar as informações e acessos necessários para a execução dos serviços.

4.2. Designar um responsável interno para acompanhamento e validação das entregas.

4.3. Garantir a participação dos colaboradores envolvidos nos treinamentos agendados.

4.4. Efetuar os pagamentos nas datas acordadas.`,

    // Cláusula 5
    `CLÁUSULA QUINTA – DOS VALORES E FORMA DE PAGAMENTO
5.1. Pelo serviço descrito, a CONTRATANTE pagará à CONTRATADA o valor total de ${formatCurrency(data.valor_contrato)}.

5.2. Forma de pagamento:
   • Entrada (20%): ${formatCurrency(data.valor_entrada)} na assinatura deste contrato
   • Saldo: ${data.numero_parcelas || "___"} parcelas mensais de ${formatCurrency(data.valor_parcela)}

5.3. A CONTRATANTE terá direito a ${data.creditos_iniciais || 300} créditos de IA inclusos. Créditos adicionais: ${formatCurrency(data.valor_credito_adicional)} por crédito.

5.4. Pagamentos via Pix, transferência bancária ou boleto. Atrasos geram multa de 2% + juros de 1% ao mês.`,

    // Cláusula 6
    `CLÁUSULA SEXTA – DA PROPRIEDADE INTELECTUAL
6.1. As soluções desenvolvidas especificamente para a CONTRATANTE serão de sua propriedade após quitação integral.

6.2. Ferramentas, metodologias e frameworks proprietários da CONTRATADA permanecem sob sua titularidade.

6.3. A CONTRATANTE autoriza a CONTRATADA a utilizar seu caso como referência comercial, preservando informações confidenciais.`,

    // Cláusula 7
    `CLÁUSULA SÉTIMA – DA CONFIDENCIALIDADE
7.1. As partes se comprometem a manter sigilo sobre todas as informações confidenciais trocadas durante a execução do contrato.

7.2. Esta obrigação permanece válida por 2 (dois) anos após o término do contrato.

7.3. Não são consideradas confidenciais informações que se tornem públicas sem culpa das partes.`,

    // Cláusula 8
    `CLÁUSULA OITAVA – DA RESCISÃO
8.1. O contrato poderá ser rescindido por qualquer das partes mediante aviso prévio de 30 dias.

8.2. Em caso de rescisão antecipada por iniciativa da CONTRATANTE, será devida multa de ${data.multa_rescisao_percentual || 30}% sobre o saldo restante.

8.3. A rescisão por inadimplência não exclui a cobrança dos valores devidos.`,

    // Cláusula 9
    `CLÁUSULA NONA – DA MANUTENÇÃO E SUPORTE CONTINUADO
9.1. Após a vigência inicial, a CONTRATANTE poderá optar por contrato de manutenção mensal:

   • Básico (3%): Suporte via chat, atualizações de segurança
   • Intermediário (5%): Suporte prioritário, 2 reuniões mensais
   • Premium (8%): Suporte 24/7, reuniões ilimitadas, consultoria contínua

9.2. Percentuais calculados sobre o valor total do contrato original.

9.3. Serviços adicionais: hora técnica a ${formatCurrency(data.valor_hora_tecnica)}.`,

    // Cláusula 10
    `CLÁUSULA DÉCIMA – DAS DISPOSIÇÕES GERAIS
10.1. Este contrato não estabelece vínculo empregatício entre as partes.

10.2. Alterações devem ser formalizadas por escrito e assinadas por ambas as partes.

10.3. A tolerância de uma parte não implica renúncia aos direitos previstos neste instrumento.`,

    // Cláusula 11
    `CLÁUSULA DÉCIMA PRIMEIRA – DO FORO
11.1. Fica eleito o foro da Comarca de São Paulo/SP para dirimir quaisquer questões oriundas deste contrato, renunciando as partes a qualquer outro, por mais privilegiado que seja.`
  ];
};
