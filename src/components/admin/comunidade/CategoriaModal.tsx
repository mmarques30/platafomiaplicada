import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface CategoriaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria?: any;
}

export function CategoriaModal({
  open,
  onOpenChange,
  categoria,
}: CategoriaModalProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [ordem, setOrdem] = useState(0);
  const [ativo, setAtivo] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (categoria) {
      setName(categoria.name);
      setEmoji(categoria.emoji || "");
      setOrdem(categoria.ordem);
      setAtivo(categoria.ativo);
    } else {
      setName("");
      setEmoji("");
      setOrdem(0);
      setAtivo(true);
    }
  }, [categoria]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const data = { name, emoji, ordem, ativo };

      if (categoria) {
        const { error } = await supabase
          .from("community_categories")
          .update(data)
          .eq("id", categoria.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("community_categories")
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-categories"] });
      toast.success(
        categoria
          ? "Categoria atualizada com sucesso!"
          : "Categoria criada com sucesso!"
      );
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Erro ao salvar categoria");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>
            {categoria ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Dúvidas, Casos de Sucesso..."
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <Label>Emoji (opcional)</Label>
            <Input
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="Ex: 💡, 🚀, ❓"
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div className="space-y-2">
            <Label>Ordem</Label>
            <Input
              type="number"
              value={ordem}
              onChange={(e) => setOrdem(Number(e.target.value))}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Ativa</Label>
            <Switch checked={ativo} onCheckedChange={setAtivo} />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!name || saveMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {saveMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
