import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PromptModal } from "./PromptModal";
import { usePromptsAdmin, useDeletePrompt } from "@/hooks/admin/useBibliotecas";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FilterBar } from "../content/FilterBar";

export function PromptsTab() {
  const { data: prompts, isLoading } = usePromptsAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deletePrompt = useDeletePrompt();

  const [filterNivel, setFilterNivel] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const handleEdit = (prompt: any) => {
    setEditingPrompt(prompt);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingPrompt(null);
    setIsModalOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deletePrompt.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const niveis = useMemo(() => {
    if (!prompts) return [];
    return Array.from(new Set(prompts.map(p => p.nivel_complexidade).filter(Boolean)));
  }, [prompts]);

  const categorias = useMemo(() => {
    if (!prompts) return [];
    return Array.from(new Set(prompts.map(p => p.categoria)));
  }, [prompts]);

  const filteredPrompts = useMemo(() => {
    if (!prompts) return [];
    
    return prompts.filter((prompt) => {
      if (filterNivel && prompt.nivel_complexidade !== filterNivel) return false;
      if (filterCategoria && prompt.categoria !== filterCategoria) return false;
      if (filterStatus === "ativo" && !prompt.ativo) return false;
      if (filterStatus === "inativo" && prompt.ativo) return false;
      return true;
    }).sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));
  }, [prompts, filterNivel, filterCategoria, filterStatus]);

  const clearFilters = () => {
    setFilterNivel("");
    setFilterCategoria("");
    setFilterStatus("");
  };

  const hasActiveFilters = filterNivel || filterCategoria || filterStatus;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Biblioteca de Prompts</h2>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Prompt
        </Button>
      </div>

      <FilterBar
        filters={[
          {
            id: "nivel",
            label: "Nível",
            placeholder: "Todos os níveis",
            options: niveis.map(n => ({ 
              value: n, 
              label: n === 'iniciante' ? '🟢 Iniciante' : 
                     n === 'intermediario' ? '🟡 Intermediário' : 
                     '🔴 Avançado' 
            })),
            value: filterNivel,
            onChange: setFilterNivel,
          },
          {
            id: "categoria",
            label: "Categoria",
            placeholder: "Todas as categorias",
            options: categorias.map(c => ({ value: c, label: c })),
            value: filterCategoria,
            onChange: setFilterCategoria,
          },
          {
            id: "status",
            label: "Status",
            placeholder: "Todos os status",
            options: [
              { value: "ativo", label: "Ativo" },
              { value: "inativo", label: "Inativo" },
            ],
            value: filterStatus,
            onChange: setFilterStatus,
          },
        ]}
        onClear={clearFilters}
        totalItems={prompts?.length || 0}
        filteredItems={filteredPrompts.length}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Título</TableHead>
            <TableHead className="w-[80px]">Ordem</TableHead>
            <TableHead className="w-[140px]">Nível</TableHead>
            <TableHead className="w-[180px]">Categoria</TableHead>
            <TableHead className="w-[200px]">Tags</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPrompts.map((prompt) => (
            <TableRow key={prompt.id}>
              <TableCell>{prompt.titulo}</TableCell>
              <TableCell>
                <Badge variant="outline">{prompt.ordem ?? '-'}</Badge>
              </TableCell>
              <TableCell>
                {prompt.nivel_complexidade ? (
                  <Badge 
                    className={
                      prompt.nivel_complexidade === 'iniciante' ? 'bg-green-500 text-white' :
                      prompt.nivel_complexidade === 'intermediario' ? 'bg-yellow-500 text-white' :
                      'bg-red-500 text-white'
                    }
                  >
                    {prompt.nivel_complexidade === 'iniciante' ? '🟢 Iniciante' :
                     prompt.nivel_complexidade === 'intermediario' ? '🟡 Intermediário' :
                     '🔴 Avançado'}
                  </Badge>
                ) : '-'}
              </TableCell>
              <TableCell>{prompt.categoria}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(prompt.tags) && prompt.tags.slice(0, 3).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {Array.isArray(prompt.tags) && prompt.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{prompt.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="w-[120px]">
                {prompt.ativo ? (
                  <Badge variant="default" className="whitespace-nowrap">Ativo</Badge>
                ) : (
                  <Badge variant="destructive" className="whitespace-nowrap">Inativo</Badge>
                )}
              </TableCell>
              <TableCell className="w-[100px]">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(prompt)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(prompt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PromptModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        prompt={editingPrompt}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este prompt? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
