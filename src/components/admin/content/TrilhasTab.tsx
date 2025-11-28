import { useState, useMemo } from "react";
import { useTrilhas, useDeleteTrilha, useTrilhasStats } from "@/hooks/admin/useContent";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, AlertTriangle } from "lucide-react";
import { TrilhaModal } from "./TrilhaModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FilterBar } from "./FilterBar";

export function TrilhasTab() {
  const { data: trilhas, isLoading } = useTrilhas();
  const { data: stats } = useTrilhasStats();
  const deleteTrilha = useDeleteTrilha();
  const [editingTrilha, setEditingTrilha] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Estados de filtro
  const [categoriaFilter, setCategoriaFilter] = useState<string>('todas');
  const [nivelFilter, setNivelFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [statusVisibilidade, setStatusVisibilidade] = useState<string>('todos');

  const handleEdit = (trilha: any) => {
    setEditingTrilha(trilha);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingTrilha(null);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteTrilha.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleClearFilters = () => {
    setCategoriaFilter('todas');
    setNivelFilter('todos');
    setStatusFilter('todos');
    setStatusVisibilidade('todos');
  };

  // Filtrar trilhas
  const trilhasFiltradas = useMemo(() => {
    return trilhas?.filter(trilha => {
      if (categoriaFilter !== 'todas' && trilha.categoria !== categoriaFilter) return false;
      if (nivelFilter !== 'todos' && trilha.nivel !== nivelFilter) return false;
      if (statusFilter === 'ativo' && !trilha.ativo) return false;
      if (statusFilter === 'inativo' && trilha.ativo) return false;
      
      // Filtro de visibilidade
      if (statusVisibilidade === 'publicado' && (!trilha.ativo || !trilha.visivel_mentorados)) return false;
      if (statusVisibilidade === 'rascunho' && (!trilha.ativo || trilha.visivel_mentorados)) return false;
      if (statusVisibilidade === 'arquivado' && trilha.ativo) return false;
      
      return true;
    }) || [];
  }, [trilhas, categoriaFilter, nivelFilter, statusFilter, statusVisibilidade]);

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Trilhas de Aprendizado</h2>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Trilha
        </Button>
      </div>

      <FilterBar
        filters={[
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
            id: 'nivel',
            label: 'Nível',
            placeholder: 'Todos os níveis',
            value: nivelFilter,
            onChange: setNivelFilter,
            options: [
              { value: 'todos', label: 'Todos os níveis' },
              { value: 'iniciante', label: 'Iniciante' },
              { value: 'intermediário', label: 'Intermediário' },
              { value: 'avançado', label: 'Avançado' },
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
        totalItems={trilhas?.length || 0}
        filteredItems={trilhasFiltradas.length}
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Módulos</TableHead>
              <TableHead>Vídeos</TableHead>
              <TableHead>Materiais</TableHead>
              <TableHead>Exercícios</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trilhasFiltradas.map((trilha) => {
              const trilhaStat = stats?.find((s: any) => s.trilha_id === trilha.id);
              return (
                <TableRow key={trilha.id}>
                  <TableCell className="font-medium">{trilha.titulo}</TableCell>
                  <TableCell>
                    {trilha.categoria === 'aulas semanais' && (
                      <Badge variant="outline" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)', borderColor: 'hsl(var(--primary))' }}>
                        Aulas Semanais
                      </Badge>
                    )}
                    {trilha.categoria === 'núcleo' && (
                      <Badge variant="outline" style={{ backgroundColor: '#10B98120', borderColor: '#10B981' }}>
                        NÚCLEO
                      </Badge>
                    )}
                    {trilha.categoria === 'ferramentas' && (
                      <Badge variant="outline" style={{ backgroundColor: '#F59E0B20', borderColor: '#F59E0B' }}>
                        FERRAMENTAS
                      </Badge>
                    )}
                    {trilha.categoria === 'profissão' && (
                      <Badge variant="outline" style={{ backgroundColor: '#8B5CF620', borderColor: '#8B5CF6' }}>
                        PROFISSÃO
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{trilha.nivel}</Badge>
                  </TableCell>
                  <TableCell>{trilha.ordem}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{trilhaStat?.total_modulos || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{trilhaStat?.total_videos || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{trilhaStat?.total_materiais || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{trilhaStat?.total_exercicios || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant={trilha.ativo ? "default" : "secondary"}>
                        {trilha.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                      {trilha.ativo && !trilha.visivel_mentorados && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/50">
                          Rascunho
                        </Badge>
                      )}
                      {trilha.ativo && trilha.visivel_mentorados && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/50">
                          Publicado
                        </Badge>
                      )}
                      {trilha.visivel_visitantes && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/50">
                          👁️ Visitantes
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(trilha)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(trilha.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <TrilhaModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        trilha={editingTrilha}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão Permanente</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="font-semibold text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Esta ação é IRREVERSÍVEL e irá deletar PERMANENTEMENTE:
              </p>
              {deleteId && (() => {
                const trilhaStat = stats?.find((s: any) => s.trilha_id === deleteId);
                const trilha = trilhas?.find((t) => t.id === deleteId);
                return (
                  <>
                    <div className="bg-muted p-3 rounded-md space-y-1 text-sm">
                      <p><strong>Trilha:</strong> {trilha?.titulo}</p>
                      <p><strong>• {trilhaStat?.total_modulos || 0}</strong> módulos</p>
                      <p><strong>• {trilhaStat?.total_videos || 0}</strong> vídeos</p>
                      <p><strong>• {trilhaStat?.total_materiais || 0}</strong> materiais</p>
                      <p><strong>• {trilhaStat?.total_exercicios || 0}</strong> exercícios práticos</p>
                      <p className="text-muted-foreground mt-2">+ Todo o progresso dos alunos nesta trilha</p>
                    </div>
                    <p className="text-sm">
                      Todos esses dados serão deletados <span className="font-bold">permanentemente</span> do banco de dados.
                    </p>
                  </>
                );
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
