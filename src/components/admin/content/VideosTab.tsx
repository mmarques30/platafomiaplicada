import { useState } from "react";
import { useVideos, useDeleteVideo } from "@/hooks/admin/useContent";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { VideoModal } from "./VideoModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function VideosTab() {
  const { data: videos, isLoading } = useVideos();
  const deleteVideo = useDeleteVideo();
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Vídeos</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Vídeo
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Materiais</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos?.map((video: any) => {
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
                  <TableCell className="font-medium">{video.titulo}</TableCell>
                  <TableCell>{video.modulo?.titulo}</TableCell>
                  <TableCell>{video.duracao ? `${video.duracao}min` : "-"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{totalMateriais}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={video.ativo ? "default" : "secondary"}>
                      {video.ativo ? "Ativo" : "Inativo"}
                    </Badge>
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

      <VideoModal open={isModalOpen} onOpenChange={setIsModalOpen} video={editingVideo} />

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
