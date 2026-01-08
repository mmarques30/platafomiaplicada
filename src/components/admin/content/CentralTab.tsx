import { useState } from "react";
import { Plus, Pencil, Trash2, Star, FileText, Newspaper, Lightbulb, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  useConteudosDashboardAdmin, 
  useDeleteConteudo,
  type ConteudoDashboardAdmin,
  type TipoConteudo
} from "@/hooks/admin/useConteudosDashboardAdmin";
import { ConteudoModal } from "./ConteudoModal";

const tipoIcons: Record<TipoConteudo, React.ReactNode> = {
  newsletter: <Newspaper className="h-4 w-4" />,
  noticia: <FileText className="h-4 w-4" />,
  dica: <Lightbulb className="h-4 w-4" />,
};

const tipoLabels: Record<TipoConteudo, string> = {
  newsletter: "Newsletter",
  noticia: "Notícia",
  dica: "Dica",
};

export function CentralTab() {
  const { data: conteudos, isLoading } = useConteudosDashboardAdmin();
  const deleteConteudo = useDeleteConteudo();
  
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConteudo, setEditingConteudo] = useState<ConteudoDashboardAdmin | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conteudoToDelete, setConteudoToDelete] = useState<ConteudoDashboardAdmin | null>(null);

  const conteudosFiltrados = conteudos?.filter(c => {
    if (filtroTipo !== "todos" && c.tipo !== filtroTipo) return false;
    if (filtroStatus === "ativo" && !c.ativo) return false;
    if (filtroStatus === "inativo" && c.ativo) return false;
    return true;
  });

  const handleEdit = (conteudo: ConteudoDashboardAdmin) => {
    setEditingConteudo(conteudo);
    setModalOpen(true);
  };

  const handleDelete = (conteudo: ConteudoDashboardAdmin) => {
    setConteudoToDelete(conteudo);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (conteudoToDelete) {
      deleteConteudo.mutate(conteudoToDelete.id);
      setDeleteDialogOpen(false);
      setConteudoToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingConteudo(null);
  };

  return (
    <div className="space-y-4">
      {/* Filtros e Ações */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-2">
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="newsletter">Newsletter</SelectItem>
              <SelectItem value="noticia">Notícia</SelectItem>
              <SelectItem value="dica">Dica</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Conteúdo
        </Button>
      </div>

      {/* Contagem */}
      <div className="text-sm text-muted-foreground">
        {conteudosFiltrados?.length ?? 0} conteúdo(s) encontrado(s)
      </div>

      {/* Tabela */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-center">Destaque</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Gratuitos</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : conteudosFiltrados?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum conteúdo encontrado
                </TableCell>
              </TableRow>
            ) : (
              conteudosFiltrados?.map((conteudo) => (
                <TableRow key={conteudo.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {conteudo.titulo}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {tipoIcons[conteudo.tipo]}
                      <span>{tipoLabels[conteudo.tipo]}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {conteudo.destaque && (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={conteudo.ativo ? "default" : "secondary"}>
                      {conteudo.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {conteudo.visivel_gratuitos ? (
                      <Eye className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground mx-auto" />
                    )}
                  </TableCell>
                  <TableCell>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(conteudo)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(conteudo)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Criação/Edição */}
      <ConteudoModal
        open={modalOpen}
        onClose={handleCloseModal}
        conteudo={editingConteudo}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conteúdo?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{conteudoToDelete?.titulo}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
