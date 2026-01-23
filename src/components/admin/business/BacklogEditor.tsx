import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Sparkles, 
  Loader2, 
  Trash2,
  Plus,
  ListTodo,
  Edit2,
  Check,
  X
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BacklogItemEditable {
  titulo: string;
  descricao: string;
  categoria: 'Pós-MVP' | 'Melhorias Futuras' | 'Débito Técnico';
  prioridade: 'baixa' | 'media' | 'alta';
  selecionado: boolean;
  origem?: 'auto' | 'manual'; // Rastrear se foi extraído ou adicionado manualmente
}

interface BacklogEditorProps {
  initialItems?: BacklogItemEditable[];
  onItemsChange: (items: BacklogItemEditable[]) => void;
}

type EditorState = 'input' | 'processing' | 'review';

export function BacklogEditor({ initialItems = [], onItemsChange }: BacklogEditorProps) {
  const [state, setState] = useState<EditorState>(initialItems.length > 0 ? 'review' : 'input');
  const [rawText, setRawText] = useState("");
  const [items, setItems] = useState<BacklogItemEditable[]>(initialItems);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleOrganizar = async () => {
    if (!rawText.trim()) {
      toast.error("Cole o texto do backlog primeiro");
      return;
    }

    setIsProcessing(true);
    setState('processing');

    try {
      const { data, error } = await supabase.functions.invoke("organizar-backlog", {
        body: { texto: rawText.trim() }
      });

      if (error) throw error;

      const organizedItems: BacklogItemEditable[] = (data?.items || []).map((item: any) => ({
        titulo: item.titulo,
        descricao: item.descricao || '',
        categoria: item.categoria || 'Pós-MVP',
        prioridade: item.prioridade || 'media',
        selecionado: true,
        origem: 'auto' as const
      }));

      setItems(organizedItems);
      onItemsChange(organizedItems);
      setState('review');
      toast.success(`${organizedItems.length} itens organizados`);
    } catch (error) {
      console.error("Erro ao organizar backlog:", error);
      toast.error("Erro ao processar com IA");
      setState('input');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleItem = (index: number) => {
    const updated = items.map((item, i) => 
      i === index ? { ...item, selecionado: !item.selecionado } : item
    );
    setItems(updated);
    onItemsChange(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
    onItemsChange(updated);
  };

  const handleUpdateCategoria = (index: number, categoria: BacklogItemEditable['categoria']) => {
    const updated = items.map((item, i) => 
      i === index ? { ...item, categoria } : item
    );
    setItems(updated);
    onItemsChange(updated);
  };

  const handleUpdatePrioridade = (index: number, prioridade: BacklogItemEditable['prioridade']) => {
    const updated = items.map((item, i) => 
      i === index ? { ...item, prioridade } : item
    );
    setItems(updated);
    onItemsChange(updated);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingTitle(items[index].titulo);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    const updated = items.map((item, i) => 
      i === editingIndex ? { ...item, titulo: editingTitle } : item
    );
    setItems(updated);
    onItemsChange(updated);
    setEditingIndex(null);
    setEditingTitle("");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingTitle("");
  };

  const handleAddManual = () => {
    const newItem: BacklogItemEditable = {
      titulo: "Novo item",
      descricao: "",
      categoria: 'Pós-MVP',
      prioridade: 'media',
      selecionado: true,
      origem: 'manual'
    };
    const updated = [...items, newItem];
    setItems(updated);
    onItemsChange(updated);
    handleStartEdit(updated.length - 1);
  };

  const handleBackToInput = () => {
    setState('input');
  };

  const getCategoriaBadge = (categoria: string) => {
    const config: Record<string, string> = {
      'Pós-MVP': 'bg-blue-500/10 text-blue-700 border-blue-500/30',
      'Melhorias Futuras': 'bg-purple-500/10 text-purple-700 border-purple-500/30',
      'Débito Técnico': 'bg-orange-500/10 text-orange-700 border-orange-500/30'
    };
    return config[categoria] || config['Pós-MVP'];
  };

  const getPrioridadeBadge = (prioridade: string) => {
    const config: Record<string, { label: string; className: string }> = {
      'alta': { label: 'Alta', className: 'bg-red-500/10 text-red-700 border-red-500/30' },
      'media': { label: 'Média', className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' },
      'baixa': { label: 'Baixa', className: 'bg-gray-500/10 text-gray-600 border-gray-500/30' }
    };
    const c = config[prioridade] || config['media'];
    return c;
  };

  // Input state - show textarea
  if (state === 'input' || state === 'processing') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            Backlog / Futuras
          </p>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setState('review')}
              className="text-xs"
            >
              Ver itens ({items.length})
            </Button>
          )}
        </div>

        <Textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={`Cole os itens de backlog aqui...

Exemplos:
- Gestão de professores
- Agendamento de teste de proficiência
- CRM de escolas
- Remarketing personalizado
- Flash cards e cola digital`}
          className="min-h-[150px] text-sm font-mono"
        />

        <div className="flex gap-2">
          <Button
            onClick={handleOrganizar}
            disabled={isProcessing || !rawText.trim()}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Organizando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Organizar com IA
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleAddManual}
            disabled={isProcessing}
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar Manual
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          A IA irá categorizar e organizar os itens. Não irá inventar novos itens.
        </p>
      </div>
    );
  }

  // Contadores por origem
  const countAuto = items.filter(i => i.origem === 'auto').length;
  const countManual = items.filter(i => i.origem === 'manual' || !i.origem).length;

  // Review state - show organized items
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            Backlog ({items.filter(i => i.selecionado).length}/{items.length})
          </p>
          {countAuto > 0 && (
            <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
              <Sparkles className="h-3 w-3 mr-1" />
              {countAuto} extraídos
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToInput}
            className="text-xs"
          >
            + Adicionar mais
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddManual}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Manual
          </Button>
        </div>
      </div>

      <ScrollArea className="max-h-[250px]">
        <div className="space-y-2">
          {items.map((item, index) => (
            <div 
              key={index}
              className={`flex items-start gap-2 p-2 border rounded-lg transition-colors ${
                item.selecionado ? 'bg-background' : 'bg-muted/50 opacity-60'
              }`}
            >
              <Checkbox
                checked={item.selecionado}
                onCheckedChange={() => handleToggleItem(index)}
                className="mt-1"
              />

              <div className="flex-1 min-w-0 space-y-1">
                {editingIndex === index ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className="h-7 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSaveEdit}>
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCancelEdit}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium flex-1 truncate">{item.titulo}</p>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={() => handleStartEdit(index)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Select
                    value={item.categoria}
                    onValueChange={(value) => handleUpdateCategoria(index, value as BacklogItemEditable['categoria'])}
                  >
                    <SelectTrigger className="h-6 w-auto text-xs border-0 p-0">
                      <Badge variant="outline" className={`text-xs ${getCategoriaBadge(item.categoria)}`}>
                        {item.categoria}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pós-MVP">Pós-MVP</SelectItem>
                      <SelectItem value="Melhorias Futuras">Melhorias Futuras</SelectItem>
                      <SelectItem value="Débito Técnico">Débito Técnico</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={item.prioridade}
                    onValueChange={(value) => handleUpdatePrioridade(index, value as BacklogItemEditable['prioridade'])}
                  >
                    <SelectTrigger className="h-6 w-auto text-xs border-0 p-0">
                      <Badge variant="outline" className={`text-xs ${getPrioridadeBadge(item.prioridade).className}`}>
                        {getPrioridadeBadge(item.prioridade).label}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>

                  {item.origem === 'auto' && (
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Extraído
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemoveItem(index)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Nenhum item de backlog. Cole texto ou adicione manualmente.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
