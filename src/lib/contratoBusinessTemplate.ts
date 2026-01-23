// Template de cláusulas do contrato IAplicada Business
// Baseado nos contratos reais: Engelmig e Julie de Mattos

export const CONTRATADA = {
  nome: "MARIANA MARQUES CABRAL IAPLICADA EDUCACAO LTDA",
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
  "Agente Analista de IA",
  "IA Conversacional",
  "Geração de Documentos"
];

// Descrições detalhadas dos módulos para o contrato
export const MODULOS_DESCRICOES: Record<string, string> = {
  "CRM": "Gestão de relacionamento com clientes, parceiros e investidores.",
  "Financeiro": "Controle de transações, receitas, despesas e resultados.",
  "Estoque": "Gerenciamento de inventário e controle de materiais.",
  "RH": "Gestão de colaboradores, permissões e desempenho.",
  "Projetos": "Acompanhamento de projetos, tarefas e prazos.",
  "Compras": "Gestão de fornecedores e processos de aquisição.",
  "Produção": "Controle de processos produtivos e ordens de serviço.",
  "BI Avançado": "Dashboards e relatórios avançados para análise de dados.",
  "Agente Analista de IA": "Analista de dados interno que gera insights a partir dos dados do sistema.",
  "IA Conversacional": "Chatbots e assistentes virtuais para atendimento e processos internos.",
  "Geração de Documentos": "Criação automática de propostas, contratos e relatórios."
};

// Tabela de manutenção pós-entrega conforme contratos reais
export const TABELA_MANUTENCAO = [
  { nivel: "Inicial", modulos: "Até 3", usuarios: "Até 5", valor: 50 },
  { nivel: "Intermediário", modulos: "4 a 7", usuarios: "6 a 15", valor: 150 },
  { nivel: "Avançado", modulos: "8 a 10", usuarios: "16 a 30", valor: 300 },
  { nivel: "Corporativo", modulos: "11+", usuarios: "31+", valor: null }, // Sob consulta
];

// Manter compatibilidade com código antigo
export const TABELA_MANUTENCAO_PADRAO = TABELA_MANUTENCAO;

// Interface para entregas esperadas do contrato (genéricas, para o PDF)
export interface EntregaContratoPadrao {
  mes: number;
  titulo: string;
  descricao: string;
  tipo: string;
}

// Gera entregas padrão do contrato baseadas na quantidade de módulos e duração
export const gerarEntregasContratoPadrao = (
  modulosContratados: number,
  mesesConsultoria: number,
  dataInicio?: string | null
): EntregaContratoPadrao[] => {
  const entregas: EntregaContratoPadrao[] = [];
  
  if (!modulosContratados || !mesesConsultoria) return entregas;
  
  // Mês 1 - Sempre: Diagnóstico e Roadmap
  entregas.push({
    mes: 1,
    titulo: "Diagnóstico Completo",
    descricao: "Mapeamento de processos e identificação de oportunidades de automação",
    tipo: "diagnostico"
  });
  entregas.push({
    mes: 1,
    titulo: "Roadmap de Implementação",
    descricao: "Cronograma detalhado com marcos e entregas do projeto",
    tipo: "documento"
  });
  
  // Distribuir módulos ao longo dos meses restantes (mês 2 até penúltimo)
  const mesesDesenvolvimento = Math.max(1, mesesConsultoria - 2); // Reservar mês 1 (diag) e último (validação)
  const modulosPorMes = Math.ceil(modulosContratados / mesesDesenvolvimento);
  
  let moduloAtual = 1;
  for (let mes = 2; mes < mesesConsultoria && moduloAtual <= modulosContratados; mes++) {
    const modulosNesteMes = Math.min(modulosPorMes, modulosContratados - moduloAtual + 1);
    
    if (modulosNesteMes === 1) {
      entregas.push({
        mes,
        titulo: `Módulo ${moduloAtual} - Implementação`,
        descricao: `Desenvolvimento e configuração do módulo ${moduloAtual}`,
        tipo: "implementacao"
      });
    } else {
      entregas.push({
        mes,
        titulo: `Módulos ${moduloAtual}-${moduloAtual + modulosNesteMes - 1} - Implementação`,
        descricao: `Desenvolvimento e configuração dos módulos ${moduloAtual} a ${moduloAtual + modulosNesteMes - 1}`,
        tipo: "implementacao"
      });
    }
    
    moduloAtual += modulosNesteMes;
  }
  
  // Último mês - Sempre: Validação Final e Go-Live
  if (mesesConsultoria >= 2) {
    entregas.push({
      mes: mesesConsultoria,
      titulo: "Validação Final e Go-Live",
      descricao: "Testes finais, ajustes e entrega oficial da plataforma",
      tipo: "treinamento"
    });
  }
  
  // Treinamento (meio do projeto)
  const mesTreinamento = Math.ceil(mesesConsultoria / 2);
  if (mesTreinamento > 1 && mesTreinamento < mesesConsultoria) {
    entregas.push({
      mes: mesTreinamento,
      titulo: "Treinamento da Equipe",
      descricao: "Capacitação dos usuários nos módulos implementados",
      tipo: "treinamento"
    });
  }
  
  // Ordenar por mês
  return entregas.sort((a, b) => a.mes - b.mes);
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return "R$ 0,00";
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
};

export const formatCurrencyExtended = (value: number | null | undefined): string => {
  if (value == null) return "R$ 0,00 (zero reais)";
  const formatted = formatCurrency(value);
  const extenso = numberToWords(value);
  return `${formatted} (${extenso})`;
};

// Função auxiliar para converter número em extenso (simplificada)
function numberToWords(value: number): string {
  if (value === 0) return "zero reais";
  
  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const hundreds = ['', 'cem', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  
  const intPart = Math.floor(value);
  const decPart = Math.round((value - intPart) * 100);
  
  let result = '';
  
  if (intPart >= 1000) {
    const thousands = Math.floor(intPart / 1000);
    if (thousands === 1) {
      result += 'mil';
    } else {
      result += units[thousands] + ' mil';
    }
    const remainder = intPart % 1000;
    if (remainder > 0) {
      result += remainder < 100 ? ' e ' : ', ';
    }
  }
  
  const remainder = intPart % 1000;
  if (remainder >= 100) {
    const h = Math.floor(remainder / 100);
    if (remainder === 100) {
      result += 'cem';
    } else {
      result += hundreds[h];
    }
    const tensPart = remainder % 100;
    if (tensPart > 0) {
      result += ' e ';
    }
  }
  
  const tensPart = remainder % 100;
  if (tensPart >= 20) {
    result += tens[Math.floor(tensPart / 10)];
    if (tensPart % 10 > 0) {
      result += ' e ' + units[tensPart % 10];
    }
  } else if (tensPart >= 10) {
    result += teens[tensPart - 10];
  } else if (tensPart > 0) {
    result += units[tensPart];
  }
  
  result += intPart === 1 ? ' real' : ' reais';
  
  if (decPart > 0) {
    result += ' e ';
    if (decPart >= 10) {
      result += tens[Math.floor(decPart / 10)];
      if (decPart % 10 > 0) {
        result += ' e ' + units[decPart % 10];
      }
    } else {
      result += units[decPart];
    }
    result += decPart === 1 ? ' centavo' : ' centavos';
  }
  
  return result.trim();
}

export const formatDate = (date: string | null | undefined): string => {
  if (!date) return "___/___/______";
  try {
    return new Date(date).toLocaleDateString('pt-BR');
  } catch {
    return "___/___/______";
  }
};

export const formatDateExtended = (date: string | null | undefined): string => {
  if (!date) return "___ de __________ de ______";
  try {
    const d = new Date(date);
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
  } catch {
    return "___ de __________ de ______";
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
  observacoes?: string | null;
  
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
  
  // Entregas (mantido para compatibilidade, mas não usado no contrato)
  entregas_esperadas?: Array<{
    titulo: string;
    tipo: string;
    prazo: string;
    status: string;
  }>;
}

// Gera as 11 cláusulas conforme os contratos reais
export const gerarClausulas = (data: ContratoData): string[] => {
  const modulosSugeridos = data.modulos_selecionados?.slice(0, 3).join(", ") || "a serem definidos em conjunto";
  const temModulosSelecionados = data.modulos_selecionados && data.modulos_selecionados.length > 0;
  
  return [
    // CLÁUSULA PRIMEIRA - DO OBJETO
    `CLÁUSULA PRIMEIRA - DO OBJETO

O presente contrato tem por objeto a prestação de serviços de consultoria e desenvolvimento de uma solução de gestão personalizada, denominada IAplicada Business, que utiliza Inteligência Artificial para automatizar processos operacionais, substituir processos manuais e planilhas desorganizadas por um sistema centralizado, gerar insights e dar visibilidade completa da operação da CONTRATANTE.`,

    // CLÁUSULA SEGUNDA - DA DESCRIÇÃO DOS SERVIÇOS E METODOLOGIA
    `CLÁUSULA SEGUNDA - DA DESCRIÇÃO DOS SERVIÇOS E METODOLOGIA

A CONTRATADA se compromete a prestar os seguintes serviços durante a vigência do contrato:

Parágrafo Primeiro - Desenvolvimento da Plataforma IAplicada Business:
Construção de uma plataforma de gestão e automação inteligente, construída sob medida para a CONTRATANTE, com os seguintes módulos e funcionalidades:

MÓDULOS DISPONÍVEIS:
• CRM - Gestão de relacionamento com clientes, parceiros e investidores.
• Financeiro - Controle de transações, receitas, despesas e resultados.
• Estoque - Gerenciamento de inventário e controle de materiais.
• RH - Gestão de colaboradores, permissões e desempenho.
• Projetos - Acompanhamento de projetos, tarefas e prazos.
• Compras - Gestão de fornecedores e processos de aquisição.
• Produção - Controle de processos produtivos e ordens de serviço.
• BI Avançado - Dashboards e relatórios avançados para análise de dados.
• Agente Analista de IA - Analista de dados interno que gera insights a partir dos dados do sistema.
• IA Conversacional - Chatbots e assistentes virtuais para atendimento e processos internos.
• Geração de Documentos - Criação automática de propostas, contratos e relatórios.

Módulos Contratados: Conforme o plano de investimento, a CONTRATANTE tem direito à implementação de ${data.modulos_contratados || "___"} (${numberToWordsSimple(data.modulos_contratados)}) módulos a serem definidos em conjunto com a CONTRATADA durante a fase de diagnóstico${temModulosSelecionados ? `, sugerindo-se iniciar com: ${modulosSugeridos}` : ""}.

Parágrafo Segundo - Metodologia de Desenvolvimento e Acompanhamento (Roadmap):
• Duração do Projeto: O desenvolvimento e acompanhamento terão a duração de ${data.tempo_consultoria_meses || "___"} (${numberToWordsSimple(data.tempo_consultoria_meses)}) meses.
• Encontros Estratégicos: Serão realizados no mínimo ${data.tempo_consultoria_meses || "___"} (${numberToWordsSimple(data.tempo_consultoria_meses)}) encontros estratégicos (1 por mês), com a possibilidade de antecipação de agendas conforme a necessidade e disponibilidade da CONTRATANTE.
• Reuniões de Validação: Reuniões semanais durante a fase de desenvolvimento (primeiros 3 meses) para validação de entregas por módulo, correção de erros e ajustes finos.
• Desenvolvimento em Fases: O projeto será desenvolvido em fases, com entregas modulares validadas em conjunto com a CONTRATANTE.

Parágrafo Terceiro - Acesso à Plataforma IAplicada Academy:
A CONTRATANTE terá acesso integral à plataforma IAplicada Academy pelo período de ${data.duracao_academy_meses || 12} (${numberToWordsSimple(data.duracao_academy_meses || 12)}) ${(data.duracao_academy_meses || 12) > 1 ? "meses" : "mês"} a partir da assinatura deste contrato, incluindo todos os conteúdos educacionais, biblioteca de templates, prompts e ferramentas práticas.`,

    // CLÁUSULA TERCEIRA - DO VALOR E FORMA DE PAGAMENTO
    `CLÁUSULA TERCEIRA - DO VALOR E FORMA DE PAGAMENTO

O valor total dos serviços contratados é de ${formatCurrencyExtended(data.valor_contrato)}, a ser pago da seguinte forma:

• Entrada (20%): ${formatCurrencyExtended(data.valor_entrada)}, a ser pago na data de assinatura deste contrato.
• Saldo Remanescente: ${formatCurrencyExtended((data.valor_contrato || 0) - (data.valor_entrada || 0))}, a ser pago em ${data.numero_parcelas || "___"} (${numberToWordsSimple(data.numero_parcelas)}) parcelas mensais e consecutivas de ${formatCurrencyExtended(data.valor_parcela)}.`,

    // CLÁUSULA QUARTA - DOS CRÉDITOS DE EXECUÇÃO
    `CLÁUSULA QUARTA - DOS CRÉDITOS DE EXECUÇÃO

Parágrafo Primeiro - Pacote Inicial de Créditos:
A CONTRATANTE receberá ${data.creditos_iniciais || 300} (${numberToWordsSimple(data.creditos_iniciais || 300)}) créditos de execução inclusos no valor do contrato, destinados à construção e operação inicial da plataforma durante o período de desenvolvimento e validação.

Parágrafo Segundo - Finalidade dos Créditos:
Os créditos são destinados exclusivamente para:
• Construção e testes dos módulos contratados;
• Execução de fluxos de automação e geração de documentos;
• Operação inicial da plataforma sob orientação da CONTRATADA.

Parágrafo Terceiro - Política de Uso:
a) Os ${data.creditos_iniciais || 300} créditos iniciais não são renováveis;
b) Os créditos não utilizados durante o período de desenvolvimento não serão convertidos em valores ou transferidos.

Parágrafo Quarto - Aquisição de Créditos Adicionais:
Após o consumo dos créditos inclusos, caso haja necessidade de créditos adicionais para a operação contínua da plataforma, será acordado entre as partes para faturamento posterior ao uso, à taxa de ${formatCurrency(data.valor_credito_adicional || 1)} por crédito utilizado.`,

    // CLÁUSULA QUINTA - DAS OBRIGAÇÕES DA CONTRATADA
    `CLÁUSULA QUINTA - DAS OBRIGAÇÕES DA CONTRATADA

A CONTRATADA obriga-se a:
• Conduzir o diagnóstico, desenvolvimento, implantação e treinamento da plataforma IAplicada Business.
• Realizar os encontros estratégicos e reuniões de validação conforme acordado.
• Disponibilizar o acesso à plataforma IAplicada Academy pelo período de ${data.duracao_academy_meses || 12} (${numberToWordsSimple(data.duracao_academy_meses || 12)}) ${(data.duracao_academy_meses || 12) > 1 ? "meses" : "mês"}.
• Garantir a confidencialidade de todas as informações fornecidas pela CONTRATANTE.
• Fornecer suporte técnico e estratégico durante a vigência do contrato de ${data.tempo_consultoria_meses || "___"} (${numberToWordsSimple(data.tempo_consultoria_meses)}) meses.`,

    // CLÁUSULA SEXTA - DAS OBRIGAÇÕES DO CONTRATANTE
    `CLÁUSULA SEXTA - DAS OBRIGAÇÕES DO CONTRATANTE

O CONTRATANTE obriga-se a:
• Realizar os pagamentos nas datas e valores acordados.
• Participar ativamente dos encontros e reuniões de validação, fornecendo as informações e feedbacks necessários para o bom andamento do projeto.
• Disponibilizar os dados e informações necessárias para a construção e personalização da plataforma.
• Manter a confidencialidade sobre metodologias e ferramentas proprietárias da CONTRATADA.`,

    // CLÁUSULA SÉTIMA - DA CONFIDENCIALIDADE E PROPRIEDADE INTELECTUAL
    `CLÁUSULA SÉTIMA - DA CONFIDENCIALIDADE E PROPRIEDADE INTELECTUAL

Parágrafo Primeiro - Confidencialidade:
Ambas as partes comprometem-se a manter sigilo absoluto sobre todas as informações confidenciais trocadas durante a vigência deste contrato, incluindo estratégias de negócio, dados de clientes, informações financeiras e know-how. Esta obrigação permanecerá em vigor mesmo após o término ou rescisão do contrato.

Parágrafo Segundo - Propriedade Intelectual da CONTRATADA:
Todos os conteúdos, metodologias, frameworks, a base tecnológica da plataforma IAplicada e os materiais do Academy são de propriedade intelectual exclusiva da CONTRATADA.

Parágrafo Terceiro - Propriedade da Aplicação Personalizada:
A plataforma personalizada desenvolvida para a CONTRATANTE será inicialmente hospedada no domínio da CONTRATADA. Ao final do período de ${data.tempo_consultoria_meses || "___"} (${numberToWordsSimple(data.tempo_consultoria_meses)}) meses e quitação integral do contrato, o domínio e a propriedade da aplicação personalizada serão transferidos para a CONTRATANTE.`,

    // CLÁUSULA OITAVA - DO USO DE IMAGEM E DIVULGAÇÃO
    `CLÁUSULA OITAVA - DO USO DE IMAGEM E DIVULGAÇÃO

A CONTRATANTE autoriza a CONTRATADA a utilizar sua imagem, voz, depoimentos e os resultados gerais do projeto (sem revelar dados confidenciais) em materiais de divulgação, estudos de caso e portfólio, com o objetivo de demonstrar a metodologia e os benefícios da solução IAplicada Business. A CONTRATANTE poderá, a qualquer momento, solicitar a revisão ou remoção de materiais específicos mediante notificação por escrito.`,

    // CLÁUSULA NONA - DO SUPORTE E MANUTENÇÃO PÓS-ENTREGA
    `CLÁUSULA NONA - DO SUPORTE E MANUTENÇÃO PÓS-ENTREGA

Parágrafo Primeiro - Início do Pós-Venda:
A fase de pós-venda se inicia após a entrega final e validação formal da plataforma pela CONTRATANTE, marcando o fim do escopo de desenvolvimento inicial.

Parágrafo Segundo - Manutenção Essencial Escalável:
A partir do início do pós-venda, será cobrada uma taxa mensal de manutenção, cujo valor será definido com base na complexidade da aplicação, medida pela quantidade de módulos e usuários ativos, conforme a tabela abaixo:

TABELA DE NÍVEIS DE MANUTENÇÃO:
• Inicial: Até 3 módulos, Até 5 usuários - R$ 50,00/mês
• Intermediário: 4 a 7 módulos, 6 a 15 usuários - R$ 150,00/mês
• Avançado: 8 a 10 módulos, 16 a 30 usuários - R$ 300,00/mês
• Corporativo: 11+ módulos, 31+ usuários - Sob consulta

Parágrafo Terceiro - Finalidade da Taxa:
Esta taxa destina-se exclusivamente à manutenção da infraestrutura de hospedagem, atualizações de segurança, monitoramento e garantia de funcionamento dos componentes essenciais da plataforma.

Parágrafo Quarto - Suporte e Correções Sob Demanda:
Qualquer solicitação de suporte, correção de bugs (não críticos), ajustes ou desenvolvimento de novas funcionalidades será tratada como um serviço sob demanda, orçado e faturado separadamente, com base no valor da hora técnica de ${formatCurrency(data.valor_hora_tecnica || 250)}.`,

    // CLÁUSULA DÉCIMA - DA VIGÊNCIA E RESCISÃO
    `CLÁUSULA DÉCIMA - DA VIGÊNCIA E RESCISÃO

O presente contrato terá vigência de ${data.tempo_consultoria_meses || "___"} (${numberToWordsSimple(data.tempo_consultoria_meses)}) meses para o desenvolvimento e acompanhamento do projeto IAplicada Business, e de ${data.duracao_academy_meses || 12} (${numberToWordsSimple(data.duracao_academy_meses || 12)}) ${(data.duracao_academy_meses || 12) > 1 ? "meses" : "mês"} para o acesso à plataforma Academy, a contar da data de sua assinatura.

Parágrafo Único:
A rescisão antecipada por qualquer das partes deverá ser comunicada por escrito com 30 (trinta) dias de antecedência e implicará no pagamento de multa correspondente a ${data.multa_rescisao_percentual || 30}% (${numberToWordsSimple(data.multa_rescisao_percentual || 30)} por cento) do valor remanescente do contrato, sem prejuízo da manutenção do acesso à plataforma Academy pelo período já pago.`,

    // CLÁUSULA DÉCIMA PRIMEIRA - DO FORO
    `CLÁUSULA DÉCIMA PRIMEIRA - DO FORO

Fica eleito o Foro da Comarca de São Paulo/SP para dirimir quaisquer dúvidas ou litígios decorrentes do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`
  ];
};

// Função auxiliar simplificada para números em extenso (1-31)
function numberToWordsSimple(n: number | null | undefined): string {
  if (n == null) return "___";
  const words: Record<number, string> = {
    1: "um", 2: "dois", 3: "três", 4: "quatro", 5: "cinco",
    6: "seis", 7: "sete", 8: "oito", 9: "nove", 10: "dez",
    11: "onze", 12: "doze", 13: "treze", 14: "quatorze", 15: "quinze",
    16: "dezesseis", 17: "dezessete", 18: "dezoito", 19: "dezenove", 20: "vinte",
    21: "vinte e um", 22: "vinte e dois", 23: "vinte e três", 24: "vinte e quatro",
    25: "vinte e cinco", 26: "vinte e seis", 27: "vinte e sete", 28: "vinte e oito",
    29: "vinte e nove", 30: "trinta", 31: "trinta e um",
    300: "trezentos"
  };
  return words[n] || String(n);
}
