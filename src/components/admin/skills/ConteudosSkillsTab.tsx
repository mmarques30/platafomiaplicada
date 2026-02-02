import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useConteudosLiberadosAdmin, useRemoveConteudoLiberado } from "@/hooks/admin/useConteudosSkillsAdmin";
import { AlertCircle, Plus, Trash2, BookOpen, Layers, Loader2, GripVertical } from "lucide-react";
import ConteudoLiberacaoModal from "./ConteudoLiberacaoModal";

interface ConteudosSkillsTabProps {
  equipeId: string | null;
}

export default function ConteudosSkillsTab({ equipeId }: ConteudosSkillsTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { data: conteudos, isLoading } = useConteudosLiberadosAdmin(equipeId);
  const removeConteudo = useRemoveConteudoLiberado();

  if (!equipeId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Selecione uma equipe</h3>
          <p className="text-muted-foreground text-center">
            Escolha uma equipe na aba "Equipes" para gerenciar conteúdos liberados.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleRemove = (id: string) => {
    if (confirm("Remover este conteúdo liberado?")) {
      removeConteudo.mutate({ id, equipeId });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Conteúdos Liberados</CardTitle>
              <CardDescription>
                Trilhas e módulos disponíveis para a equipe
              </CardDescription>
            </div>
            <Button onClick={() => setModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Conteúdo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {conteudos && conteudos.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conteudos.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    </TableCell>
                    <TableCell>
                      {item.trilha_id ? (
                        <Badge variant="outline" className="gap-1">
                          <BookOpen className="h-3 w-3" /> Trilha
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1">
                          <Layers className="h-3 w-3" /> Módulo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.trilha?.titulo || item.modulo?.titulo || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {item.motivo || "manual"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.id)}
                        disabled={removeConteudo.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum conteúdo liberado para esta equipe</p>
              <Button variant="link" onClick={() => setModalOpen(true)}>
                Adicionar primeiro conteúdo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ConteudoLiberacaoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        equipeId={equipeId}
      />
    </div>
  );
}
