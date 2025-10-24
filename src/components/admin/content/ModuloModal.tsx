import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";

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
  const [selectedTrilhaCategoria, setSelectedTrilhaCategoria] = useState<string | null>(null);

  useEffect(() => {
    if (modulo) {
      reset({
        titulo: modulo.titulo || "",
        descricao: modulo.descricao || "",
        trilha_id: modulo.trilha_id || "",
        ordem: modulo.ordem || 0,
        ativo: modulo.ativo !== undefined ? modulo.ativo : true,
        data_inicio: modulo.data_inicio || null,
      });
      // Encontrar categoria da trilha atual
      const trilha = trilhas?.find((t: any) => t.id === modulo.trilha_id);
      setSelectedTrilhaCategoria(trilha?.categoria || null);
    } else {
      reset({ 
        titulo: "", 
        descricao: "", 
        trilha_id: "", 
        ordem: 0, 
        ativo: true, 
        data_inicio: null
      });
      setSelectedTrilhaCategoria(null);
    }
  }, [modulo, reset, open, trilhas]);

  const onSubmit = (data: any) => {
    // Remove o campo categoria do payload (será definido pelo trigger)
    const { categoria, ...submitData } = data;
    
    if (modulo) {
      updateModulo.mutate({ id: modulo.id, ...submitData }, { onSuccess: () => onOpenChange(false) });
    } else {
      createModulo.mutate(submitData, { onSuccess: () => onOpenChange(false) });
    }
  };

  // Atualizar categoria exibida quando trilha mudar
  const handleTrilhaChange = (value: string) => {
    setValue("trilha_id", value);
    const trilha = trilhas?.find((t: any) => t.id === value);
    setSelectedTrilhaCategoria(trilha?.categoria || null);
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
              <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                <Calendar
                  mode="single"
                  selected={watch("data_inicio") ? new Date(watch("data_inicio")) : undefined}
                  onSelect={(date) => setValue("data_inicio", date?.toISOString().split('T')[0])}
                  disabled={false}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Quando este módulo deve começar
            </p>
          </div>
          <div className="space-y-2">
            <Label>Trilha</Label>
            <Select 
              value={watch("trilha_id") || undefined} 
              onValueChange={handleTrilhaChange}
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

          {selectedTrilhaCategoria && (
            <div className="space-y-2">
              <Label>Categoria (herdada da trilha)</Label>
              <div>
                {selectedTrilhaCategoria === 'aulas semanais' && (
                  <Badge variant="outline" style={{ backgroundColor: 'hsl(var(--primary) / 0.1)', borderColor: 'hsl(var(--primary))' }}>
                    Aulas Semanais
                  </Badge>
                )}
                {selectedTrilhaCategoria === 'núcleo' && (
                  <Badge variant="outline" style={{ backgroundColor: '#10B98120', borderColor: '#10B981' }}>
                    NÚCLEO
                  </Badge>
                )}
                {selectedTrilhaCategoria === 'ferramentas' && (
                  <Badge variant="outline" style={{ backgroundColor: '#F59E0B20', borderColor: '#F59E0B' }}>
                    FERRAMENTAS
                  </Badge>
                )}
                {selectedTrilhaCategoria === 'profissão' && (
                  <Badge variant="outline" style={{ backgroundColor: '#8B5CF620', borderColor: '#8B5CF6' }}>
                    PROFISSÃO
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                O módulo herda automaticamente a categoria da trilha selecionada
              </p>
            </div>
          )}

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
