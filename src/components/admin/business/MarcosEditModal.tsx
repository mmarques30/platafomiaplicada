import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { useUpdateEtapaMarcos } from "@/hooks/useEtapasBusiness";

interface MarcosEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  etapaId: string;
  marcos: string[];
}

export function MarcosEditModal({
  open,
  onOpenChange,
  etapaId,
  marcos: initialMarcos,
}: MarcosEditModalProps) {
  const [marcos, setMarcos] = useState<string[]>([]);
  const updateMarcos = useUpdateEtapaMarcos();

  useEffect(() => {
    if (open) {
      setMarcos(initialMarcos.length > 0 ? [...initialMarcos] : [""]);
    }
  }, [open, initialMarcos]);

  const handleAddMarco = () => {
    setMarcos([...marcos, ""]);
  };

  const handleRemoveMarco = (index: number) => {
    setMarcos(marcos.filter((_, i) => i !== index));
  };

  const handleUpdateMarco = (index: number, value: string) => {
    const updated = [...marcos];
    updated[index] = value;
    setMarcos(updated);
  };

  const handleSave = async () => {
    const filteredMarcos = marcos.filter((m) => m.trim() !== "");
    
    try {
      await updateMarcos.mutateAsync({
        etapaId,
        marcos: filteredMarcos,
      });
      toast.success("Marcos atualizados com sucesso");
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar marcos:", error);
      toast.error("Erro ao atualizar marcos");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Marcos</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {marcos.map((marco, index) => (
            <div key={index} className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                value={marco}
                onChange={(e) => handleUpdateMarco(index, e.target.value)}
                placeholder={`Marco ${index + 1}`}
              />
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-destructive hover:text-destructive"
                onClick={() => handleRemoveMarco(index)}
                disabled={marcos.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleAddMarco}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Marco
          </Button>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={updateMarcos.isPending}>
            {updateMarcos.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
