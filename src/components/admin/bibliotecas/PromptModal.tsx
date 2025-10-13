import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useCreatePrompt, useUpdatePrompt } from "@/hooks/admin/useBibliotecas";
import { Badge } from "@/components/ui/badge";
import { X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIAS_PROMPTS = [
  "Liderança",
  "Gestão de Projetos",
  "Produtividade",
  "Comunicação",
  "Análise de Dados",
  "Criação de Conteúdo",
  "Desenvolvimento",
  "Marketing",
  "Vendas",
  "RH e Pessoas",
  "Estratégia",
  "Outros",
] as const;

interface PromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt?: any;
}

export function PromptModal({ open, onOpenChange, prompt }: PromptModalProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (prompt) {
      reset(prompt);
      setTags(prompt.tags || []);
    } else {
      reset({
        titulo: "",
        descricao: "",
        categoria: "",
        prompt: "",
        tags: [],
        ativo: true,
      });
      setTags([]);
    }
  }, [prompt, reset]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar extensão
    const validExtensions = ['.txt', '.md', '.json'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "Formato não suportado",
        description: "Use arquivos .txt, .md ou .json",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setValue("prompt", content);
      toast({
        title: "Prompt importado com sucesso!",
        description: `${file.name} foi carregado. Você pode editar o conteúdo antes de salvar.`,
      });
      setIsImporting(false);
    };
    
    reader.onerror = () => {
      toast({
        title: "Erro ao ler arquivo",
        description: "Tente novamente ou digite o prompt manualmente.",
        variant: "destructive",
      });
      setIsImporting(false);
    };
    
    reader.readAsText(file);
    event.target.value = "";
  };

  const onSubmit = (data: any) => {
    const payload = { ...data, tags };
    if (prompt) {
      updatePrompt.mutate(
        { id: prompt.id, values: payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createPrompt.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{prompt ? "Editar" : "Novo"} Prompt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input id="titulo" {...register("titulo", { required: true })} />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" {...register("descricao", { required: true })} />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Select
              value={watch("categoria") || ""}
              onValueChange={(value) => setValue("categoria", value)}
            >
              <SelectTrigger id="categoria" className="w-full">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {CATEGORIAS_PROMPTS.map((categoria) => (
                  <SelectItem key={categoria} value={categoria}>
                    {categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!watch("categoria") && (
              <p className="text-sm text-destructive mt-1">Categoria é obrigatória</p>
            )}
          </div>

          <div>
            <Label htmlFor="file-upload">Importar Prompt de Arquivo (opcional)</Label>
            <div className="flex gap-2">
              <Input 
                id="file-upload" 
                type="file" 
                accept=".txt,.md,.json"
                onChange={handleFileUpload}
                disabled={isImporting}
                className="cursor-pointer"
              />
              <Button 
                type="button" 
                variant="outline" 
                disabled={isImporting}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? "Importando..." : "Selecionar"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Formatos aceitos: .txt, .md, .json (máx. 5MB)
            </p>
          </div>

          <div>
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea id="prompt" {...register("prompt", { required: true })} rows={8} />
            <p className="text-sm text-muted-foreground mt-1">
              Digite o prompt ou importe de um arquivo acima
            </p>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Digite uma tag e pressione Enter"
              />
              <Button type="button" onClick={addTag}>Adicionar</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              onCheckedChange={(checked) => setValue("ativo", checked)}
              defaultChecked={prompt?.ativo ?? true}
            />
            <Label htmlFor="ativo">Ativo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {prompt ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
