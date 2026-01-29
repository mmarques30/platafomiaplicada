import { useState, useMemo } from "react";
import { useAvisos, useDeleteAviso } from "@/hooks/admin/useAvisos";
import { useTodasAulas, useDeleteAula, AulaSemanal } from "@/hooks/useCalendarioAulas";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Search, ArrowUp, ArrowDown, Repeat, Bell, Calendar, ClipboardList } from "lucide-react";
import { AvisoModal } from "@/components/admin/AvisoModal";
import { AulaSemanalModal } from "@/components/admin/AulaSemanalModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FilterBar } from "@/components/admin/content/FilterBar";
import { Input } from "@/components/ui/input";
import { format, addDays, subDays, isAfter, isBefore, startOfDay } from "date-fns";
import { adminTheme } from "@/components/admin/adminTheme";
import { GerenciarPendencias } from "@/components/admin/dashboard/GerenciarPendencias";

export default function GerenciarAvisos() {
  const { data: avisos, isLoading } = useAvisos();
  const { data: aulas, isLoading: isLoadingAulas } = useTodasAulas();
  const deleteAviso = useDeleteAviso();
  const deleteAula = useDeleteAula();
  
  const [editingAviso, setEditingAviso] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [editingAula, setEditingAula] = useState<AulaSemanal | null>(null);
  const [isAulaModalOpen, setIsAulaModalOpen] = useState(false);
  const [deleteAulaId, setDeleteAulaId] = useState<string | null>(null);

  // Filtros para Avisos
  const [statusAvisoFilter, setStatusAvisoFilter] = useState('todos');
  const [tipoAvisoFilter, setTipoAvisoFilter] = useState('todos');
  const [ordenacaoAviso, setOrdenacaoAviso] = useState('recente');

  // Filtros para Encontros
  const [buscaTema, setBuscaTema] = useState('');
  const [periodoFilter, setPeriodoFilter] = useState('todos');
  const [tipoEventoFilter, setTipoEventoFilter] = useState('todos');
  const [statusAulaFilter, setStatusAulaFilter] = useState('todos');
  const [ordenacaoAula, setOrdenacaoAula] = useState('asc');

  // Tipos únicos de avisos
  const tiposAviso = useMemo(() => {
    if (!avisos) return [];
    const tipos = [...new Set(avisos.map(a => a.tipo))];
    return tipos.filter(Boolean);
  }, [avisos]);

  // Filtrar avisos
  const avisosFiltrados = useMemo(() => {
    let result = avisos || [];

    if (statusAvisoFilter === 'ativo') {
      result = result.filter(a => a.ativo);
    } else if (statusAvisoFilter === 'inativo') {
      result = result.filter(a => !a.ativo);
    }

    if (tipoAvisoFilter !== 'todos') {
      result = result.filter(a => a.tipo === tipoAvisoFilter);
    }

    result = [...result].sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return ordenacaoAviso === 'recente' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [avisos, statusAvisoFilter, tipoAvisoFilter, ordenacaoAviso]);

  // Filtrar encontros/aulas
  const aulasFiltradas = useMemo(() => {
    let result = aulas || [];
    const hoje = startOfDay(new Date());

    if (buscaTema.trim()) {
      result = result.filter(a => 
        a.tema.toLowerCase().includes(buscaTema.toLowerCase())
      );
    }

    if (tipoEventoFilter !== 'todos') {
      result = result.filter(a => a.tipo_evento === tipoEventoFilter);
    }

    if (statusAulaFilter === 'ativo') {
      result = result.filter(a => a.ativo);
    } else if (statusAulaFilter === 'inativo') {
      result = result.filter(a => !a.ativo);
    } else if (statusAulaFilter === 'realizada') {
      result = result.filter(a => a.realizada);
    } else if (statusAulaFilter === 'pendente') {
      result = result.filter(a => !a.realizada);
    }

    if (periodoFilter === 'proximos7') {
      const limite = addDays(hoje, 7);
      result = result.filter(a => {
        if (!a.data_aula) return false;
        const dataAula = new Date(a.data_aula);
        return !isBefore(dataAula, hoje) && !isAfter(dataAula, limite);
      });
    } else if (periodoFilter === 'proximos30') {
      const limite = addDays(hoje, 30);
      result = result.filter(a => {
        if (!a.data_aula) return false;
        const dataAula = new Date(a.data_aula);
        return !isBefore(dataAula, hoje) && !isAfter(dataAula, limite);
      });
    } else if (periodoFilter === 'ultimos30') {
      const limite = subDays(hoje, 30);
      result = result.filter(a => {
        if (!a.data_aula) return false;
        const dataAula = new Date(a.data_aula);
        return !isAfter(dataAula, hoje) && !isBefore(dataAula, limite);
      });
    }

    result = [...result].sort((a, b) => {
      if (!a.data_aula && !b.data_aula) return 0;
      if (!a.data_aula) return 1;
      if (!b.data_aula) return -1;
      const dateA = new Date(a.data_aula).getTime();
      const dateB = new Date(b.data_aula).getTime();
      return ordenacaoAula === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [aulas, buscaTema, tipoEventoFilter, statusAulaFilter, periodoFilter, ordenacaoAula]);

  const avisosFilters = [
    {
      id: 'status',
      label: 'Status',
      placeholder: 'Status',
      value: statusAvisoFilter,
      onChange: setStatusAvisoFilter,
      options: [
        { value: 'todos', label: 'Todos os Status' },
        { value: 'ativo', label: 'Ativo' },
        { value: 'inativo', label: 'Inativo' },
      ]
    },
    {
      id: 'tipo',
      label: 'Tipo',
      placeholder: 'Tipo',
      value: tipoAvisoFilter,
      onChange: setTipoAvisoFilter,
      options: [
        { value: 'todos', label: 'Todos os Tipos' },
        ...tiposAviso.map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))
      ]
    },
    {
      id: 'ordenacao',
      label: 'Ordenação',
      placeholder: 'Ordenar por',
      value: ordenacaoAviso,
      onChange: setOrdenacaoAviso,
      options: [
        { value: 'recente', label: 'Mais Recentes' },
        { value: 'antigo', label: 'Mais Antigos' },
      ]
    }
  ];

  const aulasFilters = [
    {
      id: 'periodo',
      label: 'Período',
      placeholder: 'Período',
      value: periodoFilter,
      onChange: setPeriodoFilter,
      options: [
        { value: 'todos', label: 'Todos os Períodos' },
        { value: 'proximos7', label: 'Próximos 7 dias' },
        { value: 'proximos30', label: 'Próximos 30 dias' },
        { value: 'ultimos30', label: 'Últimos 30 dias' },
      ]
    },
    {
      id: 'tipoEvento',
      label: 'Tipo de Evento',
      placeholder: 'Tipo de Evento',
      value: tipoEventoFilter,
      onChange: setTipoEventoFilter,
      options: [
        { value: 'todos', label: 'Todos os Tipos' },
        { value: 'aula_ao_vivo', label: 'Aula ao Vivo' },
        { value: 'qa', label: 'Q&A' },
        { value: 'live_youtube', label: 'Live YouTube' },
        { value: 'outro', label: 'Outro' },
      ]
    },
    {
      id: 'status',
      label: 'Status',
      placeholder: 'Status',
      value: statusAulaFilter,
      onChange: setStatusAulaFilter,
      options: [
        { value: 'todos', label: 'Todos os Status' },
        { value: 'ativo', label: 'Ativo' },
        { value: 'inativo', label: 'Inativo' },
        { value: 'realizada', label: 'Realizada' },
        { value: 'pendente', label: 'Pendente' },
      ]
    },
    {
      id: 'ordenacao',
      label: 'Ordenação',
      placeholder: 'Ordenar por Data',
      value: ordenacaoAula,
      onChange: setOrdenacaoAula,
      options: [
        { value: 'asc', label: 'Data Crescente ↑' },
        { value: 'desc', label: 'Data Decrescente ↓' },
      ]
    }
  ];

  const getTipoEventoLabel = (tipo: string | null) => {
    switch (tipo) {
      case 'aula_ao_vivo': return 'Aula ao Vivo';
      case 'qa': return 'Q&A';
      case 'live_youtube': return 'Live YouTube';
      case 'outro': return 'Outro';
      default: return '-';
    }
  };

  const getTipoEventoBadgeVariant = (tipo: string | null) => {
    switch (tipo) {
      case 'aula_ao_vivo': return 'default';
      case 'qa': return 'secondary';
      case 'live_youtube': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className={adminTheme.page}>
      <div className={adminTheme.pageTitleWrapper}>
        <Bell className={adminTheme.pageIcon} />
        <h1 className={adminTheme.pageTitle}>Gerenciar Avisos e Encontros</h1>
      </div>

      <Tabs defaultValue="avisos" className="space-y-4">
        <TabsList className={adminTheme.tabsList}>
          <TabsTrigger value="avisos" className={adminTheme.tabsTrigger}>
            <Bell className={adminTheme.tabsIcon} />
            Avisos
          </TabsTrigger>
          <TabsTrigger value="encontros" className={adminTheme.tabsTrigger}>
            <Calendar className={adminTheme.tabsIcon} />
            Encontros IAplicada
          </TabsTrigger>
          <TabsTrigger value="pendencias" className={adminTheme.tabsTrigger}>
            <ClipboardList className={adminTheme.tabsIcon} />
            Pendências
          </TabsTrigger>
        </TabsList>

        <TabsContent value="avisos" className="space-y-4">
          <FilterBar
            filters={avisosFilters}
            totalItems={avisos?.length || 0}
            filteredItems={avisosFiltrados.length}
            actionButton={
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Novo Aviso
              </Button>
            }
          />

          <div className={adminTheme.tableContainer}>
            <Table>
              <TableHeader className={adminTheme.tableHeader}>
                <TableRow>
                  <TableHead className={adminTheme.tableHeaderCell}>Título</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Tipo</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Visível Para</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Expiração</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Status</TableHead>
                  <TableHead className={`${adminTheme.tableHeaderCell} text-right`}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {avisosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum aviso encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  avisosFiltrados.map((aviso) => (
                    <TableRow key={aviso.id} className={adminTheme.tableRow}>
                      <TableCell className="font-medium">{aviso.titulo}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{aviso.tipo}</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {aviso.visivel_para?.map((plano: string) => (
                            <Badge key={plano} variant="outline" className="text-xs capitalize">
                              {plano}
                            </Badge>
                          )) || <span className="text-muted-foreground text-xs">Todos</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{aviso.data_expiracao ? format(new Date(aviso.data_expiracao), "dd/MM/yyyy") : "-"}</TableCell>
                      <TableCell>
                        <Badge variant={aviso.ativo ? "default" : "secondary"} className="text-xs">
                          {aviso.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingAviso(aviso); setIsModalOpen(true); }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteId(aviso.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="encontros" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por tema..."
              value={buscaTema}
              onChange={(e) => setBuscaTema(e.target.value)}
              className="pl-10 h-9"
            />
          </div>

          <FilterBar
            filters={aulasFilters}
            totalItems={aulas?.length || 0}
            filteredItems={aulasFiltradas.length}
            actionButton={
              <Button size="sm" onClick={() => { setEditingAula(null); setIsAulaModalOpen(true); }}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Novo Encontro
              </Button>
            }
          />

          <div className={adminTheme.tableContainer}>
            <Table>
              <TableHeader className={adminTheme.tableHeader}>
                <TableRow>
                  <TableHead className={adminTheme.tableHeaderCell}>Tema</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Tipo</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>
                    <div className="flex items-center gap-1">
                      Data
                      {ordenacaoAula === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Horário</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Recorrente</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Status</TableHead>
                  <TableHead className={adminTheme.tableHeaderCell}>Realização</TableHead>
                  <TableHead className={`${adminTheme.tableHeaderCell} text-right`}>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingAulas ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">Carregando...</TableCell>
                  </TableRow>
                ) : aulasFiltradas.length > 0 ? (
                  aulasFiltradas.map((aula) => (
                    <TableRow key={aula.id} className={adminTheme.tableRow}>
                      <TableCell className="font-medium">{aula.tema}</TableCell>
                      <TableCell>
                        <Badge variant={getTipoEventoBadgeVariant(aula.tipo_evento)} className="text-xs">
                          {getTipoEventoLabel(aula.tipo_evento)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {aula.data_aula ? format(new Date(aula.data_aula), "dd/MM/yyyy") : "-"}
                      </TableCell>
                      <TableCell className="text-sm">{aula.horario || "-"}</TableCell>
                      <TableCell>
                        {aula.recorrente && (
                          <Repeat className="h-4 w-4 text-primary" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={aula.ativo ? "default" : "secondary"} className="text-xs">
                          {aula.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={aula.realizada ? "default" : "outline"} className={`text-xs ${aula.realizada ? "bg-green-600" : ""}`}>
                          {aula.realizada ? "Realizada" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { 
                            setEditingAula(aula); 
                            setIsAulaModalOpen(true); 
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setDeleteAulaId(aula.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Nenhum encontro encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="pendencias" className="space-y-4">
          <GerenciarPendencias />
        </TabsContent>
      </Tabs>

      <AvisoModal 
        open={isModalOpen} 
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingAviso(null);
        }} 
        aviso={editingAviso} 
      />

      <AulaSemanalModal 
        open={isAulaModalOpen} 
        onOpenChange={(open) => {
          setIsAulaModalOpen(open);
          if (!open) setEditingAula(null);
        }} 
        aula={editingAula} 
      />

      {/* Delete Aviso Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este aviso? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteAviso.mutate(deleteId); setDeleteId(null); }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Aula Dialog */}
      <AlertDialog open={!!deleteAulaId} onOpenChange={() => setDeleteAulaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este encontro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteAulaId) deleteAula.mutate(deleteAulaId); setDeleteAulaId(null); }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
