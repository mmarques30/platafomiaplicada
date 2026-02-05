import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Users, Clock, CheckCircle, TrendingUp, AlertCircle } from "lucide-react";

// Brand colors
const brandGreen = '#738925';
const brandBlack = '#0D0D0D';

// Mock data
const equipe = [
  {
    id: 1,
    nome: 'Colaborador A',
    cargo: 'Analista de Projetos',
    iniciais: 'CA',
    progresso_trilha: 78,
    modulos_concluidos: 6,
    modulos_total: 8,
    entregas_concluidas: 3,
    entregas_total: 4,
    horas_economizadas: 14,
    status: 'em_dia',
    ultimo_acesso: 'Ha 2 horas',
    atividade_recente: 'Concluiu modulo "Automacao com Make"',
  },
  {
    id: 2,
    nome: 'Colaborador B',
    cargo: 'Especialista IA',
    iniciais: 'CB',
    progresso_trilha: 65,
    modulos_concluidos: 5,
    modulos_total: 8,
    entregas_concluidas: 2,
    entregas_total: 4,
    horas_economizadas: 8,
    status: 'em_dia',
    ultimo_acesso: 'Ontem',
    atividade_recente: 'Iniciou entrega "Agente de IA"',
  },
  {
    id: 3,
    nome: 'Colaborador C',
    cargo: 'Analista de Operacoes',
    iniciais: 'CC',
    progresso_trilha: 35,
    modulos_concluidos: 3,
    modulos_total: 8,
    entregas_concluidas: 1,
    entregas_total: 3,
    horas_economizadas: 4,
    status: 'atrasado',
    ultimo_acesso: '5 dias atras',
    atividade_recente: 'Parou no modulo "SQL Basico"',
  },
  {
    id: 4,
    nome: 'Colaborador D',
    cargo: 'Assistente Administrativo',
    iniciais: 'CD',
    progresso_trilha: 50,
    modulos_concluidos: 4,
    modulos_total: 8,
    entregas_concluidas: 1,
    entregas_total: 3,
    horas_economizadas: 5,
    status: 'atencao',
    ultimo_acesso: '3 dias atras',
    atividade_recente: 'Modulo em andamento ha 8 dias',
  },
];

const entregas = [
  { nome: 'Dashboard de Custos', responsavel: 'Colaborador A', status: 'concluido', economia: '8h/sem', progresso: 100, prazo: '' },
  { nome: 'Automacao de Relatorios', responsavel: 'Colaborador A', status: 'concluido', economia: '4h/sem', progresso: 100, prazo: '' },
  { nome: 'Integracao de Dados', responsavel: 'Colaborador A', status: 'em_andamento', economia: '', progresso: 60, prazo: '15/02' },
  { nome: 'Agente de IA Interno', responsavel: 'Colaborador B', status: 'em_andamento', economia: '', progresso: 40, prazo: '20/02' },
  { nome: 'Automacao de E-mails', responsavel: 'Colaborador B', status: 'concluido', economia: '3h/sem', progresso: 100, prazo: '' },
  { nome: 'Robos de Producao', responsavel: 'Colaborador C', status: 'atrasado', economia: '', progresso: 20, prazo: '01/02' },
  { nome: 'Processos Administrativos', responsavel: 'Colaborador D', status: 'em_andamento', economia: '', progresso: 30, prazo: '25/02' },
];

const semanaAtual = 6;

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'em_dia':
      return <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">Em dia</span>;
    case 'atencao':
      return <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">Atencao</span>;
    case 'atrasado':
      return <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800">Atrasado</span>;
    default:
      return null;
  }
};

const getEntregaStatusBadge = (status: string) => {
  switch (status) {
    case 'concluido':
      return <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">Rodando</span>;
    case 'em_andamento':
      return <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">Em andamento</span>;
    case 'atrasado':
      return <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800">Atrasado</span>;
    default:
      return null;
  }
};

const getMemberCardClasses = (status: string) => {
  switch (status) {
    case 'atrasado':
      return 'bg-red-50 p-4 rounded-lg border border-red-300';
    case 'atencao':
      return 'bg-white p-4 rounded-lg border border-yellow-300';
    default:
      return 'bg-white p-4 rounded-lg border border-gray-200';
  }
};

export default function SkillsPainelLider() {
  const alertas = [
    ...equipe.filter(m => m.status === 'atrasado').map(m => ({
      tipo: 'error',
      titulo: `${m.nome} sem acesso ha ${m.ultimo_acesso}`,
      descricao: `Progresso parado em ${m.progresso_trilha}%. Ultima atividade: ${m.atividade_recente}.`
    })),
    ...entregas.filter(e => e.status === 'atrasado').map(e => ({
      tipo: 'error',
      titulo: `Entrega "${e.nome}" atrasada`,
      descricao: `Prazo era ${e.prazo}. Progresso atual: ${e.progresso}%. Responsavel: ${e.responsavel}.`
    })),
    ...equipe.filter(m => m.status === 'atencao').map(m => ({
      tipo: 'warning',
      titulo: `${m.nome} com modulo parado ha 8 dias`,
      descricao: 'Pode precisar de suporte para avancar.'
    })),
  ];

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div>
        <div className="border-l-4 pl-4 mb-4" style={{ borderColor: brandGreen }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Indicadores Gerais</h2>
          <p className="text-gray-600 text-sm">Visao consolidada do programa</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border-l-4" style={{ borderColor: brandGreen }}>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5" style={{ color: brandGreen }} />
              <p className="text-xs text-gray-600">Equipe Ativa</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: brandGreen }}>3 de 4</p>
            <p className="text-xs text-gray-500 mt-1">1 precisa de atencao</p>
          </div>

          <div className="bg-white p-4 rounded-lg border-l-4" style={{ borderColor: brandGreen }}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5" style={{ color: brandGreen }} />
              <p className="text-xs text-gray-600">Horas Economizadas</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: brandGreen }}>31h/sem</p>
            <p className="text-xs text-gray-500 mt-1">+12% vs ultima semana</p>
          </div>

          <div className="bg-white p-4 rounded-lg border-l-4" style={{ borderColor: brandGreen }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5" style={{ color: brandGreen }} />
              <p className="text-xs text-gray-600">Entregas Concluidas</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: brandGreen }}>4 de 7</p>
            <p className="text-xs text-gray-500 mt-1">2 em andamento</p>
          </div>

          <div className="bg-white p-4 rounded-lg border-l-4" style={{ borderColor: brandGreen }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" style={{ color: brandGreen }} />
              <p className="text-xs text-gray-600">Progresso Geral</p>
            </div>
            <p className="text-2xl font-bold" style={{ color: brandGreen }}>57%</p>
            <p className="text-xs text-gray-500 mt-1">Semana {semanaAtual} de 12</p>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Atencao Necessaria</h3>
          <p className="text-gray-500 text-sm">Itens que precisam de acompanhamento</p>
        </div>

          <div className="space-y-3">
            {alertas.map((alerta, index) => (
              <div 
                key={index} 
                className={`rounded-lg p-4 ${
                  alerta.tipo === 'error' 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle 
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      alerta.tipo === 'error' ? 'text-red-600' : 'text-yellow-600'
                    }`} 
                  />
                  <div>
                    <p className={`font-semibold text-sm ${
                      alerta.tipo === 'error' ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {alerta.titulo}
                    </p>
                    <p className={`text-sm ${
                      alerta.tipo === 'error' ? 'text-red-700' : 'text-yellow-700'
                    }`}>
                      {alerta.descricao}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cronograma */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Cronograma</h3>
          <p className="text-gray-500 text-sm">Progresso nas 12 semanas</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Semana 1</span>
            <span className="text-sm font-bold" style={{ color: brandGreen }}>Semana 6 - VOCE ESTA AQUI</span>
            <span className="text-sm font-medium text-gray-700">Semana 12</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 relative">
            <div 
              className="h-4 rounded-full" 
              style={{ backgroundColor: brandGreen, width: '50%' }} 
            />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1">
              <div 
                className="w-3 h-3 rounded-full bg-white border-2" 
                style={{ borderColor: brandGreen }} 
              />
            </div>
          </div>

          <div className="flex justify-between mt-4 text-xs text-gray-600">
            <div className="text-center">
              <p className="font-semibold">Fundacao</p>
              <p>Sem 1-4</p>
              <p className="text-green-600">Concluido</p>
            </div>
            <div className="text-center">
              <p className="font-semibold" style={{ color: brandGreen }}>Expansao</p>
              <p>Sem 5-8</p>
              <p style={{ color: brandGreen }}>Em andamento</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-400">Consolidacao</p>
              <p>Sem 9-12</p>
              <p className="text-gray-400">Pendente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Equipe */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Equipe</h3>
          <p className="text-gray-500 text-sm">Acompanhamento individual</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {equipe.map((membro) => (
            <div key={membro.id} className={getMemberCardClasses(membro.status)}>
              <div className="flex items-start justify-between mb-4">
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

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Trilha: {membro.progresso_trilha}%</span>
                    <span>Modulos: {membro.modulos_concluidos}/{membro.modulos_total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ backgroundColor: brandGreen, width: `${membro.progresso_trilha}%` }} 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Entregas: {membro.entregas_concluidas}/{membro.entregas_total}</span>
                  <span className="font-semibold" style={{ color: brandGreen }}>Economia: {membro.horas_economizadas}h/sem</span>
                </div>

                <div className="pt-3 border-t border-gray-200 space-y-1">
                  <p className="text-xs text-gray-500">Ultimo acesso: {membro.ultimo_acesso}</p>
                  <p className="text-xs text-gray-600">{membro.atividade_recente}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Entregas */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Entregas</h3>
          <p className="text-gray-500 text-sm">Status dos projetos da equipe</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow style={{ backgroundColor: brandBlack }}>
                <TableHead className="text-white font-semibold">Entrega</TableHead>
                <TableHead className="text-white font-semibold">Responsavel</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Progresso</TableHead>
                <TableHead className="text-white font-semibold">Prazo/Economia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entregas.map((entrega, index) => (
                <TableRow 
                  key={index} 
                  className={entrega.status === 'atrasado' ? 'bg-red-50' : ''}
                >
                  <TableCell className="font-medium">{entrega.nome}</TableCell>
                  <TableCell>{entrega.responsavel}</TableCell>
                  <TableCell>{getEntregaStatusBadge(entrega.status)}</TableCell>
                  <TableCell>
                    {entrega.status !== 'concluido' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ backgroundColor: brandGreen, width: `${entrega.progresso}%` }} 
                          />
                        </div>
                        <span className="text-xs text-gray-600">{entrega.progresso}%</span>
                      </div>
                    ) : (
                      <span className="text-xs text-green-600">100%</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {entrega.status === 'concluido' ? (
                      <span className="text-sm font-semibold" style={{ color: brandGreen }}>{entrega.economia}</span>
                    ) : (
                      <span className="text-sm text-gray-600">{entrega.prazo}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
