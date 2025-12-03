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
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
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
        link_documento: "",
        comentarios: "",
        ferramentas_recomendadas: [],
        ativo: true,
      });
      setFerramentasRecomendadas([]);
    }
  }, [metodo, reset]);

  const onSubmit = (data: any) => {
    const metodoData = {
      ...data,
      template: data.link_documento || "Via documento externo",
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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{metodo ? "Editar" : "Novo"} Método</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" {...register("titulo", { required: true })} />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea id="descricao" {...register("descricao", { required: true })} rows={3} />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria *</Label>
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
            <Label htmlFor="link_documento">Link do Documento *</Label>
            <Input 
              id="link_documento" 
              type="url"
              placeholder="https://docs.google.com/..." 
              {...register("link_documento", { required: "Link do documento é obrigatório" })} 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Link para o template completo (Google Docs, Notion, PDF, etc.)
            </p>
            {errors.link_documento && (
              <p className="text-xs text-destructive mt-1">{errors.link_documento.message as string}</p>
            )}
          </div>

          <div>
            <Label htmlFor="comentarios">Comentários / Dicas de Uso</Label>
            <Textarea 
              id="comentarios" 
              {...register("comentarios")} 
              rows={3}
              placeholder="Observações, dicas de aplicação, contexto de uso..."
            />
          </div>

          <FerramentasSelectorHibrido
            value={ferramentasRecomendadas}
            onChange={setFerramentasRecomendadas}
            label="Ferramentas onde aplicar"
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
