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
import { X } from "lucide-react";

interface PromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt?: any;
}

export function PromptModal({ open, onOpenChange, prompt }: PromptModalProps) {
  const { register, handleSubmit, reset, setValue } = useForm();
  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

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
            <Input id="categoria" {...register("categoria", { required: true })} />
          </div>

          <div>
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea id="prompt" {...register("prompt", { required: true })} rows={8} />
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
