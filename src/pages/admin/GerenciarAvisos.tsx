import { useState } from "react";
import { useAvisos, useDeleteAviso } from "@/hooks/admin/useAvisos";
import { useAulasCalendario, useDeleteAula, AulaSemanal } from "@/hooks/useCalendarioAulas";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2 } from "lucide-react";
import { AvisoModal } from "@/components/admin/AvisoModal";
import { AulaSemanalModal } from "@/components/admin/AulaSemanalModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";

export default function GerenciarAvisos() {
  const { data: avisos, isLoading } = useAvisos();
  const { data: aulas, isLoading: isLoadingAulas } = useAulasCalendario();
  const deleteAviso = useDeleteAviso();
  const deleteAula = useDeleteAula();
  
  const [editingAviso, setEditingAviso] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [editingAula, setEditingAula] = useState<AulaSemanal | null>(null);
  const [isAulaModalOpen, setIsAulaModalOpen] = useState(false);
  const [deleteAulaId, setDeleteAulaId] = useState<string | null>(null);

  if (isLoading) return <div>Carregando...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gerenciar Avisos e Conteúdo</h1>

      <Tabs defaultValue="avisos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="avisos">Avisos</TabsTrigger>
          <TabsTrigger value="aula-semanal">Aula Semanal</TabsTrigger>
        </TabsList>

        <TabsContent value="avisos" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Aviso
            </Button>
          </div>

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
                {avisos?.map((aviso) => (
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
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="aula-semanal" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setEditingAula(null); setIsAulaModalOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Aula
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tema</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingAulas ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Carregando...</TableCell>
                  </TableRow>
                ) : aulas && aulas.length > 0 ? (
                  aulas.map((aula) => (
                    <TableRow key={aula.id}>
                      <TableCell className="font-medium">{aula.tema}</TableCell>
                      <TableCell>
                        {aula.data_aula ? format(new Date(aula.data_aula), "dd/MM/yyyy") : "-"}
                      </TableCell>
                      <TableCell>{aula.horario || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={aula.ativo ? "default" : "secondary"}>
                          {aula.ativo ? "Ativa" : "Inativa"}
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
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhuma aula cadastrada
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
            <AlertDialogTitle>Confirmar exclusão da aula</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta aula? Esta ação não pode ser desfeita.
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
