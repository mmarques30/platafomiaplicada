import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Video } from "lucide-react";
import { useTrilhas, useDeleteTrilha } from "@/hooks/admin/useContent";
import { useVideos, useDeleteVideo } from "@/hooks/admin/useContent";
import { TrilhaModal } from "@/components/admin/content/TrilhaModal";
import { VideoModal } from "@/components/admin/content/VideoModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function GerenciarConteudo() {
  const { data: trilhas, isLoading: loadingTrilhas } = useTrilhas();
  const { data: videos, isLoading: loadingVideos } = useVideos();
  const deleteTrilha = useDeleteTrilha();
  const deleteVideo = useDeleteVideo();

  const [selectedTrilhaId, setSelectedTrilhaId] = useState<string | null>(null);
  const [isTrilhaModalOpen, setIsTrilhaModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [editingTrilha, setEditingTrilha] = useState<any>(null);
  const [editingVideo, setEditingVideo] = useState<any>(null);
  const [deleteTrilhaId, setDeleteTrilhaId] = useState<string | null>(null);
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);

  const selectedTrilha = trilhas?.find((t) => t.id === selectedTrilhaId);
  const trilhaVideos = videos?.filter((v) => v.trilha_id === selectedTrilhaId);

  const handleEditTrilha = (trilha: any) => {
    setEditingTrilha(trilha);
    setIsTrilhaModalOpen(true);
  };

  const handleNewTrilha = () => {
    setEditingTrilha(null);
    setIsTrilhaModalOpen(true);
  };

  const handleEditVideo = (video: any) => {
    setEditingVideo(video);
    setIsVideoModalOpen(true);
  };

  const handleNewVideo = () => {
    setEditingVideo(null);
    setIsVideoModalOpen(true);
  };

  const handleDeleteTrilha = () => {
    if (deleteTrilhaId) {
      deleteTrilha.mutate(deleteTrilhaId);
      setDeleteTrilhaId(null);
      if (selectedTrilhaId === deleteTrilhaId) {
        setSelectedTrilhaId(null);
      }
    }
  };

  const handleDeleteVideo = () => {
    if (deleteVideoId) {
      deleteVideo.mutate(deleteVideoId);
      setDeleteVideoId(null);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gerenciar Conteúdo</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda: Trilhas */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Trilhas</h2>
            <Button onClick={handleNewTrilha}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Trilha
            </Button>
          </div>

          {loadingTrilhas ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="space-y-2">
              {trilhas?.map((trilha) => (
                <div
                  key={trilha.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedTrilhaId === trilha.id ? "bg-muted border-primary" : ""
                  }`}
                  onClick={() => setSelectedTrilhaId(trilha.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold">{trilha.titulo}</h3>
                      <p className="text-sm text-muted-foreground">{trilha.descricao}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{trilha.nivel}</Badge>
                        <Badge variant={trilha.ativo ? "default" : "destructive"}>
                          {trilha.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTrilha(trilha);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTrilhaId(trilha.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Coluna Direita: Vídeos da Trilha Selecionada */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {selectedTrilha ? `Vídeos: ${selectedTrilha.titulo}` : "Vídeos"}
            </h2>
            {selectedTrilhaId && (
              <Button onClick={handleNewVideo}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Vídeo
              </Button>
            )}
          </div>

          {!selectedTrilhaId ? (
            <div className="text-center py-12 text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Selecione uma trilha para ver seus vídeos</p>
            </div>
          ) : loadingVideos ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : trilhaVideos && trilhaVideos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordem</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trilhaVideos.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell>{video.ordem}</TableCell>
                    <TableCell>{video.titulo}</TableCell>
                    <TableCell>{video.duracao ? `${video.duracao}min` : "-"}</TableCell>
                    <TableCell>
                      {video.ativo ? (
                        <Badge variant="default">Ativo</Badge>
                      ) : (
                        <Badge variant="destructive">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditVideo(video)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteVideoId(video.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhum vídeo cadastrado nesta trilha</p>
              <Button onClick={handleNewVideo} className="mt-4">
                Adicionar Primeiro Vídeo
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Modais */}
      <TrilhaModal
        open={isTrilhaModalOpen}
        onOpenChange={setIsTrilhaModalOpen}
        trilha={editingTrilha}
      />

      <VideoModal
        open={isVideoModalOpen}
        onOpenChange={setIsVideoModalOpen}
        video={editingVideo}
        defaultTrilhaId={selectedTrilhaId}
      />

      {/* Diálogos de Confirmação */}
      <AlertDialog open={!!deleteTrilhaId} onOpenChange={() => setDeleteTrilhaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar esta trilha? Todos os vídeos associados também serão deletados. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTrilha}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteVideoId} onOpenChange={() => setDeleteVideoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este vídeo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVideo}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
