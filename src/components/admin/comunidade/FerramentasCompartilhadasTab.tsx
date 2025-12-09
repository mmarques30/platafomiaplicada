import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Trash2, ExternalLink } from "lucide-react";
import { useFerramentasCompartilhadasAdmin } from "@/hooks/admin/useFerramentasCompartilhadasAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function FerramentasCompartilhadasTab() {
  const { ferramentas, isLoading, toggleAtivo, deleteFerramenta } = useFerramentasCompartilhadasAdmin();

  if (isLoading) {
    return (
      <Card className="border-border">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle>Ferramentas Compartilhadas pela Comunidade</CardTitle>
      </CardHeader>
      <CardContent>
        {!ferramentas || ferramentas.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            Nenhuma ferramenta compartilhada ainda.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ferramentas.map((ferramenta: any) => (
                <TableRow key={ferramenta.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{ferramenta.nome}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {ferramenta.descricao}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{ferramenta.categoria}</Badge>
                  </TableCell>
                  <TableCell>
                    {ferramenta.profiles?.nome_completo || "Anônimo"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(ferramenta.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={ferramenta.ativo}
                      onCheckedChange={(checked) => 
                        toggleAtivo({ id: ferramenta.id, ativo: checked })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {ferramenta.link && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(ferramenta.link, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir ferramenta?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. A ferramenta "{ferramenta.nome}" será removida permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteFerramenta(ferramenta.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
