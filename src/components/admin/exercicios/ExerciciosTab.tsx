import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useExercicios, useRespostasExercicios } from "@/hooks/useExercicios";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ExercicioModal } from "./ExercicioModal";
import { AvaliarRespostaModal } from "./AvaliarRespostaModal";
import { FilterBar } from "../content/FilterBar";
import { useTrilhas, useModulos, useVideos } from "@/hooks/admin/useContent";

export function ExerciciosTab() {
  const { data: exercicios, isLoading } = useExercicios();
  const { data: respostas } = useRespostasExercicios();
  const { data: trilhas } = useTrilhas();
  const { data: modulos } = useModulos();
  const { data: videos } = useVideos();
  const [exercicioModal, setExercicioModal] = useState<{ open: boolean; exercicio?: any }>({ open: false });
  const [respostaModal, setRespostaModal] = useState<{ open: boolean; resposta?: any }>({ open: false });
  
  // Estados de filtro (3 níveis em cascata)
  const [trilhaFilter, setTrilhaFilter] = useState<string>('todas');
  const [moduloFilter, setModuloFilter] = useState<string>('todos');
  const [videoFilter, setVideoFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const respostasPendentes = respostas?.filter(r => r.status === 'pendente' || r.status === 'em_avaliacao') || [];

  const handleClearFilters = () => {
    setTrilhaFilter('todas');
    setModuloFilter('todos');
    setVideoFilter('todos');
    setStatusFilter('todos');
  };

  // Resetar módulo quando trocar trilha
  useEffect(() => {
    if (trilhaFilter !== 'todas') {
      setModuloFilter('todos');
      setVideoFilter('todos');
    }
  }, [trilhaFilter]);

  // Resetar vídeo quando trocar módulo
  useEffect(() => {
    if (moduloFilter !== 'todos') {
      setVideoFilter('todos');
    }
  }, [moduloFilter]);

  // Módulos disponíveis baseados na trilha selecionada
  const modulosDisponiveis = useMemo(() => {
    if (trilhaFilter === 'todas') return modulos || [];
    return modulos?.filter(m => m.trilha_id === trilhaFilter) || [];
  }, [modulos, trilhaFilter]);

  // Vídeos disponíveis baseados no módulo selecionado
  const videosDisponiveis = useMemo(() => {
    if (moduloFilter === 'todos') {
      // Se tem trilha selecionada, mostrar vídeos dos módulos dessa trilha
      if (trilhaFilter !== 'todas') {
        const modulosIds = modulosDisponiveis.map(m => m.id);
        return videos?.filter(v => modulosIds.includes(v.modulo_id)) || [];
      }
      return videos || [];
    }
    return videos?.filter(v => v.modulo_id === moduloFilter) || [];
  }, [videos, moduloFilter, trilhaFilter, modulosDisponiveis]);

  // Filtrar exercícios
  const exerciciosFiltrados = useMemo(() => {
    return exercicios?.filter(exercicio => {
      // Filtro por vídeo
      if (videoFilter !== 'todos' && exercicio.video_id !== videoFilter) return false;
      
      // Filtro por módulo (através do vídeo)
      if (moduloFilter !== 'todos') {
        const video = videos?.find(v => v.id === exercicio.video_id);
        if (!video || video.modulo_id !== moduloFilter) return false;
      }
      
      // Filtro por trilha (através do vídeo e módulo)
      if (trilhaFilter !== 'todas') {
        const video = videos?.find(v => v.id === exercicio.video_id);
        if (!video) return false;
        const modulo = modulos?.find(m => m.id === video.modulo_id);
        if (!modulo || modulo.trilha_id !== trilhaFilter) return false;
      }
      
      // Filtro por status
      if (statusFilter === 'ativo' && !exercicio.ativo) return false;
      if (statusFilter === 'inativo' && exercicio.ativo) return false;
      
      return true;
    }) || [];
  }, [exercicios, videos, modulos, trilhaFilter, moduloFilter, videoFilter, statusFilter]);

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Exercícios Práticos</h2>
          <p className="text-muted-foreground">Gerencie exercícios e avalie respostas dos alunos</p>
        </div>
        <Button onClick={() => setExercicioModal({ open: true })}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Exercício
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
            id: 'video',
            label: 'Vídeo',
            placeholder: 'Todos os vídeos',
            value: videoFilter,
            onChange: setVideoFilter,
            options: [
              { value: 'todos', label: 'Todos os vídeos' },
              ...(videosDisponiveis.map(v => ({ value: v.id, label: v.titulo })) || []),
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
        ]}
        onClear={handleClearFilters}
        totalItems={exercicios?.length || 0}
        filteredItems={exerciciosFiltrados.length}
      />

      {/* Respostas Pendentes */}
      {respostasPendentes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Respostas Pendentes de Avaliação
              <Badge variant="destructive">{respostasPendentes.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {respostasPendentes.map((resposta) => (
                <div key={resposta.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{resposta.exercicios_praticos?.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      Resposta enviada
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setRespostaModal({ open: true, resposta })}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Avaliar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Exercícios */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Exercícios</CardTitle>
        </CardHeader>
        <CardContent>
          {!exercicios || exercicios.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum exercício cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {exerciciosFiltrados.map((exercicio) => (
                <div key={exercicio.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold">{exercicio.titulo}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{exercicio.descricao}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{exercicio.tipo_resposta}</Badge>
                      <Badge variant={exercicio.ativo ? 'default' : 'secondary'}>
                        {exercicio.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setExercicioModal({ open: true, exercicio })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {/* implement delete */}}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ExercicioModal
        open={exercicioModal.open}
        onOpenChange={(open) => setExercicioModal({ open })}
        exercicio={exercicioModal.exercicio}
      />

      <AvaliarRespostaModal
        open={respostaModal.open}
        onOpenChange={(open) => setRespostaModal({ open })}
        resposta={respostaModal.resposta}
      />
    </div>
  );
}
