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
import { METODOS_CATEGORIAS, ARSENAL_TIPOS, ARSENAL_FERRAMENTAS, ARSENAL_NIVEIS } from "@/lib/metodosCategories";

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
  const tipoValue = watch("tipo");
  const ferramentaValue = watch("ferramenta");
  const nivelValue = watch("nivel");

  useEffect(() => {
    if (metodo) {
      reset(metodo);
      setFerramentasRecomendadas(metodo.ferramentas_recomendadas || []);
    } else {
      reset({
        titulo: "",
        descricao: "",
        categoria: "",
        tipo: "skill",
        ferramenta: "",
        nivel: "intermediario",
        imagem_url: "",
        link_documento: "",
        template: "",
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
      ferramentas_recomendadas: ferramentasRecomendadas,
      ferramenta: data.tipo === "skill" ? data.ferramenta || null : null,
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
          <DialogTitle>{metodo ? "Editar" : "Novo"} Item — Arsenal IA</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Tipo */}
          <div>
            <Label>Tipo *</Label>
            <Select
              value={tipoValue || "skill"}
              onValueChange={(value) => setValue("tipo", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {ARSENAL_TIPOS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ferramenta (só para skills) */}
          {tipoValue === "skill" && (
            <div>
              <Label>Ferramenta *</Label>
              <Select
                value={ferramentaValue || ""}
                onValueChange={(value) => setValue("ferramenta", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a ferramenta" />
                </SelectTrigger>
                <SelectContent>
                  {ARSENAL_FERRAMENTAS.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.icon} {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Nível */}
          <div>
            <Label>Nível</Label>
            <Select
              value={nivelValue || "intermediario"}
              onValueChange={(value) => setValue("nivel", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                {ARSENAL_NIVEIS.map((n) => (
                  <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" {...register("titulo", { required: true })} />
          </div>

          <div>
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea id="descricao" {...register("descricao", { required: true })} rows={3} />
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
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="template">Prompt / Template</Label>
            <Textarea 
              id="template" 
              {...register("template")} 
              rows={5}
              placeholder="Cole aqui o prompt, template ou instruções..."
            />
          </div>

          <div>
            <Label htmlFor="link_documento">Link do Documento (opcional)</Label>
            <Input 
              id="link_documento" 
              type="url"
              placeholder="https://docs.google.com/..." 
              {...register("link_documento")} 
            />
          </div>

          <div>
            <Label htmlFor="imagem_url">URL da Imagem (opcional)</Label>
            <Input 
              id="imagem_url" 
              type="url"
              placeholder="https://..." 
              {...register("imagem_url")} 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Imagem de capa para exibição na biblioteca
            </p>
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
