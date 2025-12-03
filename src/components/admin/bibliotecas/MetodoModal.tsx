import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useCreateMetodo, useUpdateMetodo } from "@/hooks/admin/useBibliotecas";
import { FerramentasSelectorHibrido } from "./FerramentasSelectorHibrido";
import { METODOS_CATEGORIAS } from "@/lib/metodosCategories";

interface MetodoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  metodo?: any;
}

export function MetodoModal({ open, onOpenChange, metodo }: MetodoModalProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [ferramentasRecomendadas, setFerramentasRecomendadas] = useState<string[]>([]);
  const createMetodo = useCreateMetodo();
  const updateMetodo = useUpdateMetodo();
  
  const categoriaValue = watch("categoria");

  useEffect(() => {
    if (metodo) {
      reset(metodo);
      setFerramentasRecomendadas(metodo.ferramentas_recomendadas || []);
    } else {
      reset({
        titulo: "",
        descricao: "",
        categoria: "",
        template: "",
        exemplo: "",
        link_documento: "",
        ferramentas_recomendadas: [],
        ativo: true,
      });
      setFerramentasRecomendadas([]);
    }
  }, [metodo, reset]);

  const onSubmit = (data: any) => {
    const metodoData = {
      ...data,
      ferramentas_recomendadas: ferramentasRecomendadas,
    };

    if (metodo) {
      updateMetodo.mutate(
        { id: metodo.id, values: metodoData },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createMetodo.mutate(metodoData, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{metodo ? "Editar" : "Novo"} Método</DialogTitle>
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
              value={categoriaValue || ""}
              onValueChange={(value) => setValue("categoria", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {METODOS_CATEGORIAS.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="link_documento">Link do Documento (opcional)</Label>
            <Input 
              id="link_documento" 
              type="url"
              placeholder="https://docs.google.com/..." 
              {...register("link_documento")} 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Link para documento de apoio (Google Docs, Notion, PDF, etc.)
            </p>
          </div>

          <div>
            <Label htmlFor="template">Template</Label>
            <Textarea id="template" {...register("template", { required: true })} rows={8} />
          </div>

          <div>
            <Label htmlFor="exemplo">Exemplo (opcional)</Label>
            <Textarea id="exemplo" {...register("exemplo")} rows={6} />
          </div>

          <FerramentasSelectorHibrido
            value={ferramentasRecomendadas}
            onChange={setFerramentasRecomendadas}
          />

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              onCheckedChange={(checked) => setValue("ativo", checked)}
              defaultChecked={metodo?.ativo ?? true}
            />
            <Label htmlFor="ativo">Ativo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {metodo ? "Atualizar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
