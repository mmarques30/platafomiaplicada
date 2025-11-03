import { useState, useMemo } from "react";
import { useModulos, useDeleteModulo, useModulosStats, useTrilhas } from "@/hooks/admin/useContent";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ModuloModal } from "./ModuloModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FilterBar } from "./FilterBar";

export function ModulosTab() {
  const { data: modulos, isLoading } = useModulos();
  const { data: stats } = useModulosStats();
  const { data: trilhas } = useTrilhas();
  const deleteModulo = useDeleteModulo();
  const [editingModulo, setEditingModulo] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Estados de filtro
  const [trilhaFilter, setTrilhaFilter] = useState<string>('todas');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('todas');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [statusVisibilidade, setStatusVisibilidade] = useState<string>('todos');

  const handleClearFilters = () => {
    setTrilhaFilter('todas');
    setCategoriaFilter('todas');
    setStatusFilter('todos');
    setStatusVisibilidade('todos');
  };

  // Filtrar módulos
  const modulosFiltrados = useMemo(() => {
    return modulos?.filter(modulo => {
      if (trilhaFilter !== 'todas' && modulo.trilha_id !== trilhaFilter) return false;
      if (categoriaFilter !== 'todas' && modulo.categoria !== categoriaFilter) return false;
      if (statusFilter === 'ativo' && !modulo.ativo) return false;
      if (statusFilter === 'inativo' && modulo.ativo) return false;
      
      // Filtro de visibilidade
      if (statusVisibilidade === 'publicado' && (!modulo.ativo || !modulo.visivel_mentorados)) return false;
      if (statusVisibilidade === 'rascunho' && (!modulo.ativo || modulo.visivel_mentorados)) return false;
      if (statusVisibilidade === 'arquivado' && modulo.ativo) return false;
      
      return true;
    }) || [];
  }, [modulos, trilhaFilter, categoriaFilter, statusFilter, statusVisibilidade]);

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Módulos</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Módulo
        </Button>
      </div>

      <FilterBar
        filters={[
          {
            id: 'trilha',
            label: 'Trilha',
            placeholder: 'Todas as trilhas',
            value: trilhaFilter,
            onChange: setTrilhaFilter,
            options: [
              { value: 'todas', label: 'Todas as trilhas' },
              ...(trilhas?.map(t => ({ value: t.id, label: t.titulo })) || []),
            ],
          },
          {
            id: 'categoria',
            label: 'Categoria',
            placeholder: 'Todas as categorias',
            value: categoriaFilter,
            onChange: setCategoriaFilter,
            options: [
              { value: 'todas', label: 'Todas as categorias' },
              { value: 'núcleo', label: 'Núcleo' },
              { value: 'ferramentas', label: 'Ferramentas' },
              { value: 'profissão', label: 'Profissão' },
              { value: 'aulas semanais', label: 'Aulas Semanais' },
            ],
          },
          {
            id: 'status',
            label: 'Status',
            placeholder: 'Todos os status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: 'todos', label: 'Todos os status' },
              { value: 'ativo', label: 'Ativo' },
              { value: 'inativo', label: 'Inativo' },
            ],
          },
          {
            id: 'visibilidade',
            label: 'Publicação',
            placeholder: 'Todos',
            value: statusVisibilidade,
            onChange: setStatusVisibilidade,
            options: [
              { value: 'todos', label: 'Todos' },
              { value: 'publicado', label: 'Publicados' },
              { value: 'rascunho', label: 'Rascunhos' },
              { value: 'arquivado', label: 'Arquivados' },
            ],
          },
        ]}
        onClear={handleClearFilters}
        totalItems={modulos?.length || 0}
        filteredItems={modulosFiltrados.length}
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Trilha</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data Início</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Vídeos</TableHead>
              <TableHead>Materiais</TableHead>
              <TableHead>Exercícios</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {modulosFiltrados.map((modulo: any) => {
              const moduloStat = stats?.find((s: any) => s.modulo_id === modulo.id);
              return (
              <TableRow key={modulo.id}>
                <TableCell className="font-medium">{modulo.titulo}</TableCell>
                <TableCell>{modulo.trilha?.titulo}</TableCell>
                <TableCell>
                  {modulo.categoria === 'aulas semanais' && (
                    <Badge variant="outline" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)', borderColor: 'hsl(var(--primary))' }}>
                      Aulas Semanais
                    </Badge>
                  )}
                  {modulo.categoria === 'núcleo' && (
                    <Badge variant="outline" style={{ backgroundColor: '#10B98120', borderColor: '#10B981' }}>
                      NÚCLEO
                    </Badge>
                  )}
                  {modulo.categoria === 'ferramentas' && (
                    <Badge variant="outline" style={{ backgroundColor: '#F59E0B20', borderColor: '#F59E0B' }}>
                      FERRAMENTAS
                    </Badge>
                  )}
                  {modulo.categoria === 'profissão' && (
                    <Badge variant="outline" style={{ backgroundColor: '#8B5CF620', borderColor: '#8B5CF6' }}>
                      PROFISSÃO
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {modulo.data_inicio ? (
                    format(new Date(modulo.data_inicio), "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell>{modulo.ordem}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{moduloStat?.total_videos || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{moduloStat?.total_materiais || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{moduloStat?.total_exercicios || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant={modulo.ativo ? "default" : "secondary"}>
                        {modulo.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                      {modulo.ativo && !modulo.visivel_mentorados && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/50">
                          Rascunho
                        </Badge>
                      )}
                      {modulo.ativo && modulo.visivel_mentorados && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/50">
                          Publicado
                        </Badge>
                      )}
                      {modulo.trilha_visivel && !modulo.visivel_mentorados && (
                        <Badge variant="destructive" className="text-xs">
                          ⚠️ Invisível em trilha visível
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingModulo(modulo); setIsModalOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(modulo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ModuloModal 
        open={isModalOpen} 
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingModulo(null);
        }} 
        modulo={editingModulo} 
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este módulo?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteModulo.mutate(deleteId); setDeleteId(null); }}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
