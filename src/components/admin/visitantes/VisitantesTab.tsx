import { useState, useMemo } from "react";
import { useVisitantes } from "@/hooks/useVisitantes";
import { useCuponsVisitantes } from "@/hooks/admin/useCuponsVisitantes";
import { useContentAccessMetrics } from "@/hooks/admin/useContentAccessMetrics";
import { useAcademyPurchaseClicks } from "@/hooks/admin/useButtonClickLogs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditVisitanteModal } from "@/components/admin/EditVisitanteModal";
import { NovoVisitanteModal } from "@/components/admin/NovoVisitanteModal";
import { VisitorAccessDrawer } from "@/components/admin/VisitorAccessDrawer";
import { StatsCard } from "@/components/admin/StatsCard";
import { Users, UserCheck, Trash2, Pencil, Eye, TrendingUp, Video, FileText, MousePointerClick, Download, ChevronDown, Search, UserPlus, Clock, RefreshCw, Tag, X } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VisitantesTabProps {
  onExportFullReport: () => void;
}

export function VisitantesTab({ onExportFullReport }: VisitantesTabProps) {
  const { visitantes, isLoading, convertToMentorado, deleteVisitante, updateVisitante } = useVisitantes();
  const { cupons } = useCuponsVisitantes();
  const { data: metrics, isLoading: isLoadingMetrics } = useContentAccessMetrics();
  const { data: academyClicks, isLoading: isLoadingClicks } = useAcademyPurchaseClicks();
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [novoVisitanteModalOpen, setNovoVisitanteModalOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedVisitante, setSelectedVisitante] = useState<typeof visitantes[0] | null>(null);
  const [showAllVisitors, setShowAllVisitors] = useState(false);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [cupomFilter, setCupomFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [acessosFilter, setAcessosFilter] = useState("all");

  // Estados para seções colapsáveis
  const [topContentOpen, setTopContentOpen] = useState(false);
  const [engajamentoOpen, setEngajamentoOpen] = useState(false);
  const [academyClicksOpen, setAcademyClicksOpen] = useState(false);
  const [visitantesListOpen, setVisitantesListOpen] = useState(false);

  // Função para calcular status do visitante
  const getVisitorStatus = (visitante: typeof visitantes[0]) => {
    const diasRestantes = visitante.acesso_expira_em 
      ? differenceInDays(new Date(visitante.acesso_expira_em), new Date())
      : null;
    const isExpired = visitante.acesso_expirado || (diasRestantes !== null && diasRestantes < 0);
    
    if (isExpired) return 'expirado';
    if (!visitante.conta_ativa) return 'inativo';
    if (diasRestantes !== null && diasRestantes <= 7) return 'expirando';
    return 'ativo';
  };

  // Função para verificar range de acessos
  const matchAcessos = (count: number, filter: string) => {
    switch (filter) {
      case '0': return count === 0;
      case '1-5': return count >= 1 && count <= 5;
      case '6-20': return count >= 6 && count <= 20;
      case '20+': return count > 20;
      default: return true;
    }
  };

  // Filtrar visitantes
  const filteredVisitantes = useMemo(() => {
    return visitantes.filter(v => {
      // Filtro por texto
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
          v.nome_completo?.toLowerCase().includes(term) ||
          v.email?.toLowerCase().includes(term) ||
          v.telefone?.includes(term);
        if (!matchesSearch) return false;
      }
      
      // Filtro por cupom
      if (cupomFilter !== 'all') {
        const cupomVisitante = v.cupom_especial || 'Academy12';
        if (cupomVisitante !== cupomFilter) return false;
      }
      
      // Filtro por status
      if (statusFilter !== 'all') {
        const status = getVisitorStatus(v);
        if (status !== statusFilter) return false;
      }
      
      // Filtro por acessos
      if (acessosFilter !== 'all') {
        const count = metrics?.accessesByUser?.[v.email || ''] || 0;
        if (!matchAcessos(count, acessosFilter)) return false;
      }
      
      return true;
    });
  }, [visitantes, searchTerm, cupomFilter, statusFilter, acessosFilter, metrics]);

  const hasActiveFilters = cupomFilter !== 'all' || statusFilter !== 'all' || acessosFilter !== 'all';

  const clearFilters = () => {
    setCupomFilter('all');
    setStatusFilter('all');
    setAcessosFilter('all');
    setSearchTerm('');
  };

  // Handlers
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

  const handleChangeCupom = async (visitanteId: string, novoCupom: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ cupom_especial: novoCupom })
      .eq("id", visitanteId);
    
    if (error) {
      toast.error("Erro ao alterar cupom");
    } else {
      toast.success(`Cupom alterado para ${novoCupom}`);
      window.location.reload();
    }
  };

  // Export functions
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

  const formatCSVCell = (cell: string | number) => {
    const cellStr = String(cell);
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
      return `"${cellStr.replace(/"/g, '""')}"`;
    }
    return cellStr;
  };

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

  const exportVisitantesCSV = () => {
    if (!visitantes || !metrics) return;
    const headers = ['Nome', 'Email', 'Telefone', 'Data Cadastro', 'Status', 'Cupom', 'Vídeos Acessados', 'Materiais Acessados', 'Total Acessos', 'Último Acesso'];
    const accessStatsMap = new Map(metrics.allVisitors?.map(v => [v.email, v]) || []);
    const rows = filteredVisitantes.map(visitante => {
      const accessStats = accessStatsMap.get(visitante.email || '');
      return [
        visitante.nome_completo || '',
        visitante.email || '',
        visitante.telefone || '',
        visitante.created_at ? format(new Date(visitante.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '',
        getVisitorStatus(visitante),
        visitante.cupom_especial || 'Academy12',
        accessStats?.videoCount || 0,
        accessStats?.materialCount || 0,
        accessStats?.totalAccesses || 0,
        accessStats?.lastAccess ? format(new Date(accessStats.lastAccess), "dd/MM/yyyy HH:mm", { locale: ptBR }) : 'Nunca'
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(row => row.map(formatCSVCell).join(','))].join('\n');
    downloadCSV(csvContent, `visitantes_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`);
  };

  const totalVisitantes = visitantes.length;
  const visitantesAtivos = visitantes.filter(v => v.conta_ativa).length;

  const visitorsToShow = showAllVisitors 
    ? metrics?.allVisitors || [] 
    : metrics?.topVisitors || [];

  const hasMoreVisitors = (metrics?.allVisitors?.length || 0) > 10;

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
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

      {/* Top 10 Conteúdos */}
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

      {/* Visitantes por Engajamento */}
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

      {/* Cliques no Botão Academy */}
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

      {/* Lista de Visitantes */}
      <Collapsible open={visitantesListOpen} onOpenChange={setVisitantesListOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Lista de Visitantes
                    <Badge variant="secondary">{visitantes.length} cadastrados</Badge>
                    {hasActiveFilters && (
                      <Badge variant="outline" className="text-primary">
                        {filteredVisitantes.length} filtrados
                      </Badge>
                    )}
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
              {/* Barra de busca e filtros */}
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome, email ou telefone..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={() => setNovoVisitanteModalOpen(true)} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Cadastrar Visitante
                  </Button>
                </div>
                
                {/* Filtros avançados */}
                <div className="flex flex-wrap gap-2 items-center">
                  <Select value={cupomFilter} onValueChange={setCupomFilter}>
                    <SelectTrigger className="w-[140px]">
                      <Tag className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Cupom" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos cupons</SelectItem>
                      {cupons.map(c => (
                        <SelectItem key={c.codigo} value={c.codigo}>{c.codigo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos status</SelectItem>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="expirando">Expirando</SelectItem>
                      <SelectItem value="expirado">Expirado</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={acessosFilter} onValueChange={setAcessosFilter}>
                    <SelectTrigger className="w-[140px]">
                      <Eye className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Acessos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="0">Sem acessos</SelectItem>
                      <SelectItem value="1-5">1 a 5</SelectItem>
                      <SelectItem value="6-20">6 a 20</SelectItem>
                      <SelectItem value="20+">20+</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                      <X className="h-4 w-4" />
                      Limpar
                    </Button>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : filteredVisitantes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || hasActiveFilters ? "Nenhum visitante encontrado com os critérios de busca" : "Nenhum visitante cadastrado"}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="hidden md:table-cell">Telefone</TableHead>
                        <TableHead className="hidden lg:table-cell">Cadastro</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-center">Dias Restantes</TableHead>
                        <TableHead className="text-center">Cupom</TableHead>
                        <TableHead className="text-center">Acessos</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisitantes.map((visitante) => {
                        const accessCount = metrics?.accessesByUser?.[visitante.email || ''] || 0;
                        const diasRestantes = visitante.acesso_expira_em 
                          ? differenceInDays(new Date(visitante.acesso_expira_em), new Date())
                          : null;
                        const status = getVisitorStatus(visitante);
                        const isExpired = status === 'expirado';
                        
                        const handleExtendAccess = async () => {
                          const { error } = await supabase
                            .from("profiles")
                            .update({ 
                              acesso_expira_em: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                              acesso_expirado: false,
                              conta_ativa: true
                            })
                            .eq("id", visitante.id);
                          
                          if (error) {
                            toast.error("Erro ao estender acesso");
                          } else {
                            toast.success("Acesso estendido por 30 dias!");
                            window.location.reload();
                          }
                        };
                        
                        return (
                          <TableRow key={visitante.id}>
                            <TableCell className="font-medium">{visitante.nome_completo}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{visitante.email}</TableCell>
                            <TableCell className="hidden md:table-cell">{visitante.telefone || "-"}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {visitante.created_at ? format(new Date(visitante.created_at), "dd/MM/yy", { locale: ptBR }) : "-"}
                            </TableCell>
                            <TableCell>
                              {status === 'expirado' ? (
                                <Badge variant="destructive">Expirado</Badge>
                              ) : status === 'inativo' ? (
                                <Badge variant="secondary">Inativo</Badge>
                              ) : status === 'expirando' ? (
                                <Badge className="bg-amber-500 text-white">Expirando</Badge>
                              ) : (
                                <Badge variant="default">Ativo</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {isExpired ? (
                                <span className="text-destructive font-medium">-</span>
                              ) : diasRestantes !== null ? (
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    diasRestantes <= 3 && "border-destructive text-destructive",
                                    diasRestantes > 3 && diasRestantes <= 7 && "border-amber-500 text-amber-600",
                                    diasRestantes > 7 && "border-primary text-primary"
                                  )}
                                >
                                  <Clock className="h-3 w-3 mr-1" />
                                  {diasRestantes}d
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Select
                                value={visitante.cupom_especial || "Academy12"}
                                onValueChange={(value) => handleChangeCupom(visitante.id, value)}
                              >
                                <SelectTrigger className="h-8 w-[110px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {cupons.filter(c => c.ativo).map(c => (
                                    <SelectItem key={c.codigo} value={c.codigo}>{c.codigo}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewAccess(visitante)}
                                className="gap-1 text-primary hover:text-primary"
                              >
                                <Eye className="h-4 w-4" />
                                ({accessCount})
                              </Button>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {isExpired && (
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleExtendAccess}
                                    className="text-primary"
                                    title="Reativar +30 dias"
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => handleEdit(visitante)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleConvert(visitante.id)} disabled={!visitante.conta_ativa}>
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(visitante.id)}>
                                  <Trash2 className="h-4 w-4" />
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
      <NovoVisitanteModal open={novoVisitanteModalOpen} onOpenChange={setNovoVisitanteModalOpen} />
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
