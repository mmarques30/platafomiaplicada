import { useState } from "react";
import { useVisitantes } from "@/hooks/useVisitantes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { EditVisitanteModal } from "@/components/admin/EditVisitanteModal";
import { VisitorAccessDrawer } from "@/components/admin/VisitorAccessDrawer";
import { useContentAccessMetrics } from "@/hooks/admin/useContentAccessMetrics";
import { useAcademyPurchaseClicks } from "@/hooks/admin/useButtonClickLogs";
import { StatsCard } from "@/components/admin/StatsCard";
import { Users, UserCheck, Trash2, Pencil, Eye, TrendingUp, Video, FileText, MousePointerClick, Download, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function GerenciarVisitantes() {
  const { visitantes, isLoading, convertToMentorado, deleteVisitante } = useVisitantes();
  const { data: metrics, isLoading: isLoadingMetrics } = useContentAccessMetrics();
  const { data: academyClicks, isLoading: isLoadingClicks } = useAcademyPurchaseClicks();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedVisitante, setSelectedVisitante] = useState<typeof visitantes[0] | null>(null);
  const [showAllVisitors, setShowAllVisitors] = useState(false);

  // Estados para seções colapsáveis (fechadas por padrão)
  const [topContentOpen, setTopContentOpen] = useState(false);
  const [engajamentoOpen, setEngajamentoOpen] = useState(false);
  const [academyClicksOpen, setAcademyClicksOpen] = useState(false);
  const [visitantesListOpen, setVisitantesListOpen] = useState(false);

  const handleEdit = (visitante: typeof visitantes[0]) => {
    setSelectedVisitante(visitante);
    setEditModalOpen(true);
  };

  const handleViewAccess = (visitante: typeof visitantes[0]) => {
    setSelectedVisitante(visitante);
    setDrawerOpen(true);
  };

  const handleConvert = (userId: string) => {
    setSelectedUserId(userId);
    setConvertDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    setSelectedUserId(userId);
    setDeleteDialogOpen(true);
  };

  const confirmConvert = () => {
    if (selectedUserId) {
      convertToMentorado.mutate(selectedUserId);
      setConvertDialogOpen(false);
      setSelectedUserId(null);
    }
  };

  const confirmDelete = () => {
    if (selectedUserId) {
      deleteVisitante.mutate(selectedUserId);
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
    }
  };

  // Função auxiliar para download de CSV
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função auxiliar para formatar célula CSV
  const formatCSVCell = (cell: string | number) => {
    const cellStr = String(cell);
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
      return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return cellStr;
  };

  // Export Top Conteúdos
  const exportTopContentCSV = () => {
    if (!metrics?.topContent) return;
    const headers = ['Posição', 'Conteúdo', 'Tipo', 'Total de Acessos'];
    const rows = metrics.topContent.map((content, index) => [
      index + 1,
      content.title,
      content.type === 'video' ? 'Vídeo' : 'Material',
      content.count
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.map(formatCSVCell).join(','))].join('\n');
    downloadCSV(csvContent, `top_conteudos_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
  };

  // Export Engajamento
  const exportEngajamentoCSV = () => {
    if (!metrics?.allVisitors) return;
    const headers = ['Posição', 'Email', 'Vídeos', 'Materiais', 'Total Acessos', 'Último Acesso'];
    const rows = metrics.allVisitors.map((visitor, index) => [
      index + 1,
      visitor.email,
      visitor.videoCount,
      visitor.materialCount,
      visitor.totalAccesses,
      format(new Date(visitor.lastAccess), "dd/MM/yyyy HH:mm", { locale: ptBR })
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.map(formatCSVCell).join(','))].join('\n');
    downloadCSV(csvContent, `engajamento_visitantes_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
  };

  // Export Academy Clicks
  const exportAcademyClicksCSV = () => {
    if (!academyClicks) return;
    const headers = ['Email', 'Página', 'Data/Hora do Clique', 'Status'];
    const rows = academyClicks.map(click => {
      const visitante = visitantes.find(v => v.email === click.user_email);
      const converteu = visitante && !visitante.is_visitante;
      const status = converteu ? 'Converteu' : visitante ? 'Visitante' : 'Não cadastrado';
      return [
        click.user_email,
        click.page_origin,
        format(new Date(click.clicked_at), "dd/MM/yyyy HH:mm", { locale: ptBR }),
        status
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(row => row.map(formatCSVCell).join(','))].join('\n');
    downloadCSV(csvContent, `cliques_academy_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
  };

  // Export Lista de Visitantes
  const exportVisitantesCSV = () => {
    if (!visitantes || !metrics) return;
    const headers = ['Nome', 'Email', 'Telefone', 'Data Cadastro', 'Status', 'Vídeos Acessados', 'Materiais Acessados', 'Total Acessos', 'Último Acesso', 'Conteúdos Acessados'];
    const accessStatsMap = new Map(metrics.allVisitors?.map(v => [v.email, v]) || []);
    const rows = visitantes.map(visitante => {
      const accessStats = accessStatsMap.get(visitante.email || '');
      return [
        visitante.nome_completo || '',
        visitante.email || '',
        visitante.telefone || '',
        visitante.created_at ? format(new Date(visitante.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '',
        visitante.conta_ativa ? 'Ativo' : 'Inativo',
        accessStats?.videoCount || 0,
        accessStats?.materialCount || 0,
        accessStats?.totalAccesses || 0,
        accessStats?.lastAccess ? format(new Date(accessStats.lastAccess), "dd/MM/yyyy HH:mm", { locale: ptBR }) : 'Nunca',
        accessStats?.contentsList?.join('; ') || ''
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(row => row.map(formatCSVCell).join(','))].join('\n');
    downloadCSV(csvContent, `visitantes_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
  };

  // Export Relatório Completo
  const exportFullReportCSV = () => {
    let fullContent = '';
    
    // Seção 1: Top Conteúdos
    if (metrics?.topContent?.length) {
      fullContent += '=== TOP CONTEÚDOS MAIS ACESSADOS ===\n';
      fullContent += 'Posição,Conteúdo,Tipo,Total de Acessos\n';
      metrics.topContent.forEach((content, index) => {
        fullContent += [index + 1, formatCSVCell(content.title), content.type === 'video' ? 'Vídeo' : 'Material', content.count].join(',') + '\n';
      });
      fullContent += '\n';
    }

    // Seção 2: Engajamento
    if (metrics?.allVisitors?.length) {
      fullContent += '=== VISITANTES POR ENGAJAMENTO ===\n';
      fullContent += 'Posição,Email,Vídeos,Materiais,Total Acessos,Último Acesso\n';
      metrics.allVisitors.forEach((visitor, index) => {
        fullContent += [index + 1, formatCSVCell(visitor.email), visitor.videoCount, visitor.materialCount, visitor.totalAccesses, format(new Date(visitor.lastAccess), "dd/MM/yyyy HH:mm", { locale: ptBR })].join(',') + '\n';
      });
      fullContent += '\n';
    }

    // Seção 3: Academy Clicks
    if (academyClicks?.length) {
      fullContent += '=== CLIQUES BOTÃO ACADEMY ===\n';
      fullContent += 'Email,Página,Data/Hora do Clique,Status\n';
      academyClicks.forEach(click => {
        const visitante = visitantes.find(v => v.email === click.user_email);
        const converteu = visitante && !visitante.is_visitante;
        const status = converteu ? 'Converteu' : visitante ? 'Visitante' : 'Não cadastrado';
        fullContent += [formatCSVCell(click.user_email), click.page_origin, format(new Date(click.clicked_at), "dd/MM/yyyy HH:mm", { locale: ptBR }), status].join(',') + '\n';
      });
      fullContent += '\n';
    }

    // Seção 4: Lista de Visitantes
    if (visitantes?.length) {
      fullContent += '=== LISTA DE VISITANTES ===\n';
      fullContent += 'Nome,Email,Telefone,Data Cadastro,Status,Vídeos,Materiais,Total Acessos\n';
      const accessStatsMap = new Map(metrics?.allVisitors?.map(v => [v.email, v]) || []);
      visitantes.forEach(visitante => {
        const accessStats = accessStatsMap.get(visitante.email || '');
        fullContent += [
          formatCSVCell(visitante.nome_completo || ''),
          formatCSVCell(visitante.email || ''),
          visitante.telefone || '',
          visitante.created_at ? format(new Date(visitante.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '',
          visitante.conta_ativa ? 'Ativo' : 'Inativo',
          accessStats?.videoCount || 0,
          accessStats?.materialCount || 0,
          accessStats?.totalAccesses || 0
        ].join(',') + '\n';
      });
    }

    downloadCSV(fullContent, `relatorio_completo_visitantes_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
  };

  const totalVisitantes = visitantes.length;
  const visitantesAtivos = visitantes.filter(v => v.conta_ativa).length;

  const visitorsToShow = showAllVisitors 
    ? metrics?.allVisitors || [] 
    : metrics?.topVisitors || [];

  const hasMoreVisitors = (metrics?.allVisitors?.length || 0) > 10;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciar Visitantes</h1>
          <p className="text-muted-foreground">
            Gerencie contas de visitantes e converta para mentorados
          </p>
        </div>
        <Button onClick={exportFullReportCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório Completo
        </Button>
      </div>

      {/* Estatísticas Gerais - sempre visíveis */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Total de Visitantes"
          value={totalVisitantes}
          description={`${visitantesAtivos} ativos`}
          icon={Users}
        />
        <StatsCard
          title="Total de Acessos"
          value={metrics?.totalAccesses || 0}
          description={`${metrics?.accessesLast7Days || 0} nos últimos 7 dias`}
          icon={Eye}
        />
        <StatsCard
          title="Visitantes Únicos com Acesso"
          value={metrics?.uniqueUsers || 0}
          description="Que acessaram conteúdo"
          icon={UserCheck}
        />
        <StatsCard
          title="Média de Acessos/Visitante"
          value={metrics?.averagePerUser || 0}
          description="Por visitante ativo"
          icon={TrendingUp}
        />
      </div>

      {/* Top 10 Conteúdos - Colapsável */}
      {!isLoadingMetrics && metrics && metrics.topContent.length > 0 && (
        <Collapsible open={topContentOpen} onOpenChange={setTopContentOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Top 10 Conteúdos Mais Acessados
                      <Badge variant="secondary">{metrics.topContent.length} itens</Badge>
                    </CardTitle>
                    <CardDescription>Conteúdos gratuitos com maior engajamento</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={(e) => { e.stopPropagation(); exportTopContentCSV(); }}
                    >
                      <Download className="h-3 w-3" />
                      CSV
                    </Button>
                    <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", topContentOpen && "rotate-180")} />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Conteúdo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Total de Acessos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.topContent.map((content, index) => (
                        <TableRow key={content.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="max-w-[300px] truncate">{content.title}</TableCell>
                          <TableCell>
                            <Badge variant={content.type === 'video' ? 'default' : 'secondary'}>
                              {content.type === 'video' ? (
                                <><Video className="h-3 w-3 mr-1" />Vídeo</>
                              ) : (
                                <><FileText className="h-3 w-3 mr-1" />Material</>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{content.count}x</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Visitantes por Engajamento - Colapsável */}
      {!isLoadingMetrics && metrics && metrics.allVisitors && metrics.allVisitors.length > 0 && (
        <Collapsible open={engajamentoOpen} onOpenChange={setEngajamentoOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Visitantes por Engajamento
                      <Badge variant="secondary">{metrics.allVisitors.length} visitantes</Badge>
                    </CardTitle>
                    <CardDescription>Visitantes com mais acessos a conteúdos gratuitos</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={(e) => { e.stopPropagation(); exportEngajamentoCSV(); }}
                    >
                      <Download className="h-3 w-3" />
                      CSV
                    </Button>
                    <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", engajamentoOpen && "rotate-180")} />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="overflow-x-auto">
                  {hasMoreVisitors && (
                    <div className="mb-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAllVisitors(!showAllVisitors)}
                        className="gap-2"
                      >
                        {showAllVisitors ? 'Ver Top 10' : `Ver todos (${metrics.allVisitors.length})`}
                      </Button>
                    </div>
                  )}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-center">Vídeos</TableHead>
                        <TableHead className="text-center">Materiais</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead>Último Acesso</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visitorsToShow.map((visitor, index) => (
                        <TableRow key={visitor.email}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{visitor.email}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline"><Video className="h-3 w-3 mr-1" />{visitor.videoCount}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline"><FileText className="h-3 w-3 mr-1" />{visitor.materialCount}</Badge>
                          </TableCell>
                          <TableCell className="text-center font-semibold">{visitor.totalAccesses}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(visitor.lastAccess), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Cliques no Botão Academy - Colapsável */}
      {!isLoadingClicks && academyClicks && academyClicks.length > 0 && (
        <Collapsible open={academyClicksOpen} onOpenChange={setAcademyClicksOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MousePointerClick className="h-5 w-5" />
                      Cliques "Quero Aplicar na Academy"
                      <Badge variant="secondary">{academyClicks.length} cliques</Badge>
                    </CardTitle>
                    <CardDescription>Visitantes que demonstraram interesse em comprar Academy</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={(e) => { e.stopPropagation(); exportAcademyClicksCSV(); }}
                    >
                      <Download className="h-3 w-3" />
                      CSV
                    </Button>
                    <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", academyClicksOpen && "rotate-180")} />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="mb-4">
                  <StatsCard
                    title="Total de Cliques"
                    value={academyClicks.length}
                    description={`${academyClicks.filter(c => new Date(c.clicked_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} nos últimos 7 dias`}
                    icon={MousePointerClick}
                  />
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Página</TableHead>
                        <TableHead>Data/Hora do Clique</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {academyClicks.slice(0, 20).map((click) => {
                        const visitante = visitantes.find(v => v.email === click.user_email);
                        const converteu = visitante && !visitante.is_visitante;
                        return (
                          <TableRow key={click.id}>
                            <TableCell className="font-medium">{click.user_email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">{click.page_origin}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(click.clicked_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </TableCell>
                            <TableCell>
                              {converteu ? (
                                <Badge className="bg-green-500 text-white">✓ Converteu</Badge>
                              ) : visitante ? (
                                <Badge className="bg-yellow-500 text-white">Visitante</Badge>
                              ) : (
                                <Badge variant="secondary">Não cadastrado</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Lista de Visitantes - Colapsável */}
      <Collapsible open={visitantesListOpen} onOpenChange={setVisitantesListOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Lista de Visitantes
                    <Badge variant="secondary">{visitantes.length} cadastrados</Badge>
                  </CardTitle>
                  <CardDescription>Gerencie todas as contas de visitantes cadastradas</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={(e) => { e.stopPropagation(); exportVisitantesCSV(); }}
                    disabled={!visitantes.length || !metrics}
                  >
                    <Download className="h-3 w-3" />
                    CSV
                  </Button>
                  <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", visitantesListOpen && "rotate-180")} />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : visitantes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Nenhum visitante cadastrado</div>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="hidden md:table-cell">Telefone</TableHead>
                        <TableHead className="hidden lg:table-cell">Data Cadastro</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Acessos</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visitantes.map((visitante) => {
                        const accessCount = metrics?.accessesByUser?.[visitante.email || ''] || 0;
                        return (
                          <TableRow key={visitante.id}>
                            <TableCell className="font-medium">{visitante.nome_completo}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{visitante.email}</TableCell>
                            <TableCell className="hidden md:table-cell">{visitante.telefone || "-"}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {visitante.created_at ? format(new Date(visitante.created_at), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                            </TableCell>
                            <TableCell>
                              {visitante.conta_ativa ? (
                                <Badge variant="default">Ativo</Badge>
                              ) : (
                                <Badge variant="secondary">Inativo</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewAccess(visitante)}
                                className="gap-1 text-primary hover:text-primary"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="hidden sm:inline">Ver</span> ({accessCount})
                              </Button>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1 sm:gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(visitante)}>
                                  <Pencil className="h-4 w-4" />
                                  <span className="hidden lg:inline ml-1">Editar</span>
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleConvert(visitante.id)} disabled={!visitante.conta_ativa}>
                                  <UserCheck className="h-4 w-4" />
                                  <span className="hidden lg:inline ml-1">Converter</span>
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(visitante.id)}>
                                  <Trash2 className="h-4 w-4" />
                                  <span className="hidden lg:inline ml-1">Excluir</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Dialogs e Modais */}
      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Converter para Mentorado</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja converter este visitante em mentorado? Isso dará acesso completo à plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmConvert}>Converter</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditVisitanteModal open={editModalOpen} onOpenChange={setEditModalOpen} visitante={selectedVisitante} />
      <VisitorAccessDrawer visitante={selectedVisitante} open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Visitante Permanentemente</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="text-destructive font-semibold">Esta ação é IRREVERSÍVEL. O visitante será excluído completamente do sistema.</p>
              <p>Tem certeza que deseja continuar?</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
