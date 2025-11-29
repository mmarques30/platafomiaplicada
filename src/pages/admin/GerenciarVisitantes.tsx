import { useState } from "react";
import { useVisitantes } from "@/hooks/useVisitantes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { EditVisitanteModal } from "@/components/admin/EditVisitanteModal";
import { Users, UserCheck, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function GerenciarVisitantes() {
  const { visitantes, isLoading, convertToMentorado, deleteVisitante } = useVisitantes();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedVisitante, setSelectedVisitante] = useState<typeof visitantes[0] | null>(null);

  const handleEdit = (visitante: typeof visitantes[0]) => {
    setSelectedVisitante(visitante);
    setEditModalOpen(true);
  };

  const handleConvert = (userId: string) => {
    setSelectedUserId(userId);
    setConvertDialogOpen(true);
  };

  const handleDelete = (userId: string) => {
    setSelectedUserId(userId);
    setDeleteDialogOpen(true);
  };

  const confirmConvert = () => {
    if (selectedUserId) {
      convertToMentorado.mutate(selectedUserId);
      setConvertDialogOpen(false);
      setSelectedUserId(null);
    }
  };

  const confirmDelete = () => {
    if (selectedUserId) {
      deleteVisitante.mutate(selectedUserId);
      setDeleteDialogOpen(false);
      setSelectedUserId(null);
    }
  };

  const totalVisitantes = visitantes.length;
  const visitantesAtivos = visitantes.filter(v => v.conta_ativa).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gerenciar Visitantes</h1>
        <p className="text-muted-foreground">
          Gerencie contas de visitantes e converta para mentorados
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Visitantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisitantes}</div>
            <p className="text-xs text-muted-foreground">
              {visitantesAtivos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversões Disponíveis</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{visitantesAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Podem ser convertidos para mentorados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Visitantes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Visitantes</CardTitle>
          <CardDescription>
            Gerencie todas as contas de visitantes cadastradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : visitantes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum visitante cadastrado
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Data Cadastro</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right w-[300px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitantes.map((visitante) => (
                    <TableRow key={visitante.id}>
                      <TableCell className="font-medium">
                        {visitante.nome_completo}
                      </TableCell>
                      <TableCell>{visitante.email}</TableCell>
                      <TableCell>{visitante.telefone || "-"}</TableCell>
                      <TableCell>
                        {visitante.created_at
                          ? format(new Date(visitante.created_at), "dd/MM/yyyy", { locale: ptBR })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {visitante.conta_ativa ? (
                          <Badge variant="default">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(visitante)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConvert(visitante.id)}
                            disabled={!visitante.conta_ativa}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Converter
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(visitante.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Conversão */}
      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Converter para Mentorado</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja converter este visitante em mentorado? Isso dará acesso completo à plataforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmConvert}>
              Converter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Edição */}
      <EditVisitanteModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        visitante={selectedVisitante}
      />

      {/* Dialog de Exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Visitante Permanentemente</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="text-destructive font-semibold">
                Esta ação é IRREVERSÍVEL. O visitante será excluído completamente do sistema.
              </p>
              <p>
                Tem certeza que deseja continuar?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
