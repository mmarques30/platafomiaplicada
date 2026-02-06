// Mock data for the Performance dashboard when DB has no data

export function getMockPerformanceData() {
  const entregas = [
    { id: "m1", titulo: "Automação de relatórios financeiros", descricao: "Automação completa dos relatórios mensais", status: "concluido", progresso: 100, prazo: "2025-02-15", economiaHorasSemana: 8, roi: 35, avaliacaoNota: 92, concluidoEm: "2025-02-10", responsavelId: "u1", responsavelNome: "Ana Silva" },
    { id: "m2", titulo: "Dashboard de vendas com IA", descricao: "Painel inteligente de acompanhamento de vendas", status: "concluido", progresso: 100, prazo: "2025-02-20", economiaHorasSemana: 6, roi: 28, avaliacaoNota: 88, concluidoEm: "2025-02-18", responsavelId: "u2", responsavelNome: "Carlos Mendes" },
    { id: "m3", titulo: "Chatbot de atendimento interno", descricao: "Bot para dúvidas frequentes da equipe", status: "em_andamento", progresso: 65, prazo: "2025-03-01", economiaHorasSemana: 4, roi: 20, avaliacaoNota: null, concluidoEm: null, responsavelId: "u3", responsavelNome: "Beatriz Costa" },
    { id: "m4", titulo: "Classificação automática de e-mails", descricao: "IA para triagem de e-mails", status: "em_andamento", progresso: 40, prazo: "2025-03-10", economiaHorasSemana: 3, roi: 15, avaliacaoNota: null, concluidoEm: null, responsavelId: "u1", responsavelNome: "Ana Silva" },
    { id: "m5", titulo: "Análise preditiva de churn", descricao: "Modelo preditivo de cancelamento", status: "aprovada", progresso: 100, prazo: "2025-02-25", economiaHorasSemana: 5, roi: 40, avaliacaoNota: 95, concluidoEm: "2025-02-22", responsavelId: "u2", responsavelNome: "Carlos Mendes" },
    { id: "m6", titulo: "Automação de onboarding", descricao: "Fluxo automatizado para novos colaboradores", status: "pendente", progresso: 0, prazo: "2025-03-15", economiaHorasSemana: 3, roi: 18, avaliacaoNota: null, concluidoEm: null, responsavelId: "u4", responsavelNome: "Diego Ferreira" },
    { id: "m7", titulo: "Extração de dados de contratos", descricao: "IA para leitura e extração de PDFs", status: "atrasado", progresso: 20, prazo: "2025-02-10", economiaHorasSemana: 4, roi: 22, avaliacaoNota: null, concluidoEm: null, responsavelId: "u3", responsavelNome: "Beatriz Costa" },
    { id: "m8", titulo: "Gerador de propostas comerciais", descricao: "Templates inteligentes com IA", status: "concluido", progresso: 100, prazo: "2025-02-12", economiaHorasSemana: 5, roi: 30, avaliacaoNota: 85, concluidoEm: "2025-02-11", responsavelId: "u4", responsavelNome: "Diego Ferreira" },
  ];

  const ranking = [
    { posicao: 1, userId: "u2", nome: "Carlos Mendes", avatar: null, entregasConcluidas: 2, totalEntregas: 2, horasEconomizadas: 11, performanceMedia: 91, taxaPrazo: 100, score: 320 },
    { posicao: 2, userId: "u1", nome: "Ana Silva", avatar: null, entregasConcluidas: 1, totalEntregas: 2, horasEconomizadas: 8, performanceMedia: 92, taxaPrazo: 100, score: 280 },
    { posicao: 3, userId: "u4", nome: "Diego Ferreira", avatar: null, entregasConcluidas: 1, totalEntregas: 2, horasEconomizadas: 5, performanceMedia: 85, taxaPrazo: 100, score: 220 },
    { posicao: 4, userId: "u3", nome: "Beatriz Costa", avatar: null, entregasConcluidas: 0, totalEntregas: 2, horasEconomizadas: 0, performanceMedia: 0, taxaPrazo: 0, score: 0 },
  ];

  const roiChartData = [
    { semana: "Sem 1", projetado: 8, executado: 5 },
    { semana: "Sem 2", projetado: 17, executado: 12 },
    { semana: "Sem 3", projetado: 25, executado: 22 },
    { semana: "Sem 4", projetado: 33, executado: 30 },
    { semana: "Sem 5", projetado: 42, executado: 38 },
    { semana: "Sem 6", projetado: 50, executado: 48 },
    { semana: "Sem 7", projetado: 58, executado: 55 },
    { semana: "Sem 8", projetado: 67, executado: 0 },
    { semana: "Sem 9", projetado: 75, executado: 0 },
    { semana: "Sem 10", projetado: 83, executado: 0 },
    { semana: "Sem 11", projetado: 92, executado: 0 },
    { semana: "Sem 12", projetado: 100, executado: 0 },
  ];

  const maturidadeChartData = [
    { semana: "Sem 1", maturidade: 15 },
    { semana: "Sem 2", maturidade: 22 },
    { semana: "Sem 3", maturidade: 30 },
    { semana: "Sem 4", maturidade: 38 },
    { semana: "Sem 5", maturidade: 45 },
    { semana: "Sem 6", maturidade: 52 },
    { semana: "Sem 7", maturidade: 60 },
    { semana: "Sem 8", maturidade: 0 },
    { semana: "Sem 9", maturidade: 0 },
    { semana: "Sem 10", maturidade: 0 },
    { semana: "Sem 11", maturidade: 0 },
    { semana: "Sem 12", maturidade: 0 },
  ];

  const roadmap = [
    { id: "r1", numeroFase: 1, nomeFase: "Fundação", semanaInicio: 1, semanaFim: 4, status: "concluido" },
    { id: "r2", numeroFase: 2, nomeFase: "Expansão", semanaInicio: 5, semanaFim: 8, status: "em_andamento" },
    { id: "r3", numeroFase: 3, nomeFase: "Consolidação", semanaInicio: 9, semanaFim: 12, status: "pendente" },
  ];

  return {
    entregas,
    ranking,
    semanaAtual: 7,
    horasEconomizadasTotal: 24,
    entregasConcluidas: 4,
    totalEntregas: 8,
    performanceMedia: 90,
    roiAcumulado: 55,
    roiChartData,
    maturidadeChartData,
    roadmap,
  };
}
