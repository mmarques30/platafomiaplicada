import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCreateCategoria, useUpdateCategoria } from "@/hooks/admin/useCategorias";

interface CategoriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria?: any;
}

export function CategoriaModal({ open, onOpenChange, categoria }: CategoriaModalProps) {
  const createCategoria = useCreateCategoria();
  const updateCategoria = useUpdateCategoria();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  useEffect(() => {
    if (categoria) {
      reset({
        nome: categoria.nome || "",
        slug: categoria.slug || "",
        descricao: categoria.descricao || "",
        cor: categoria.cor || "#6366f1",
        ordem: categoria.ordem || 0,
        ativo: categoria.ativo !== undefined ? categoria.ativo : true,
      });
    } else {
      reset({ 
        nome: "", 
        slug: "", 
        descricao: "", 
        cor: "#6366f1",
        ordem: 0, 
        ativo: true 
      });
    }
  }, [categoria, reset, open]);

  const onSubmit = (data: any) => {
    if (categoria) {
      updateCategoria.mutate({ id: categoria.id, ...data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createCategoria.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  // Auto-gerar slug a partir do nome
  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value;
    const slug = nome
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9]+/g, "_") // Substitui espaços e caracteres especiais por _
      .replace(/^_+|_+$/g, ""); // Remove _ do início e fim
    
    setValue("slug", slug);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{categoria ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da Categoria</Label>
            <Input 
              {...register("nome")} 
              onChange={(e) => {
                register("nome").onChange(e);
                if (!categoria) handleNomeChange(e);
              }}
              placeholder="Ex: Aula ao Vivo"
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label>Slug (identificador único)</Label>
            <Input 
              {...register("slug")} 
              placeholder="Ex: aula_ao_vivo"
              required 
              disabled={!!categoria}
            />
            <p className="text-xs text-muted-foreground">
              Gerado automaticamente. Não use espaços ou caracteres especiais.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea {...register("descricao")} rows={3} placeholder="Descreva esta categoria..." />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Cor (opcional)</Label>
              <Input type="color" {...register("cor")} />
              <p className="text-xs text-muted-foreground">Cor para badges</p>
            </div>
            
            <div className="space-y-2">
              <Label>Ordem</Label>
              <Input type="number" {...register("ordem", { valueAsNumber: true })} />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch checked={watch("ativo")} onCheckedChange={(checked) => setValue("ativo", checked)} />
            <Label>Ativa</Label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{categoria ? "Atualizar" : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
