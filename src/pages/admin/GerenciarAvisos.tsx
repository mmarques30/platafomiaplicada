import { useState, useMemo } from "react";
import { useAvisos, useDeleteAviso } from "@/hooks/admin/useAvisos";
import { useTodasAulas, useDeleteAula, AulaSemanal } from "@/hooks/useCalendarioAulas";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Search, ArrowUp, ArrowDown, Repeat } from "lucide-react";
import { AvisoModal } from "@/components/admin/AvisoModal";
import { AulaSemanalModal } from "@/components/admin/AulaSemanalModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FilterBar } from "@/components/admin/content/FilterBar";
import { Input } from "@/components/ui/input";
import { format, addDays, subDays, isAfter, isBefore, startOfDay } from "date-fns";

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

    // Busca por tema
    if (buscaTema.trim()) {
      result = result.filter(a => 
        a.tema.toLowerCase().includes(buscaTema.toLowerCase())
      );
    }

    // Filtro por tipo de evento
    if (tipoEventoFilter !== 'todos') {
      result = result.filter(a => a.tipo_evento === tipoEventoFilter);
    }

    // Filtro por status (ativo/inativo)
    if (statusAulaFilter === 'ativo') {
      result = result.filter(a => a.ativo);
    } else if (statusAulaFilter === 'inativo') {
      result = result.filter(a => !a.ativo);
    } else if (statusAulaFilter === 'realizada') {
      result = result.filter(a => a.realizada);
    } else if (statusAulaFilter === 'pendente') {
      result = result.filter(a => !a.realizada);
    }

    // Filtro por período
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

    // Ordenação
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

  const clearAvisosFilters = () => {
    setStatusAvisoFilter('todos');
    setTipoAvisoFilter('todos');
    setOrdenacaoAviso('recente');
  };

  const clearAulasFilters = () => {
    setBuscaTema('');
    setPeriodoFilter('todos');
    setTipoEventoFilter('todos');
    setStatusAulaFilter('todos');
    setOrdenacaoAula('asc');
  };

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
    <div>
      <h1 className="text-3xl font-bold mb-8">Gerenciar Avisos e Conteúdo</h1>

      <Tabs defaultValue="avisos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="avisos">Avisos</TabsTrigger>
          <TabsTrigger value="encontros">Encontros IAplicada</TabsTrigger>
        </TabsList>

        <TabsContent value="avisos" className="space-y-4">
          <FilterBar
            filters={avisosFilters}
            totalItems={avisos?.length || 0}
            filteredItems={avisosFiltrados.length}
            actionButton={
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Aviso
              </Button>
            }
          />

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Visível Para</TableHead>
                  <TableHead>Expiração</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {avisosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum aviso encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  avisosFiltrados.map((aviso) => (
                    <TableRow key={aviso.id}>
                      <TableCell className="font-medium">{aviso.titulo}</TableCell>
                      <TableCell><Badge>{aviso.tipo}</Badge></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {aviso.visivel_para?.map((plano: string) => (
                            <Badge key={plano} variant="outline" className="text-xs capitalize">
                              {plano}
                            </Badge>
                          )) || <span className="text-muted-foreground text-xs">Todos</span>}
                        </div>
                      </TableCell>
                      <TableCell>{aviso.data_expiracao ? format(new Date(aviso.data_expiracao), "dd/MM/yyyy") : "-"}</TableCell>
                      <TableCell>
                        <Badge variant={aviso.ativo ? "default" : "secondary"}>
                          {aviso.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingAviso(aviso); setIsModalOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteId(aviso.id)}>
                          <Trash2 className="h-4 w-4" />
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
          {/* Campo de busca por tema */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por tema..."
              value={buscaTema}
              onChange={(e) => setBuscaTema(e.target.value)}
              className="pl-10"
            />
          </div>

          <FilterBar
            filters={aulasFilters}
            totalItems={aulas?.length || 0}
            filteredItems={aulasFiltradas.length}
            actionButton={
              <Button onClick={() => { setEditingAula(null); setIsAulaModalOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Encontro
              </Button>
            }
          />

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tema</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      Data
                      {ordenacaoAula === 'asc' ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Recorrente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Realização</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingAulas ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">Carregando...</TableCell>
                  </TableRow>
                ) : aulasFiltradas.length > 0 ? (
                  aulasFiltradas.map((aula) => (
                    <TableRow key={aula.id}>
                      <TableCell className="font-medium">{aula.tema}</TableCell>
                      <TableCell>
                        <Badge variant={getTipoEventoBadgeVariant(aula.tipo_evento)}>
                          {getTipoEventoLabel(aula.tipo_evento)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {aula.data_aula ? format(new Date(aula.data_aula), "dd/MM/yyyy") : "-"}
                      </TableCell>
                      <TableCell>{aula.horario || "-"}</TableCell>
                      <TableCell>
                        {aula.recorrente && (
                          <Repeat className="h-4 w-4 text-primary" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={aula.ativo ? "default" : "secondary"}>
                          {aula.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={aula.realizada ? "default" : "outline"} className={aula.realizada ? "bg-green-600" : ""}>
                          {aula.realizada ? "Realizada" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { 
                            setEditingAula(aula); 
                            setIsAulaModalOpen(true); 
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setDeleteAulaId(aula.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Nenhum encontro encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão do aviso</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este aviso? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { 
              if (deleteId) deleteAviso.mutate(deleteId); 
              setDeleteId(null); 
            }}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteAulaId} onOpenChange={() => setDeleteAulaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão do encontro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este encontro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { 
              if (deleteAulaId) deleteAula.mutate(deleteAulaId); 
              setDeleteAulaId(null); 
            }}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
