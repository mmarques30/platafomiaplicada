import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Users, Clock, CheckCircle, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { useSkillsLider } from "@/hooks/useSkillsLider";
import { useSkillsRoadmap } from "@/hooks/useSkillsRoadmap";
import { PageTitle } from "@/components/shared/PageTitle";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

// Brand colors
const brandGreen = '#738925';
const brandBlack = '#0D0D0D';
const brandBeigeLight = '#F5F5DC';

// Pill-style section header
const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
  <div 
    className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
    style={{ backgroundColor: brandBeigeLight }}
  >
    <span className="font-semibold text-gray-900">{title}</span>
    <span className="text-gray-500 text-sm">{subtitle}</span>
  </div>
);

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'em_dia':
      return <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">Em dia</span>;
    case 'atencao':
      return <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">Atenção</span>;
    case 'atrasado':
      return <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800">Atrasado</span>;
    default:
      return null;
  }
};

const getEntregaStatusBadge = (status: string) => {
  switch (status) {
    case 'aprovada':
      return <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">Concluída</span>;
    case 'em_andamento':
      return <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800">Em andamento</span>;
    case 'aguardando_validacao':
      return <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">Aguardando validação</span>;
    case 'pendente':
      return <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-800">Pendente</span>;
    default:
      return <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-800">{status}</span>;
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

// Função para calcular semana atual do programa
const calcularSemanaAtual = (dataInicio: string | null): number => {
  if (!dataInicio) return 1;
  const inicio = new Date(dataInicio);
  const hoje = new Date();
  const dias = differenceInDays(hoje, inicio);
  const semana = Math.floor(dias / 7) + 1;
  return Math.min(Math.max(semana, 1), 12);
};

// Função para determinar status do membro
const determinarStatusMembro = (
  diagnosticoCompleto: boolean,
  entregasConcluidas: number,
  totalEntregas: number
): string => {
  if (!diagnosticoCompleto) return 'atencao';
  if (totalEntregas === 0) return 'em_dia';
  const proporcao = entregasConcluidas / totalEntregas;
  if (proporcao >= 0.5) return 'em_dia';
  if (proporcao >= 0.25) return 'atencao';
  return 'atrasado';
};

export default function SkillsPainelLider() {
  const { 
    progressoMembros, 
    alertasAtraso, 
    metricas, 
    isLoading 
  } = useSkillsLider();
  
  const { fases, isLoading: loadingRoadmap } = useSkillsRoadmap();

  if (isLoading || loadingRoadmap) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calcular semana atual baseado nas fases do roadmap
  const primeiraFase = fases?.[0];
  // Usar semana_inicio como referência (campo correto da tabela roadmap_skills)
  const semanaAtual = primeiraFase?.semana_inicio || 1;

  // Processar membros com status calculado
  const membrosProcessados = (progressoMembros || []).map((membro: any) => ({
    ...membro,
    iniciais: membro.nome?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??',
    status: determinarStatusMembro(
      membro.diagnostico_completo,
      membro.entregas_concluidas,
      membro.total_entregas
    ),
  }));

  // Gerar alertas baseado em dados reais
  const alertas = [
    ...(alertasAtraso || []).map((entrega: any) => ({
      tipo: 'error',
      titulo: `Entrega "${entrega.titulo}" atrasada`,
      descricao: `Prazo era ${entrega.prazo ? format(new Date(entrega.prazo), "dd/MM", { locale: ptBR }) : 'indefinido'}. Responsável: ${entrega.responsavel?.nome || 'Não atribuído'}.`
    })),
    ...membrosProcessados
      .filter((m: any) => !m.diagnostico_completo)
      .map((m: any) => ({
        tipo: 'warning',
        titulo: `${m.nome} ainda não completou o diagnóstico`,
        descricao: 'O diagnóstico é necessário para identificar oportunidades de automação.'
      })),
    ...membrosProcessados
      .filter((m: any) => m.status === 'atrasado')
      .map((m: any) => ({
        tipo: 'error',
        titulo: `${m.nome} com progresso baixo`,
        descricao: `Apenas ${m.entregas_concluidas} de ${m.total_entregas} entregas concluídas.`
      })),
  ];

  // Calcular progresso geral
  const totalEntregas = metricas?.totalEntregas || 0;
  const entregasAprovadas = metricas?.entregasAprovadas || 0;
  const progressoGeral = totalEntregas > 0 ? Math.round((entregasAprovadas / totalEntregas) * 100) : 0;
  const membrosAtivos = membrosProcessados.filter((m: any) => m.status !== 'atrasado').length;
  const totalMembros = membrosProcessados.length;

  return (
    <div className="space-y-8">
      {/* Título Principal */}
      <PageTitle 
        primary="Indicadores Gerais" 
        secondary="Visão consolidada do programa" 
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border-l-4" style={{ borderColor: brandGreen }}>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5" style={{ color: brandGreen }} />
            <p className="text-xs text-gray-600">Equipe Ativa</p>
          </div>
          <p className="text-2xl font-bold" style={{ color: brandGreen }}>
            {membrosAtivos} de {totalMembros}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {totalMembros - membrosAtivos > 0 ? `${totalMembros - membrosAtivos} precisa(m) de atenção` : 'Todos em dia'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border-l-4" style={{ borderColor: brandGreen }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5" style={{ color: brandGreen }} />
            <p className="text-xs text-gray-600">Horas Economizadas</p>
          </div>
          <p className="text-2xl font-bold" style={{ color: brandGreen }}>
            {metricas?.horasEconomizadas || 0}h/sem
          </p>
          <p className="text-xs text-gray-500 mt-1">Potencial calculado</p>
        </div>

        <div className="bg-white p-4 rounded-lg border-l-4" style={{ borderColor: brandGreen }}>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5" style={{ color: brandGreen }} />
            <p className="text-xs text-gray-600">Entregas Concluídas</p>
          </div>
          <p className="text-2xl font-bold" style={{ color: brandGreen }}>
            {entregasAprovadas} de {totalEntregas}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {metricas?.entregasParaValidar || 0} aguardando validação
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border-l-4" style={{ borderColor: brandGreen }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5" style={{ color: brandGreen }} />
            <p className="text-xs text-gray-600">Progresso Geral</p>
          </div>
          <p className="text-2xl font-bold" style={{ color: brandGreen }}>{progressoGeral}%</p>
          <p className="text-xs text-gray-500 mt-1">Semana {semanaAtual} de 12</p>
        </div>
      </div>

      {/* Cronograma */}
      <div>
        <SectionHeader title="Cronograma" subtitle="Progresso nas 12 semanas" />

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Semana 1</span>
            <span className="text-sm font-bold" style={{ color: brandGreen }}>Semana {semanaAtual} - VOCÊ ESTÁ AQUI</span>
            <span className="text-sm font-medium text-gray-700">Semana 12</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 relative">
            <div 
              className="h-4 rounded-full" 
              style={{ backgroundColor: brandGreen, width: `${(semanaAtual / 12) * 100}%` }} 
            />
            <div 
              className="absolute top-0 transform -translate-x-1/2 -translate-y-1"
              style={{ left: `${(semanaAtual / 12) * 100}%` }}
            >
              <div 
                className="w-3 h-3 rounded-full bg-white border-2" 
                style={{ borderColor: brandGreen }} 
              />
            </div>
          </div>

          <div className="flex justify-between mt-4 text-xs text-gray-600">
            {fases && fases.length > 0 ? (
              fases.map((fase: any, index: number) => {
                const faseAtual = semanaAtual >= (index * 4 + 1) && semanaAtual <= ((index + 1) * 4);
                const faseConcluida = semanaAtual > ((index + 1) * 4);
                
                return (
                  <div key={fase.id} className="text-center">
                    <p className={`font-semibold ${faseAtual ? '' : faseConcluida ? 'text-green-600' : 'text-gray-400'}`}
                       style={faseAtual ? { color: brandGreen } : {}}>
                      {fase.nome_fase}
                    </p>
                    <p>Sem {index * 4 + 1}-{(index + 1) * 4}</p>
                    <p className={faseAtual ? '' : faseConcluida ? 'text-green-600' : 'text-gray-400'}
                       style={faseAtual ? { color: brandGreen } : {}}>
                      {faseConcluida ? 'Concluído' : faseAtual ? 'Em andamento' : 'Pendente'}
                    </p>
                  </div>
                );
              })
            ) : (
              <>
                <div className="text-center">
                  <p className={`font-semibold ${semanaAtual <= 4 ? '' : 'text-green-600'}`}
                     style={semanaAtual <= 4 ? { color: brandGreen } : {}}>
                    Fundação
                  </p>
                  <p>Sem 1-4</p>
                  <p className={semanaAtual > 4 ? 'text-green-600' : ''}
                     style={semanaAtual <= 4 ? { color: brandGreen } : {}}>
                    {semanaAtual > 4 ? 'Concluído' : 'Em andamento'}
                  </p>
                </div>
                <div className="text-center">
                  <p className={`font-semibold ${semanaAtual > 4 && semanaAtual <= 8 ? '' : semanaAtual > 8 ? 'text-green-600' : 'text-gray-400'}`}
                     style={semanaAtual > 4 && semanaAtual <= 8 ? { color: brandGreen } : {}}>
                    Expansão
                  </p>
                  <p>Sem 5-8</p>
                  <p className={semanaAtual > 8 ? 'text-green-600' : semanaAtual > 4 && semanaAtual <= 8 ? '' : 'text-gray-400'}
                     style={semanaAtual > 4 && semanaAtual <= 8 ? { color: brandGreen } : {}}>
                    {semanaAtual > 8 ? 'Concluído' : semanaAtual > 4 ? 'Em andamento' : 'Pendente'}
                  </p>
                </div>
                <div className="text-center">
                  <p className={`font-semibold ${semanaAtual > 8 ? '' : 'text-gray-400'}`}
                     style={semanaAtual > 8 ? { color: brandGreen } : {}}>
                    Consolidação
                  </p>
                  <p>Sem 9-12</p>
                  <p className={semanaAtual > 8 ? '' : 'text-gray-400'}
                     style={semanaAtual > 8 ? { color: brandGreen } : {}}>
                    {semanaAtual > 8 ? 'Em andamento' : 'Pendente'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Equipe */}
      <div>
        <SectionHeader title="Equipe" subtitle="Acompanhamento individual" />

        {membrosProcessados.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhum membro na equipe ainda.</p>
            <p className="text-sm text-gray-500 mt-1">Adicione membros para acompanhar o progresso.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {membrosProcessados.map((membro: any) => (
              <div key={membro.id} className={getMemberCardClasses(membro.status)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {membro.avatar_url ? (
                      <img 
                        src={membro.avatar_url} 
                        alt={membro.nome}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: brandGreen }}
                      >
                        {membro.iniciais}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{membro.nome}</p>
                      <p className="text-xs text-gray-600">{membro.cargo || 'Sem cargo definido'}</p>
                    </div>
                  </div>
                  {getStatusBadge(membro.status)}
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Diagnóstico: {membro.diagnostico_completo ? 'Completo' : 'Pendente'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ backgroundColor: brandGreen, width: membro.diagnostico_completo ? '100%' : '0%' }} 
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Entregas: {membro.entregas_concluidas}/{membro.total_entregas}</span>
                    <span className="font-semibold" style={{ color: brandGreen }}>
                      {membro.papel === 'lider' ? 'Líder' : 'Membro'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Entregas */}
      <div>
        <SectionHeader title="Entregas" subtitle="Status dos projetos da equipe" />

        {totalEntregas === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Nenhuma entrega cadastrada ainda.</p>
            <p className="text-sm text-gray-500 mt-1">As entregas aparecerão aqui conforme forem criadas.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: brandBlack }}>
                  <TableHead className="text-white font-semibold">Entrega</TableHead>
                  <TableHead className="text-white font-semibold">Responsável</TableHead>
                  <TableHead className="text-white font-semibold">Status</TableHead>
                  <TableHead className="text-white font-semibold">Prazo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertasAtraso?.map((entrega: any) => (
                  <TableRow 
                    key={entrega.id} 
                    className="bg-red-50"
                  >
                    <TableCell className="font-medium">{entrega.titulo}</TableCell>
                    <TableCell>{entrega.responsavel?.nome || 'Não atribuído'}</TableCell>
                    <TableCell>{getEntregaStatusBadge(entrega.status)}</TableCell>
                    <TableCell className="text-red-600 font-semibold">
                      {entrega.prazo ? format(new Date(entrega.prazo), "dd/MM", { locale: ptBR }) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Alertas - por último */}
      {alertas.length > 0 && (
        <div>
          <SectionHeader title="Atenção Necessária" subtitle="Itens que precisam de acompanhamento" />

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
    </div>
  );
}
