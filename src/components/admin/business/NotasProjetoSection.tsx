import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, StickyNote, Loader2, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNotasProjetoBusiness, NotaProjeto } from "@/hooks/useNotasProjetoBusiness";

const categoriaLabels: Record<string, string> = {
  geral: "Geral",
  reuniao: "Reunião",
  decisao: "Decisão",
  tecnico: "Técnico",
};

const categoriaColors: Record<string, string> = {
  geral: "bg-muted text-muted-foreground",
  reuniao: "bg-blue-500/10 text-blue-600",
  decisao: "bg-amber-500/10 text-amber-600",
  tecnico: "bg-emerald-500/10 text-emerald-600",
};

interface NotasProjetoSectionProps {
  contratoId: string;
  readOnly?: boolean;
}

function NotaCard({ nota, readOnly, onUpdate, onDelete }: {
  nota: NotaProjeto;
  readOnly?: boolean;
  onUpdate: (id: string, updates: Partial<{ titulo: string; conteudo: string; categoria: string }>) => void;
  onDelete: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [titulo, setTitulo] = useState(nota.titulo);
  const [conteudo, setConteudo] = useState(nota.conteudo || "");
  const [categoria, setCategoria] = useState(nota.categoria || "geral");
  const [dirty, setDirty] = useState(false);

  const handleSave = () => {
    onUpdate(nota.id, { titulo, conteudo, categoria });
    setDirty(false);
  };

  return (
    <Card className="border-border/50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardContent className="py-3 px-4 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              <StickyNote className="h-4 w-4 text-primary shrink-0" />
              <span className="font-medium text-sm flex-1 truncate">{nota.titulo}</span>
              <Badge variant="outline" className={`text-xs ${categoriaColors[nota.categoria] || categoriaColors.geral}`}>
                {categoriaLabels[nota.categoria] || nota.categoria}
              </Badge>
            </div>
          </CardContent>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
            {readOnly ? (
              <div className="prose prose-sm max-w-none">
                <h4 className="text-sm font-semibold mb-1">{nota.titulo}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{nota.conteudo || "Sem conteúdo."}</p>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <Input
                    value={titulo}
                    onChange={(e) => { setTitulo(e.target.value); setDirty(true); }}
                    placeholder="Título da anotação"
                    className="flex-1 h-8 text-sm"
                  />
                  <Select value={categoria} onValueChange={(v) => { setCategoria(v); setDirty(true); }}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoriaLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  value={conteudo}
                  onChange={(e) => { setConteudo(e.target.value); setDirty(true); }}
                  placeholder="Escreva suas anotações aqui... (suporta texto livre)"
                  rows={6}
                  className="text-sm"
                />
                <div className="flex justify-between items-center">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive h-7 text-xs">
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir anotação?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(nota.id)}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  {dirty && (
                    <Button size="sm" onClick={handleSave} className="h-7 text-xs">
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Salvar
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function NotasProjetoSection({ contratoId, readOnly = false }: NotasProjetoSectionProps) {
  const { notas, isLoading, createNota, updateNota, deleteNota } = useNotasProjetoBusiness(contratoId);

  const handleCreate = () => {
    createNota.mutate({ contrato_id: contratoId, titulo: "Nova anotação", categoria: "geral" });
  };

  const handleUpdate = (id: string, updates: Partial<{ titulo: string; conteudo: string; categoria: string }>) => {
    updateNota.mutate({ id, ...updates });
  };

  const handleDelete = (id: string) => {
    deleteNota.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex justify-end">
          <Button size="sm" onClick={handleCreate} disabled={createNota.isPending}>
            {createNota.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
            Nova Anotação
          </Button>
        </div>
      )}

      {notas.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <StickyNote className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma anotação</h3>
            <p className="text-muted-foreground text-sm">
              {readOnly ? "Anotações do projeto aparecerão aqui." : "Crie anotações para organizar informações do projeto."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notas.map((nota) => (
            <NotaCard
              key={nota.id}
              nota={nota}
              readOnly={readOnly}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
