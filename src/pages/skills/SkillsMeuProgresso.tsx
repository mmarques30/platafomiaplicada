import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  User,
  ArrowUp,
  ArrowDown,
  FileText,
  Link2,
  Download,
  Calendar,
  Target,
  Zap,
  AlertCircle,
  ChevronRight,
} from "lucide-react";

// Mock data - KPIs
const kpisData = [
  {
    label: "Horas Economizadas / Semana",
    value: "47h",
    icon: Clock,
    trend: "up",
    trendValue: "+12%",
    trendLabel: "vs semana anterior",
  },
  {
    label: "Projetos Concluídos",
    value: "8 de 15",
    icon: CheckCircle,
    trend: "up",
    trendValue: "+2",
    trendLabel: "esta semana",
  },
  {
    label: "Engajamento da Equipe",
    value: "84%",
    icon: TrendingUp,
    trend: "up",
    trendValue: "+5%",
    trendLabel: "vs semana anterior",
  },
  {
    label: "ROI Acumulado",
    value: "R$ 18.750",
    icon: DollarSign,
    trend: "up",
    trendValue: "+R$ 2.340",
    trendLabel: "esta semana",
  },
];

// Mock data - Team members
const teamMembers = [
  {
    nome: "Carla Mendes",
    cargo: "Analista Financeiro",
    avatar_iniciais: "CM",
    trilha_progresso: 78,
    projetos_concluidos: 3,
    projetos_total: 4,
    horas_economizadas_semana: 12,
    status: "em_dia",
    ultimo_acesso: "Hoje",
    destaque: "Concluiu automação de relatórios DRE",
  },
  {
    nome: "Rafael Torres",
    cargo: "Coordenador de Vendas",
    avatar_iniciais: "RT",
    trilha_progresso: 92,
    projetos_concluidos: 4,
    projetos_total: 5,
    horas_economizadas_semana: 15,
    status: "em_dia",
    ultimo_acesso: "Hoje",
    destaque: "Dashboard de pipeline 100% automatizado",
  },
  {
    nome: "Juliana Alves",
    cargo: "Assistente Administrativa",
    avatar_iniciais: "JA",
    trilha_progresso: 45,
    projetos_concluidos: 1,
    projetos_total: 3,
    horas_economizadas_semana: 5,
    status: "atrasado",
    ultimo_acesso: "3 dias atrás",
    destaque: null,
  },
  {
    nome: "Pedro Nascimento",
    cargo: "Analista de Operações",
    avatar_iniciais: "PN",
    trilha_progresso: 65,
    projetos_concluidos: 2,
    projetos_total: 4,
    horas_economizadas_semana: 9,
    status: "em_dia",
    ultimo_acesso: "Ontem",
    destaque: "Automatizou follow-up de fornecedores",
  },
  {
    nome: "Beatriz Lima",
    cargo: "Analista de Marketing",
    avatar_iniciais: "BL",
    trilha_progresso: 30,
    projetos_concluidos: 1,
    projetos_total: 3,
    horas_economizadas_semana: 6,
    status: "atencao",
    ultimo_acesso: "2 dias atrás",
    destaque: null,
  },
];

// Mock data - Projects
const projectsData = [
  {
    projeto: "Automação de Relatórios DRE",
    responsavel: "Carla Mendes",
    status: "concluido",
    economia_semanal: "8h",
    fase: "Rodando",
    prazo: "Concluído em 15/01",
  },
  {
    projeto: "Dashboard Pipeline de Vendas",
    responsavel: "Rafael Torres",
    status: "concluido",
    economia_semanal: "10h",
    fase: "Rodando",
    prazo: "Concluído em 22/01",
  },
  {
    projeto: "Automação Follow-up Fornecedores",
    responsavel: "Pedro Nascimento",
    status: "em_andamento",
    economia_semanal: "6h (estimado)",
    fase: "Implementação",
    prazo: "Previsto 10/02",
  },
  {
    projeto: "Geração Automática de Propostas",
    responsavel: "Rafael Torres",
    status: "em_andamento",
    economia_semanal: "5h (estimado)",
    fase: "Aprendizado",
    prazo: "Previsto 20/02",
  },
  {
    projeto: "Automação de Contas a Pagar",
    responsavel: "Juliana Alves",
    status: "atrasado",
    economia_semanal: "4h (estimado)",
    fase: "Diagnóstico",
    prazo: "Atrasado — era 01/02",
  },
  {
    projeto: "Relatórios de Campanha Automatizados",
    responsavel: "Beatriz Lima",
    status: "em_andamento",
    economia_semanal: "6h (estimado)",
    fase: "Aprendizado",
    prazo: "Previsto 15/02",
  },
];

// Roadmap phases
const roadmapPhases = [
  {
    title: "Fundação",
    subtitle: "Semanas 1-4",
    description: "Quick wins e projetos de baixa complexidade",
    status: "completed",
    economia: "R$ 4.800",
    projetos: ["Automação de Relatórios DRE", "Dashboard Pipeline de Vendas"],
  },
  {
    title: "Expansão",
    subtitle: "Semanas 5-8",
    description: "Projetos de média complexidade",
    status: "current",
    economia: "R$ 8.400 (projetado)",
    projetos: ["Automação Follow-up Fornecedores", "Geração Automática de Propostas"],
    currentWeek: 6,
  },
  {
    title: "Consolidação",
    subtitle: "Semanas 9-12",
    description: "Projetos avançados e sistema operacional completo",
    status: "future",
    economia: "R$ 12.000 (projetado)",
    projetos: ["Automação de Contas a Pagar", "Relatórios de Campanha Automatizados"],
  },
];

// Pipeline phases for projects
const pipelinePhases = ["Diagnóstico", "Aprendizado", "Implementação", "Validação", "Rodando"];

export default function SkillsMeuProgresso() {
  const [activeTab, setActiveTab] = useState<"desenvolvimento" | "equipe">("equipe");

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "em_dia":
        return { label: "Em dia", color: "bg-[#738925] text-white" };
      case "atencao":
        return { label: "Atenção", color: "bg-amber-500 text-white" };
      case "atrasado":
        return { label: "Atrasado", color: "bg-red-500 text-white" };
      default:
        return { label: status, color: "bg-gray-500 text-white" };
    }
  };

  const getProjectStatusConfig = (status: string) => {
    switch (status) {
      case "concluido":
        return { label: "Concluído", color: "bg-[#738925] text-white" };
      case "em_andamento":
        return { label: "Em andamento", color: "bg-blue-500 text-white" };
      case "atrasado":
        return { label: "Atrasado", color: "bg-red-500 text-white" };
      default:
        return { label: status, color: "bg-gray-500 text-white" };
    }
  };

  const getPhaseIndex = (fase: string) => {
    return pipelinePhases.indexOf(fase);
  };

  const getAvatarColor = (initials: string) => {
    const colors = [
      "bg-[#738925]",
      "bg-[#AFC040]",
      "bg-emerald-600",
      "bg-teal-600",
      "bg-cyan-600",
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFF6" }}>
      <div className="container max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0D0D0D]" style={{ fontFamily: "Sora, sans-serif" }}>
            Meu Progresso
          </h1>

          {/* Tab Pills */}
          <div className="inline-flex p-1 rounded-lg" style={{ backgroundColor: "#F5F5DC" }}>
            <button
              onClick={() => setActiveTab("desenvolvimento")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "desenvolvimento"
                  ? "bg-white text-[#0D0D0D] shadow-sm"
                  : "text-[#0D0D0D]/60 hover:text-[#0D0D0D]"
              }`}
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              <User className="w-4 h-4 inline-block mr-2" />
              Meu Desenvolvimento
            </button>
            <button
              onClick={() => setActiveTab("equipe")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "equipe"
                  ? "bg-white text-[#0D0D0D] shadow-sm"
                  : "text-[#0D0D0D]/60 hover:text-[#0D0D0D]"
              }`}
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              <Users className="w-4 h-4 inline-block mr-2" />
              Minha Equipe
            </button>
          </div>
        </div>

        {activeTab === "desenvolvimento" ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-[#0D0D0D]/60">Conteúdo do Meu Desenvolvimento em construção...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* SEÇÃO 1 - KPIs Consolidados */}
            <section>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpisData.map((kpi, index) => {
                  const Icon = kpi.icon;
                  return (
                    <Card key={index} className="bg-white border border-[#E5E7EB]">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <p className="text-xs text-[#0D0D0D]/60 font-medium uppercase tracking-wide" style={{ fontFamily: "Sora, sans-serif" }}>
                              {kpi.label}
                            </p>
                            <p className="text-2xl md:text-3xl font-bold text-[#0D0D0D]" style={{ fontFamily: "Sora, sans-serif" }}>
                              {kpi.value}
                            </p>
                            <div className="flex items-center gap-1">
                              {kpi.trend === "up" ? (
                                <ArrowUp className="w-3 h-3 text-[#738925]" />
                              ) : (
                                <ArrowDown className="w-3 h-3 text-red-500" />
                              )}
                              <span className={`text-xs font-medium ${kpi.trend === "up" ? "text-[#738925]" : "text-red-500"}`}>
                                {kpi.trendValue}
                              </span>
                              <span className="text-xs text-[#0D0D0D]/50">{kpi.trendLabel}</span>
                            </div>
                          </div>
                          <div className="p-2.5 rounded-lg" style={{ backgroundColor: "#F5F5DC" }}>
                            <Icon className="w-5 h-5 text-[#738925]" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* SEÇÃO 2 - Visão da Equipe */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#0D0D0D]" style={{ fontFamily: "Sora, sans-serif" }}>
                  Visão da Equipe
                </h2>
                <span className="text-sm text-[#0D0D0D]/60">{teamMembers.length} membros</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamMembers.map((member, index) => {
                  const statusConfig = getStatusConfig(member.status);
                  return (
                    <Card
                      key={index}
                      className="bg-white border border-[#E5E7EB] hover:border-[#738925] transition-colors cursor-pointer"
                    >
                      <CardContent className="p-5 space-y-4">
                        {/* Header do card */}
                        <div className="flex items-start gap-3">
                          <Avatar className={`w-10 h-10 ${getAvatarColor(member.avatar_iniciais)}`}>
                            <AvatarFallback className="text-white text-sm font-medium">
                              {member.avatar_iniciais}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-[#0D0D0D] truncate" style={{ fontFamily: "Sora, sans-serif" }}>
                                {member.nome}
                              </p>
                              <Badge className={`${statusConfig.color} text-[10px] px-1.5 py-0 h-5`}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-[#0D0D0D]/60">{member.cargo}</p>
                          </div>
                        </div>

                        {/* Progresso da trilha */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#0D0D0D]/60">Progresso da Trilha</span>
                            <span className="font-medium text-[#0D0D0D]">{member.trilha_progresso}%</span>
                          </div>
                          <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${member.trilha_progresso}%`,
                                backgroundColor: "#738925",
                              }}
                            />
                          </div>
                        </div>

                        {/* Projetos */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#0D0D0D]/60">Projetos</span>
                            <span className="font-medium text-[#0D0D0D]">
                              {member.projetos_concluidos}/{member.projetos_total} concluídos
                            </span>
                          </div>
                          <div className="h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${(member.projetos_concluidos / member.projetos_total) * 100}%`,
                                backgroundColor: "#AFC040",
                              }}
                            />
                          </div>
                        </div>

                        {/* Métricas */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#738925]" />
                            <span className="text-sm font-semibold text-[#0D0D0D]">
                              {member.horas_economizadas_semana}h/sem
                            </span>
                          </div>
                          <span className="text-xs text-[#0D0D0D]/50">
                            Acesso: {member.ultimo_acesso}
                          </span>
                        </div>

                        {/* Destaque */}
                        {member.destaque && (
                          <div className="p-2.5 rounded-md" style={{ backgroundColor: "#F5F5DC" }}>
                            <div className="flex items-start gap-2">
                              <Zap className="w-3.5 h-3.5 text-[#738925] mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-[#0D0D0D]">{member.destaque}</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* SEÇÃO 3 - Projetos da Equipe */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-[#0D0D0D]" style={{ fontFamily: "Sora, sans-serif" }}>
                Projetos da Equipe
              </h2>

              <Card className="bg-white border border-[#E5E7EB] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr style={{ backgroundColor: "#F5F5DC" }}>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#0D0D0D]/70 uppercase tracking-wide">
                          Projeto
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#0D0D0D]/70 uppercase tracking-wide">
                          Responsável
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#0D0D0D]/70 uppercase tracking-wide">
                          Fase
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#0D0D0D]/70 uppercase tracking-wide">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#0D0D0D]/70 uppercase tracking-wide">
                          Economia
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-[#0D0D0D]/70 uppercase tracking-wide">
                          Prazo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {projectsData.map((project, index) => {
                        const statusConfig = getProjectStatusConfig(project.status);
                        const phaseIndex = getPhaseIndex(project.fase);
                        return (
                          <tr key={index} className="hover:bg-[#FFFFF6] transition-colors">
                            <td className="px-4 py-4">
                              <p className="font-medium text-sm text-[#0D0D0D]">{project.projeto}</p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm text-[#0D0D0D]/70">{project.responsavel}</p>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1">
                                {pipelinePhases.map((phase, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      i <= phaseIndex
                                        ? i === phaseIndex
                                          ? "bg-[#738925]"
                                          : "bg-[#AFC040]"
                                        : "bg-[#E5E7EB]"
                                    }`}
                                    title={phase}
                                  />
                                ))}
                                <span className="ml-2 text-xs text-[#0D0D0D]/70">{project.fase}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <Badge className={`${statusConfig.color} text-xs`}>
                                {statusConfig.label}
                              </Badge>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-[#738925]" />
                                <span className="text-sm font-medium text-[#0D0D0D]">{project.economia_semanal}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <p className={`text-sm ${project.status === "atrasado" ? "text-red-600 font-medium" : "text-[#0D0D0D]/70"}`}>
                                {project.prazo}
                              </p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>

            {/* SEÇÃO 4 - Roadmap da Equipe */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-[#0D0D0D]" style={{ fontFamily: "Sora, sans-serif" }}>
                Roadmap da Equipe — 12 Semanas
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roadmapPhases.map((phase, index) => (
                  <Card
                    key={index}
                    className={`bg-white border-2 transition-all ${
                      phase.status === "current"
                        ? "border-[#738925] ring-2 ring-[#738925]/20"
                        : phase.status === "completed"
                        ? "border-[#AFC040]"
                        : "border-[#E5E7EB]"
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base font-semibold text-[#0D0D0D]" style={{ fontFamily: "Sora, sans-serif" }}>
                            {phase.title}
                          </CardTitle>
                          <p className="text-xs text-[#0D0D0D]/60">{phase.subtitle}</p>
                        </div>
                        {phase.status === "completed" && (
                          <CheckCircle className="w-5 h-5 text-[#738925]" />
                        )}
                        {phase.status === "current" && (
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#738925] text-white text-xs font-medium">
                            <Target className="w-3 h-3" />
                            Semana {phase.currentWeek}
                          </div>
                        )}
                        {phase.status === "future" && (
                          <Calendar className="w-5 h-5 text-[#0D0D0D]/30" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-[#0D0D0D]/70">{phase.description}</p>

                      {/* Projetos da fase */}
                      <div className="space-y-2">
                        {phase.projetos.map((projeto, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            <ChevronRight className="w-3 h-3 text-[#738925]" />
                            <span className={phase.status === "future" ? "text-[#0D0D0D]/50" : "text-[#0D0D0D]"}>
                              {projeto}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Economia */}
                      <div className="pt-3 border-t border-[#E5E7EB]">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-[#738925]" />
                          <span className="text-sm font-semibold text-[#0D0D0D]">{phase.economia}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* SEÇÃO 5 - Relatório de Impacto */}
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-[#0D0D0D]" style={{ fontFamily: "Sora, sans-serif" }}>
                Relatório de Impacto
              </h2>

              <Card className="bg-white border-2 border-[#738925] overflow-hidden">
                <div className="p-1" style={{ backgroundColor: "#738925" }}>
                  <p className="text-center text-white text-xs font-medium tracking-wide uppercase">
                    Documento Executivo
                  </p>
                </div>
                <CardContent className="p-6 md:p-8">
                  <div className="space-y-6">
                    {/* Header do relatório */}
                    <div className="text-center space-y-1 pb-6 border-b border-[#E5E7EB]">
                      <h3 className="text-xl font-bold text-[#0D0D0D]" style={{ fontFamily: "Sora, sans-serif" }}>
                        Relatório de Impacto — Empresa Exemplo Ltda
                      </h3>
                      <p className="text-sm text-[#0D0D0D]/60">
                        Semanas 1-6 de 12 • Programa IAplicada Skills
                      </p>
                    </div>

                    {/* Métricas principais */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 rounded-lg" style={{ backgroundColor: "#F5F5DC" }}>
                        <p className="text-xs text-[#0D0D0D]/60 uppercase tracking-wide mb-1">Investimento</p>
                        <p className="text-lg font-bold text-[#0D0D0D]">R$ 4.497</p>
                      </div>
                      <div className="text-center p-4 rounded-lg" style={{ backgroundColor: "#F5F5DC" }}>
                        <p className="text-xs text-[#0D0D0D]/60 uppercase tracking-wide mb-1">Horas Economizadas</p>
                        <p className="text-lg font-bold text-[#738925]">47h/semana</p>
                      </div>
                      <div className="text-center p-4 rounded-lg" style={{ backgroundColor: "#F5F5DC" }}>
                        <p className="text-xs text-[#0D0D0D]/60 uppercase tracking-wide mb-1">Economia Anual Projetada</p>
                        <p className="text-lg font-bold text-[#738925]">R$ 146.640</p>
                      </div>
                      <div className="text-center p-4 rounded-lg" style={{ backgroundColor: "#F5F5DC" }}>
                        <p className="text-xs text-[#0D0D0D]/60 uppercase tracking-wide mb-1">ROI</p>
                        <p className="text-lg font-bold text-[#738925]">3.161%</p>
                      </div>
                    </div>

                    {/* Detalhes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs text-[#0D0D0D]/60 uppercase tracking-wide">Projetos Implementados</p>
                        <p className="text-2xl font-bold text-[#0D0D0D]">8 <span className="text-base font-normal text-[#0D0D0D]/60">de 15</span></p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-[#0D0D0D]/60 uppercase tracking-wide">Engajamento Médio</p>
                        <p className="text-2xl font-bold text-[#0D0D0D]">84%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-[#0D0D0D]/60 uppercase tracking-wide">Custo/Hora Base</p>
                        <p className="text-2xl font-bold text-[#0D0D0D]">R$ 60</p>
                      </div>
                    </div>

                    {/* Destaque */}
                    <div className="p-4 rounded-lg border-l-4 border-[#738925]" style={{ backgroundColor: "#F5F5DC" }}>
                      <div className="flex items-start gap-3">
                        <Zap className="w-5 h-5 text-[#738925] mt-0.5" />
                        <div>
                          <p className="font-semibold text-[#0D0D0D]">Destaque do Período</p>
                          <p className="text-sm text-[#0D0D0D]/70">
                            2 processos críticos 100% automatizados: Relatórios DRE e Dashboard Pipeline de Vendas
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#E5E7EB]">
                      <Button
                        className="flex-1 gap-2"
                        style={{ backgroundColor: "#738925" }}
                      >
                        <Download className="w-4 h-4" />
                        Exportar PDF
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 gap-2 border-[#738925] text-[#738925] hover:bg-[#738925]/10"
                      >
                        <Link2 className="w-4 h-4" />
                        Copiar Link
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
