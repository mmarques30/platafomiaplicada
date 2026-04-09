import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, ChevronDown, ChevronRight, StickyNote, Loader2, Save, List, ListOrdered, Smile, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotasProjetoBusiness, NotaProjeto } from "@/hooks/useNotasProjetoBusiness";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const emojiGroups = [
  { label: "Geral", emojis: ["✅", "❌", "⚠️", "💡", "🔥", "⭐", "❗", "❓", "👍", "👎", "🎯", "📌"] },
  { label: "Status", emojis: ["🟢", "🟡", "🔴", "🔵", "⏳", "🔄", "✔️", "🚫", "📊", "📈", "📉", "🏁"] },
  { label: "Objetos", emojis: ["📁", "📎", "📝", "📅", "💬", "🔗", "🔑", "⚙️", "🛠️", "📢", "💰", "🤝"] },
];

interface NotasProjetoSectionProps {
  contratoId: string;
  readOnly?: boolean;
}

function NotaCard({ nota, readOnly, autoOpen, onUpdate, onDelete }: {
  nota: NotaProjeto;
  readOnly?: boolean;
  autoOpen?: boolean;
  onUpdate: (id: string, updates: Partial<{ titulo: string; conteudo: string; categoria: string }>) => void;
  onDelete: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(autoOpen || false);
  const [titulo, setTitulo] = useState(nota.titulo);
  const [conteudo, setConteudo] = useState(nota.conteudo || "");
  const [categoria, setCategoria] = useState(nota.categoria || "geral");
  const [dirty, setDirty] = useState(false);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    onUpdate(nota.id, { titulo, conteudo, categoria });
    setDirty(false);
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setConteudo(prev => prev + text);
      setDirty(true);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = conteudo.substring(0, start) + text + conteudo.substring(end);
    setConteudo(newValue);
    setDirty(true);
    setTimeout(() => {
      textarea.focus();
      const pos = start + text.length;
      textarea.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleBullet = () => {
    const textarea = textareaRef.current;
    const pos = textarea?.selectionStart ?? conteudo.length;
    const needsNewline = pos > 0 && conteudo[pos - 1] !== "\n";
    insertAtCursor((needsNewline ? "\n" : "") + "• ");
  };

  const handleNumbered = () => {
    const textarea = textareaRef.current;
    const pos = textarea?.selectionStart ?? conteudo.length;
    const linesBefore = conteudo.substring(0, pos).split("\n");
    let lastNum = 0;
    for (let i = linesBefore.length - 1; i >= 0; i--) {
      const match = linesBefore[i].match(/^(\d+)\.\s/);
      if (match) { lastNum = parseInt(match[1]); break; }
      if (linesBefore[i].trim()) break;
    }
    const needsNewline = pos > 0 && conteudo[pos - 1] !== "\n";
    insertAtCursor((needsNewline ? "\n" : "") + `${lastNum + 1}. `);
  };

  const handleOrganize = async () => {
    if (!conteudo.trim()) {
      toast.error("Escreva algo antes de organizar");
      return;
    }
    setIsOrganizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("organizar-nota", {
        body: { conteudo },
      });
      if (error) throw error;
      if (data?.resultado) {
        setConteudo(data.resultado);
        setDirty(true);
        toast.success("Texto organizado!");
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Erro ao organizar texto");
    } finally {
      setIsOrganizing(false);
    }
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

                {/* Toolbar de formatação */}
                <div className="flex items-center gap-1 border border-border/50 rounded-md px-2 py-1 bg-muted/20">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleBullet} title="Bullet point">
                    <List className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleNumbered} title="Lista numerada">
                    <ListOrdered className="h-3.5 w-3.5" />
                  </Button>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Emojis">
                        <Smile className="h-3.5 w-3.5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2" align="start">
                      {emojiGroups.map((group) => (
                        <div key={group.label} className="mb-2">
                          <p className="text-xs font-medium text-muted-foreground mb-1">{group.label}</p>
                          <div className="grid grid-cols-6 gap-1">
                            {group.emojis.map((emoji) => (
                              <button
                                key={emoji}
                                className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted/50 text-base transition-colors"
                                onClick={() => insertAtCursor(emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </PopoverContent>
                  </Popover>

                  <div className="h-4 w-px bg-border/50 mx-1" />

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1"
                    onClick={handleOrganize}
                    disabled={isOrganizing || !conteudo.trim()}
                    title="Organizar texto com IA"
                  >
                    {isOrganizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    Organizar
                  </Button>
                </div>

                <Textarea
                  ref={textareaRef}
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
                  <Button size="sm" onClick={handleSave} disabled={!dirty} className="h-7 text-xs">
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Salvar
                  </Button>
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
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null);

  const handleCreate = () => {
    createNota.mutate(
      { contrato_id: contratoId, titulo: "Nova anotação", categoria: "geral" },
      {
        onSuccess: (data: any) => {
          if (data?.id) setLastCreatedId(data.id);
        },
      }
    );
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
              autoOpen={nota.id === lastCreatedId}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
