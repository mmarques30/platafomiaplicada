import { 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Award, 
  Sparkles, 
  Zap, 
  BarChart3, 
  ArrowUp,
  Target
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Cores da marca
const brandGreen = '#738925';
const brandGreenLight = '#AFC040';
const brandBeigeAlt = '#F5F5DC';
const brandBlack = '#0D0D0D';

// Dados mock
const squad = {
  empresa: 'TechCorp Solucoes',
  lider: 'Gestor(a) Responsavel',
  semana_atual: 6,
  total_semanas: 12,
  frentes: ['Inteligencia de Negocios', 'Automacao & IA', 'Operacao'],
};

const membros = [
  {
    id: 1,
    nome: 'Membro A',
    cargo: 'Analista de Projetos',
    iniciais: 'MA',
    frente: 'Inteligencia de Negocios',
    trilha_progresso: 78,
    entregas_concluidas: 3,
    entregas_total: 5,
    horas_economizadas: 12,
    status: 'em_dia',
    ultimo_acesso: 'Hoje',
    destaque: 'Integracao com banco de dados corporativo concluida',
    modulos_concluidos: 6,
    modulos_total: 8,
  },
  {
    id: 2,
    nome: 'Membro B',
    cargo: 'Especialista IA',
    iniciais: 'MB',
    frente: 'Automacao & IA',
    trilha_progresso: 65,
    entregas_concluidas: 2,
    entregas_total: 4,
    horas_economizadas: 8,
    status: 'em_dia',
    ultimo_acesso: 'Ontem',
    destaque: 'Primeiro agente de IA em producao',
    modulos_concluidos: 5,
    modulos_total: 8,
  },
  {
    id: 3,
    nome: 'Membro C',
    cargo: 'Analista de Operacoes',
    iniciais: 'MC',
    frente: 'Operacao',
    trilha_progresso: 40,
    entregas_concluidas: 1,
    entregas_total: 4,
    horas_economizadas: 5,
    status: 'atencao',
    ultimo_acesso: '3 dias atras',
    destaque: null,
    modulos_concluidos: 3,
    modulos_total: 8,
  },
];

const frentes = [
  {
    nome: 'Inteligencia de Negocios',
    responsavel: 'Membro A',
    descricao: 'Dashboards, BI, relatorios executivos e integracao de dados',
    entregas_total: 5,
    entregas_concluidas: 3,
    status: 'em_dia',
    cor: '#10B981',
  },
  {
    nome: 'Automacao & IA',
    responsavel: 'Membro B',
    descricao: 'Implementacao de IA, agentes inteligentes e automacoes com IA',
    entregas_total: 4,
    entregas_concluidas: 2,
    status: 'em_dia',
    cor: '#3B82F6',
  },
  {
    nome: 'Operacao',
    responsavel: 'Membro C',
    descricao: 'Automatizacao de processos operacionais e ponte com campo',
    entregas_total: 4,
    entregas_concluidas: 1,
    status: 'atencao',
    cor: brandGreen,
  },
];

const backlog = [
  {
    id: 1,
    solucao: 'Dashboard de custos operacionais',
    frente: 'Inteligencia de Negocios',
    responsavel: 'Membro A',
    impacto: 'Alto',
    esforco: 'Medio',
    status: 'concluido',
    fase: 'Rodando',
    economia_semanal: '8h',
  },
  {
    id: 2,
    solucao: 'Integracao banco de dados corporativo',
    frente: 'Inteligencia de Negocios',
    responsavel: 'Membro A',
    impacto: 'Alto',
    esforco: 'Alto',
    status: 'concluido',
    fase: 'Rodando',
    economia_semanal: '6h',
  },
  {
    id: 3,
    solucao: 'Agente de IA para insights estrategicos',
    frente: 'Automacao & IA',
    responsavel: 'Membro B',
    impacto: 'Alto',
    esforco: 'Alto',
    status: 'em_andamento',
    fase: 'Implementacao',
    economia_semanal: '10h (est.)',
  },
  {
    id: 4,
    solucao: 'Automacao de relatorios operacionais',
    frente: 'Inteligencia de Negocios',
    responsavel: 'Membro A',
    impacto: 'Medio',
    esforco: 'Baixo',
    status: 'em_andamento',
    fase: 'Aprendizado',
    economia_semanal: '5h (est.)',
  },
  {
    id: 5,
    solucao: 'Robos de upload de dados de producao',
    frente: 'Operacao',
    responsavel: 'Membro C',
    impacto: 'Alto',
    esforco: 'Medio',
    status: 'em_andamento',
    fase: 'Diagnostico',
    economia_semanal: '7h (est.)',
  },
  {
    id: 6,
    solucao: 'Automacao de processos administrativos',
    frente: 'Operacao',
    responsavel: 'Membro C',
    impacto: 'Medio',
    esforco: 'Medio',
    status: 'planejado',
    fase: 'Backlog',
    economia_semanal: '6h (est.)',
  },
  {
    id: 7,
    solucao: 'Projetos de automacao com IA nas areas',
    frente: 'Automacao & IA',
    responsavel: 'Membro B',
    impacto: 'Alto',
    esforco: 'Alto',
    status: 'planejado',
    fase: 'Backlog',
    economia_semanal: '8h (est.)',
  },
  {
    id: 8,
    solucao: 'FP&A automatizado e relatorios executivos',
    frente: 'Inteligencia de Negocios',
    responsavel: 'Lider',
    impacto: 'Alto',
    esforco: 'Medio',
    status: 'em_andamento',
    fase: 'Implementacao',
    economia_semanal: '6h (est.)',
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'em_dia':
      return <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 border border-green-200">Em dia</span>;
    case 'atencao':
      return <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">Atencao</span>;
    case 'atrasado':
      return <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 border border-red-200">Atrasado</span>;
    default:
      return null;
  }
};

const getImpactoBadge = (impacto: string) => {
  switch (impacto) {
    case 'Alto':
      return <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 border border-red-200">Alto</span>;
    case 'Medio':
      return <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">Medio</span>;
    case 'Baixo':
      return <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 border border-green-200">Baixo</span>;
    default:
      return null;
  }
};

const getFaseBadge = (fase: string) => {
  switch (fase) {
    case 'Rodando':
      return <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 border border-green-200">Rodando</span>;
    case 'Implementacao':
      return <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 border border-blue-200">Implementacao</span>;
    case 'Aprendizado':
      return <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 border border-yellow-200">Aprendizado</span>;
    case 'Diagnostico':
      return <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-800 border border-gray-200">Diagnostico</span>;
    case 'Backlog':
      return <span className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-500 border border-gray-200">Backlog</span>;
    default:
      return null;
  }
};

const getFrenteColor = (frenteNome: string) => {
  const frente = frentes.find(f => f.nome === frenteNome);
  return frente?.cor || brandGreen;
};

export default function SkillsPainelLider() {
  return (
    <div className="space-y-6">
      {/* SECAO 1 - Visao Geral do Squad */}
      <div className="space-y-4">
        {/* Barra de contexto */}
        <div className="rounded-lg p-4" style={{ backgroundColor: brandBlack }}>
          <div className="flex flex-wrap items-center gap-4 text-white text-sm">
            <span>Empresa: <strong>{squad.empresa}</strong></span>
            <span className="hidden md:inline">|</span>
            <span>Squad: <strong>{membros.length} membros</strong></span>
            <span className="hidden md:inline">|</span>
            <span>Semana <strong>{squad.semana_atual}</strong> de {squad.total_semanas}</span>
            <span className="hidden md:inline">|</span>
            <span><strong>{squad.frentes.length}</strong> frentes ativas</span>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border-l-4" style={{ borderColor: brandGreen }}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" style={{ color: brandGreen }} />
              <p className="font-semibold text-gray-900">Horas Economizadas / Semana</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: brandGreen }}>25h</p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <ArrowUp className="w-3 h-3 text-green-600" />
              <span className="text-green-600">8%</span> vs semana anterior
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border-l-4" style={{ borderColor: brandGreen }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5" style={{ color: brandGreen }} />
              <p className="font-semibold text-gray-900">Entregas Concluidas</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: brandGreen }}>6 de 13</p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <ArrowUp className="w-3 h-3 text-green-600" />
              <span className="text-green-600">2</span> esta semana
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border-l-4" style={{ borderColor: brandGreen }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" style={{ color: brandGreen }} />
              <p className="font-semibold text-gray-900">Progresso Geral</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: brandGreen }}>62%</p>
            <p className="text-sm text-gray-600">No ritmo esperado</p>
          </div>

          <div className="bg-white p-4 rounded-lg border-l-4" style={{ borderColor: brandGreen }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5" style={{ color: brandGreen }} />
              <p className="font-semibold text-gray-900">Solucoes em Producao</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: brandGreen }}>3</p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <ArrowUp className="w-3 h-3 text-green-600" />
              <span className="text-green-600">2</span> esta semana
            </p>
          </div>
        </div>
      </div>

      {/* SECAO 2 - Frentes de Atuacao */}
      <div className="space-y-4">
        <div className="border-l-4 pl-4" style={{ borderColor: brandGreen }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Frentes de Atuacao</h2>
          <p className="text-gray-600">Status de cada frente do squad</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {frentes.map((frente) => (
            <div key={frente.nome} className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: frente.cor }}></div>
                <h3 className="font-bold text-gray-900">{frente.nome}</h3>
              </div>
              <p className="text-xs text-gray-600 mb-2">Responsavel: {frente.responsavel}</p>
              <p className="text-sm text-gray-700 mb-4">{frente.descricao}</p>
              
              <div className="mb-2">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all" 
                    style={{ 
                      width: `${(frente.entregas_concluidas / frente.entregas_total) * 100}%`,
                      backgroundColor: frente.cor 
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{frente.entregas_concluidas}/{frente.entregas_total} entregas</span>
                {getStatusBadge(frente.status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECAO 3 - Membros do Squad */}
      <div className="space-y-4">
        <div className="border-l-4 pl-4" style={{ borderColor: brandGreen }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Membros do Squad</h2>
          <p className="text-gray-600">Progresso individual e entregas por pessoa</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {membros.map((membro) => (
            <div key={membro.id} className="bg-white p-5 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: brandGreen }}
                  >
                    {membro.iniciais}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{membro.nome}</p>
                    <p className="text-xs text-gray-600">{membro.cargo}</p>
                  </div>
                </div>
                {getStatusBadge(membro.status)}
              </div>

              <div className="mb-3">
                <span 
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ 
                    backgroundColor: `${getFrenteColor(membro.frente)}20`,
                    color: getFrenteColor(membro.frente)
                  }}
                >
                  {membro.frente}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progresso da trilha</span>
                    <span>{membro.trilha_progresso}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ width: `${membro.trilha_progresso}%`, backgroundColor: brandGreen }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{membro.modulos_concluidos}/{membro.modulos_total} modulos</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Entregas</span>
                    <span>{membro.entregas_concluidas}/{membro.entregas_total}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ 
                        width: `${(membro.entregas_concluidas / membro.entregas_total) * 100}%`, 
                        backgroundColor: brandGreen 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold" style={{ color: brandGreen }}>{membro.horas_economizadas}h/sem</p>
                  <p className="text-xs text-gray-500">Ultimo acesso: {membro.ultimo_acesso}</p>
                </div>

                {membro.destaque && (
                  <div className="bg-gray-50 p-2 rounded text-xs flex items-start gap-2">
                    <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: brandGreen }} />
                    <span className="text-gray-700">{membro.destaque}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECAO 4 - Backlog de Solucoes */}
      <div className="space-y-4">
        <div className="border-l-4 pl-4" style={{ borderColor: brandGreen }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Backlog de Solucoes</h2>
          <p className="text-gray-600">Pipeline de iniciativas priorizadas por impacto</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: brandBlack, color: 'white' }}>
                  <th className="text-left p-3 text-sm font-semibold">Solucao</th>
                  <th className="text-left p-3 text-sm font-semibold">Frente</th>
                  <th className="text-left p-3 text-sm font-semibold">Responsavel</th>
                  <th className="text-left p-3 text-sm font-semibold">Impacto</th>
                  <th className="text-left p-3 text-sm font-semibold">Fase</th>
                  <th className="text-left p-3 text-sm font-semibold">Economia/Sem</th>
                </tr>
              </thead>
              <tbody>
                {backlog.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 text-sm text-gray-700">{item.solucao}</td>
                    <td className="p-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: getFrenteColor(item.frente) }}
                        ></div>
                        <span className="hidden md:inline">{item.frente}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-gray-700">{item.responsavel}</td>
                    <td className="p-3">{getImpactoBadge(item.impacto)}</td>
                    <td className="p-3">{getFaseBadge(item.fase)}</td>
                    <td className="p-3 text-sm text-gray-700 font-medium">{item.economia_semanal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECAO 5 - Roadmap Trimestral */}
      <div className="space-y-4">
        <div className="border-l-4 pl-4" style={{ borderColor: brandGreen }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Roadmap do Squad</h2>
          <p className="text-gray-600">Cronograma de entregas em 12 semanas</p>
        </div>

        <div className="space-y-4">
          {/* Mes 1 - Fundacao */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 flex items-center gap-3" style={{ backgroundColor: '#10B981' }}>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded text-white font-bold text-sm">MES 1</div>
              <h3 className="text-xl font-bold text-white">FUNDACAO</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 text-center">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Semana</p>
                  <div className="w-12 h-12 rounded flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: '#10B981' }}>1-2</div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-2 text-sm">Dashboard de custos operacionais (Membro A)</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200">Concluido</span>
                    <span className="text-xs px-2 py-1 rounded border" style={{ backgroundColor: brandBeigeAlt, color: brandGreen, borderColor: brandGreenLight }}>8h/sem economizadas</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 text-center">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Semana</p>
                  <div className="w-12 h-12 rounded flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: '#10B981' }}>3-4</div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-2 text-sm">Integracao banco de dados (Membro A)</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200">Concluido</span>
                    <span className="text-xs px-2 py-1 rounded border" style={{ backgroundColor: brandBeigeAlt, color: brandGreen, borderColor: brandGreenLight }}>6h/sem economizadas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mes 2 - Expansao */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 flex items-center gap-3" style={{ backgroundColor: '#3B82F6' }}>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded text-white font-bold text-sm">MES 2</div>
              <h3 className="text-xl font-bold text-white">EXPANSAO</h3>
              <span className="px-3 py-1 rounded text-white font-bold text-xs ml-auto" style={{ backgroundColor: brandGreen }}>SEMANA ATUAL</span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border-2" style={{ borderColor: brandGreen }}>
                <div className="flex-shrink-0 text-center">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Semana</p>
                  <div className="w-12 h-12 rounded flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: '#3B82F6' }}>5-6</div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-2 text-sm">Agente de IA (Membro B) + FP&A automatizado (Lider)</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded border border-blue-200">Em andamento</span>
                    <span className="text-xs px-2 py-1 rounded border" style={{ backgroundColor: brandBeigeAlt, color: brandGreen, borderColor: brandGreenLight }}>16h/sem estimadas</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 text-center">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Semana</p>
                  <div className="w-12 h-12 rounded flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: '#3B82F6' }}>7-8</div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-2 text-sm">Robos de upload de producao (Membro C)</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">Planejado</span>
                    <span className="text-xs px-2 py-1 rounded border" style={{ backgroundColor: brandBeigeAlt, color: brandGreen, borderColor: brandGreenLight }}>7h/sem estimadas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mes 3 - Consolidacao */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 flex items-center gap-3" style={{ backgroundColor: brandGreen }}>
              <div className="bg-white bg-opacity-20 px-3 py-1 rounded text-white font-bold text-sm">MES 3</div>
              <h3 className="text-xl font-bold text-white">CONSOLIDACAO</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 text-center">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Semana</p>
                  <div className="w-12 h-12 rounded flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: brandGreen }}>9-10</div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-2 text-sm">Automacao processos administrativos (Membro C) + Projetos IA nas areas (Membro B)</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">Planejado</span>
                    <span className="text-xs px-2 py-1 rounded border" style={{ backgroundColor: brandBeigeAlt, color: brandGreen, borderColor: brandGreenLight }}>14h/sem estimadas</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-shrink-0 text-center">
                  <p className="text-xs text-gray-500 font-semibold mb-1">Semana</p>
                  <div className="w-12 h-12 rounded flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: brandGreen }}>11-12</div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 mb-2 text-sm">Sistema integrado completo - Todas as frentes convergem</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">Planejado</span>
                    <span className="text-xs px-2 py-1 rounded border" style={{ backgroundColor: brandBeigeAlt, color: brandGreen, borderColor: brandGreenLight }}>Marco final</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projecao Acumulada */}
          <div className="rounded-lg p-4" style={{ backgroundColor: brandBlack }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
              <div>
                <p className="text-sm text-gray-300 mb-1">Economia atual</p>
                <p className="text-2xl font-bold">25h/semana</p>
              </div>
              <div>
                <p className="text-sm text-gray-300 mb-1">Projecao semana 12</p>
                <p className="text-2xl font-bold">56h/semana</p>
              </div>
              <div>
                <p className="text-sm text-gray-300 mb-1">Solucoes em producao</p>
                <p className="text-2xl font-bold">3 <span className="text-sm font-normal text-gray-300">projecao: 8</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECAO 6 - Relatorio de Impacto */}
      <div className="space-y-4">
        <div className="border-l-4 pl-4" style={{ borderColor: brandGreen }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Relatorio de Impacto</h2>
          <p className="text-gray-600">Resumo executivo para apresentar a diretoria</p>
        </div>

        <div className="bg-white p-6 rounded-lg border-2" style={{ borderColor: brandGreen }}>
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-6 h-6" style={{ color: brandGreen }} />
            <div>
              <h3 className="font-bold text-lg text-gray-900">Relatorio de Impacto</h3>
              <p className="text-sm text-gray-600">Semana 6 de 12 | Programa Skills IAplicada</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Investimento total</p>
              <p className="text-xl font-bold text-gray-900">R$ 4.497</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Membros do squad</p>
              <p className="text-xl font-bold text-gray-900">3 ativos</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Horas economizadas/semana</p>
              <p className="text-xl font-bold" style={{ color: brandGreen }}>25h</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Solucoes em producao</p>
              <p className="text-xl font-bold text-gray-900">3</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Economia projetada anual</p>
              <p className="text-xl font-bold" style={{ color: brandGreen }}>R$ 78.000</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Progresso geral</p>
              <p className="text-xl font-bold text-gray-900">62%</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="font-semibold text-gray-900 mb-3">Destaques do Periodo</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: brandGreen }} />
                <span className="text-sm text-gray-700">Integracao com banco de dados corporativo em producao</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: brandGreen }} />
                <span className="text-sm text-gray-700">Primeiro agente de IA operacional na empresa</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: brandGreen }} />
                <span className="text-sm text-gray-700">3 frentes de atuacao com entregas ativas</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
              Exportar PDF
            </button>
            <button 
              className="text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundColor: brandGreen }}
            >
              Compartilhar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
