import { useState, useMemo, useEffect } from "react";
import { useVideos, useDeleteVideo, useTrilhas, useModulos } from "@/hooks/admin/useContent";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { VideoModal } from "./VideoModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FilterBar } from "./FilterBar";
import { getYouTubeThumbnail } from "@/lib/youtube";

export function VideosTab() {
  const { data: videos, isLoading } = useVideos();
  const { data: trilhas } = useTrilhas();
  const { data: modulos } = useModulos();
  const deleteVideo = useDeleteVideo();
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Estados de filtro
  const [trilhaFilter, setTrilhaFilter] = useState<string>('todas');
  const [moduloFilter, setModuloFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [statusVisibilidade, setStatusVisibilidade] = useState<string>('todos');

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) setEditingVideo(null);
  };

  const handleClearFilters = () => {
    setTrilhaFilter('todas');
    setModuloFilter('todos');
    setStatusFilter('todos');
    setStatusVisibilidade('todos');
  };

  // Resetar módulo quando trocar trilha
  useEffect(() => {
    if (trilhaFilter !== 'todas') {
      setModuloFilter('todos');
    }
  }, [trilhaFilter]);

  // Módulos disponíveis baseados na trilha selecionada
  const modulosDisponiveis = useMemo(() => {
    if (trilhaFilter === 'todas') return modulos || [];
    return modulos?.filter(m => m.trilha_id === trilhaFilter) || [];
  }, [modulos, trilhaFilter]);

  // Filtrar vídeos
  const videosFiltrados = useMemo(() => {
    return videos?.filter(video => {
      // Filtro por trilha (através do módulo)
      if (trilhaFilter !== 'todas') {
        const modulo = modulos?.find(m => m.id === video.modulo_id);
        if (!modulo || modulo.trilha_id !== trilhaFilter) return false;
      }
      // Filtro por módulo
      if (moduloFilter !== 'todos' && video.modulo_id !== moduloFilter) return false;
      // Filtro por status
      if (statusFilter === 'ativo' && !video.ativo) return false;
      if (statusFilter === 'inativo' && video.ativo) return false;
      
      // Filtro de visibilidade
      if (statusVisibilidade === 'publicado' && (!video.ativo || !video.visivel_mentorados)) return false;
      if (statusVisibilidade === 'rascunho' && (!video.ativo || video.visivel_mentorados)) return false;
      if (statusVisibilidade === 'arquivado' && video.ativo) return false;
      
      return true;
    }) || [];
  }, [videos, modulos, trilhaFilter, moduloFilter, statusFilter, statusVisibilidade]);

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Vídeos</h2>
        <Button onClick={() => { setEditingVideo(null); setIsModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Vídeo
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
            id: 'modulo',
            label: 'Módulo',
            placeholder: 'Todos os módulos',
            value: moduloFilter,
            onChange: setModuloFilter,
            options: [
              { value: 'todos', label: 'Todos os módulos' },
              ...(modulosDisponiveis.map(m => ({ value: m.id, label: m.titulo })) || []),
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
        totalItems={videos?.length || 0}
        filteredItems={videosFiltrados.length}
      />

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Thumb</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Materiais</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videosFiltrados.map((video: any) => {
              let totalMateriais = 0;
              if (Array.isArray(video.materiais)) {
                totalMateriais = video.materiais.length;
              } else if (typeof video.materiais === "string") {
                try { 
                  totalMateriais = (JSON.parse(video.materiais) || []).length; 
                } catch {}
              }
              return (
                <TableRow key={video.id}>
                  <TableCell>
                    <img 
                      src={getYouTubeThumbnail(video.youtube_id, video.thumbnail_customizado_url)} 
                      alt={video.titulo}
                      className="w-20 h-11 object-cover rounded border"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{video.titulo}</TableCell>
                  <TableCell>{video.modulo?.titulo}</TableCell>
                  <TableCell>{video.duracao ? `${video.duracao}min` : "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{totalMateriais}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Badge variant={video.ativo ? "default" : "secondary"}>
                        {video.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                      {video.ativo && !video.visivel_mentorados && (
                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/50">
                          Rascunho
                        </Badge>
                      )}
                      {video.ativo && video.visivel_mentorados && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/50">
                          Publicado
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingVideo(video); setIsModalOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(video.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <VideoModal 
        key={editingVideo?.id ?? "new"}
        open={isModalOpen} 
        onOpenChange={handleOpenChange} 
        video={editingVideo} 
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja deletar este vídeo?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) deleteVideo.mutate(deleteId); setDeleteId(null); }}>
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
