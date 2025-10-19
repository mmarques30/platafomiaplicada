import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userName: string;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  onConfirm,
  userName,
}: DeleteUserDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Tem certeza que deseja excluir o usuário <strong>{userName}</strong>?
            </p>
            <p className="text-destructive font-semibold">
              Esta ação é IRREVERSÍVEL e irá:
            </p>
            <ul className="list-disc ml-6 space-y-1 text-sm">
              <li>Deletar a conta de autenticação</li>
              <li>Remover o perfil do usuário</li>
              <li>Excluir todas as roles associadas</li>
              <li>Apagar todos os dados relacionados (dúvidas, tarefas, formulários, etc.)</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir Usuário
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
