import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useCreateModulo, useUpdateModulo, useTrilhas } from "@/hooks/admin/useContent";

interface ModuloModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modulo?: any;
}

export function ModuloModal({ open, onOpenChange, modulo }: ModuloModalProps) {
  const { data: trilhas } = useTrilhas();
  const createModulo = useCreateModulo();
  const updateModulo = useUpdateModulo();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  useEffect(() => {
    if (modulo) {
      reset({
        titulo: modulo.titulo || "",
        descricao: modulo.descricao || "",
        trilha_id: modulo.trilha_id || "",
        ordem: modulo.ordem || 0,
        ativo: modulo.ativo !== undefined ? modulo.ativo : true,
        data_inicio: modulo.data_inicio || null,
        categoria: modulo.categoria || null,
      });
    } else {
      reset({ 
        titulo: "", 
        descricao: "", 
        trilha_id: "", 
        ordem: 0, 
        ativo: true, 
        data_inicio: null, 
        categoria: null 
      });
    }
  }, [modulo, reset, open]);

  const onSubmit = (data: any) => {
    if (modulo) {
      updateModulo.mutate({ id: modulo.id, ...data }, { onSuccess: () => onOpenChange(false) });
    } else {
      createModulo.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{modulo ? "Editar Módulo" : "Novo Módulo"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input {...register("titulo")} required />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea {...register("descricao")} rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !watch("data_inicio") && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {watch("data_inicio") 
                    ? format(new Date(watch("data_inicio")), "dd/MM/yyyy", { locale: ptBR })
                    : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={watch("data_inicio") ? new Date(watch("data_inicio")) : undefined}
                  onSelect={(date) => setValue("data_inicio", date?.toISOString().split('T')[0])}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Quando este módulo deve começar
            </p>
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select 
              value={watch("categoria") || undefined}
              onValueChange={(value) => setValue("categoria", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aula_ao_vivo">Aula ao Vivo</SelectItem>
                <SelectItem value="gravacao_videos">Gravação de Vídeos</SelectItem>
                <SelectItem value="conteudo_mentorados">Conteúdo Específico para Mentorados</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Classifique o tipo de conteúdo deste módulo
            </p>
          </div>
          <div className="space-y-2">
            <Label>Trilha</Label>
            <Select 
              value={watch("trilha_id") || undefined} 
              onValueChange={(value) => setValue("trilha_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma trilha" />
              </SelectTrigger>
              <SelectContent>
                {trilhas?.map((trilha: any) => (
                  <SelectItem key={trilha.id} value={trilha.id}>{trilha.titulo}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Ordem</Label>
            <Input type="number" {...register("ordem", { valueAsNumber: true })} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={watch("ativo")} onCheckedChange={(checked) => setValue("ativo", checked)} />
            <Label>Ativo</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{modulo ? "Atualizar" : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
