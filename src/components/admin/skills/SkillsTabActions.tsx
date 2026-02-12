import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreVertical, Trash2, Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SkillsTabActionsProps {
  onClear: () => Promise<void>;
  onEdit?: () => void;
  clearLabel?: string;
  clearDescription?: string;
  editLabel?: string;
  hasData?: boolean;
}

export default function SkillsTabActions({
  onClear,
  onEdit,
  clearLabel = "Limpar Dados",
  clearDescription = "Todos os dados desta aba para a equipe selecionada serão removidos. Essa ação não pode ser desfeita.",
  editLabel = "Editar Dados",
  hasData = true,
}: SkillsTabActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClear = async () => {
    setClearing(true);
    try {
      await onClear();
      toast.success("Dados limpos com sucesso!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao limpar dados");
    } finally {
      setClearing(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-popover">
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              {editLabel}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => setConfirmOpen(true)}
            disabled={!hasData}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {clearLabel}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{clearLabel}</AlertDialogTitle>
            <AlertDialogDescription>{clearDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={clearing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear} disabled={clearing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {clearing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
